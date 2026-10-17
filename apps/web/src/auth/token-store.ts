// Token persistence for the web client (PRD §7.1, T1, P0-5).
//
// One namespaced key, one JSON record. On the server this module never touches `localStorage`
// (ARCHITECTURE §4.3), so no token can reach the SSR HTML.
import { AUTH_STORAGE_KEY, parseSessionRecord, serializeSessionRecord } from "@trips-app/auth";
import type { SessionRecord } from "@trips-app/auth";

/** The minimal storage surface this module needs; `localStorage` satisfies it. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** The persistence boundary the session controller depends on. */
export interface TokenStore {
  /** The stored record, or null when absent/corrupt. Never throws. */
  read(): SessionRecord | null;
  /** Persists the record. Never throws. */
  write(record: SessionRecord): void;
  /** Removes the record (S3: the single clearing operation). Never throws. */
  clear(): void;
  /** The storage key in use, for tests and diagnostics. */
  readonly key: string;
  /** True when persistence is unavailable and the store fell back to memory. */
  readonly isMemoryOnly: boolean;
}

/** A store backed by a single variable — used during SSR, in tests, and as the fallback. */
export function createMemoryTokenStore(
  options: { key?: string; initialRaw?: string | null } = {},
): TokenStore {
  const key = options.key ?? AUTH_STORAGE_KEY;
  let raw: string | null = options.initialRaw ?? null;

  return {
    key,
    isMemoryOnly: true,
    read(): SessionRecord | null {
      return parseSessionRecord(raw);
    },
    write(record: SessionRecord): void {
      raw = serializeSessionRecord(record);
    },
    clear(): void {
      raw = null;
    },
  };
}

/**
 * Wraps a `StorageLike` and degrades to memory the first time the platform throws.
 *
 * Safari private mode throws on `setItem` once the quota is zero, and some embedded webviews throw
 * on every access. Falling back keeps the user signed in for the current page instead of crashing
 * the sign-in flow.
 */
export function createResilientTokenStore(storage: StorageLike, key: string): TokenStore {
  let memory: string | null = null;
  let degraded = false;

  const read = (): string | null => {
    if (degraded) return memory;
    try {
      const value = storage.getItem(key);
      if (value !== null) memory = value;
      return value ?? memory;
    } catch {
      degraded = true;
      return memory;
    }
  };

  return {
    key,
    get isMemoryOnly(): boolean {
      return degraded;
    },
    read(): SessionRecord | null {
      return parseSessionRecord(read());
    },
    write(record: SessionRecord): void {
      const serialized = serializeSessionRecord(record);
      memory = serialized;
      if (degraded) return;
      try {
        storage.setItem(key, serialized);
      } catch {
        // Persistence is unavailable: keep the session in memory for this page.
        degraded = true;
      }
    },
    clear(): void {
      memory = null;
      if (degraded) return;
      try {
        storage.removeItem(key);
      } catch {
        degraded = true;
      }
    },
  };
}

/** Returns `window.localStorage` when it is usable, else null. Never throws. */
function browserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    if (!storage) return null;
    // A probe write catches Safari private mode and disabled-storage policies immediately.
    const probeKey = "__trips_auth_probe__";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

/**
 * The web token store.
 *
 * SSR (`typeof window === "undefined"`) always returns the memory adapter, so the server render is
 * token-free by construction. An injected `storage` (used by the unit tests) bypasses the probe.
 */
export function createWebTokenStore(
  options: { storage?: StorageLike | null; key?: string } = {},
): TokenStore {
  const key = options.key ?? AUTH_STORAGE_KEY;

  if (options.storage !== undefined) {
    return options.storage === null
      ? createMemoryTokenStore({ key })
      : createResilientTokenStore(options.storage, key);
  }

  const storage = browserStorage();
  if (!storage) return createMemoryTokenStore({ key });
  return createResilientTokenStore(storage, key);
}
