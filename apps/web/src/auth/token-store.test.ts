import { describe, expect, test } from "bun:test";
import { AUTH_STORAGE_KEY, toSessionRecord } from "@trips-app/auth";
import type { SessionRecord, SessionTokenPayload } from "@trips-app/auth";

import { createMemoryTokenStore, createWebTokenStore, type StorageLike } from "./token-store";

/** A `localStorage` stand-in that can be told to throw, like Safari private mode. */
class FakeStorage implements StorageLike {
  readonly data = new Map<string, string>();
  throwOnWrite = false;
  throwOnRead = false;

  getItem(key: string): string | null {
    if (this.throwOnRead) throw new Error("SecurityError");
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.throwOnWrite) throw new Error("QuotaExceededError");
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

function base64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function payload(): SessionTokenPayload {
  const token = `${base64UrlJson({ alg: "HS256" })}.${base64UrlJson({ sub: "acct_1" })}.sig`;
  return {
    sessionId: "sess_1",
    accessToken: token,
    refreshToken: "refresh_1",
    accessTokenExpiresInSeconds: 900,
    sessionMaxExpiresAt: "2026-10-17T23:00:00.000Z",
    activeRole: "traveler",
    adminSubRole: null,
    activeTenantId: null,
    planTier: "free",
    permissions: null,
    moderatorVehicleId: null,
    moderatorTripId: null,
  };
}

function record(): SessionRecord {
  return toSessionRecord(payload(), 1_000);
}

describe("Unit: memory store (SSR / fallback)", () => {
  test("round trips a record and clears it", () => {
    const store = createMemoryTokenStore();
    expect(store.read()).toBeNull();

    store.write(record());
    expect(store.read()?.accessToken).toBe(record().accessToken);

    store.clear();
    expect(store.read()).toBeNull();
  });

  test("is always memory-only", () => {
    expect(createMemoryTokenStore().isMemoryOnly).toBe(true);
  });

  test("a corrupt value reads as absent", () => {
    const store = createMemoryTokenStore({ initialRaw: "{not json" });
    expect(store.read()).toBeNull();
  });
});

describe("Unit: web store over localStorage", () => {
  test("writes exactly one key", () => {
    const storage = new FakeStorage();
    const store = createWebTokenStore({ storage });

    store.write(record());

    expect(storage.data.size).toBe(1);
    expect(storage.data.has(AUTH_STORAGE_KEY)).toBe(true);
    expect(store.read()?.refreshToken).toBe("refresh_1");
  });

  test("clear removes the key", () => {
    const storage = new FakeStorage();
    const store = createWebTokenStore({ storage });

    store.write(record());
    store.clear();

    expect(storage.data.has(AUTH_STORAGE_KEY)).toBe(false);
    expect(store.read()).toBeNull();
  });

  test("never touches another key (S5)", () => {
    const storage = new FakeStorage();
    storage.setItem("trips.theme", "dark");
    storage.setItem("trips.locale", "ar");
    const store = createWebTokenStore({ storage });

    store.write(record());
    store.clear();

    expect(storage.data.get("trips.theme")).toBe("dark");
    expect(storage.data.get("trips.locale")).toBe("ar");
  });

  test("falls back to memory when setItem throws (Safari private mode)", () => {
    const storage = new FakeStorage();
    storage.throwOnWrite = true;
    const store = createWebTokenStore({ storage });

    store.write(record());

    expect(store.isMemoryOnly).toBe(true);
    // The session still works for this page, it is just not persisted.
    expect(store.read()?.accessToken).toBe(record().accessToken);
    expect(storage.data.size).toBe(0);
  });

  test("falls back to memory when getItem throws", () => {
    const storage = new FakeStorage();
    storage.throwOnRead = true;
    const store = createWebTokenStore({ storage });

    expect(store.read()).toBeNull();
    store.write(record());
    expect(store.read()?.accessToken).toBe(record().accessToken);
  });

  test("an explicit null storage selects the memory adapter", () => {
    const store = createWebTokenStore({ storage: null });
    expect(store.isMemoryOnly).toBe(true);
  });

  test("without a window (SSR) no localStorage is touched", () => {
    // bun:test has no `window`, which is exactly the SSR condition.
    const store = createWebTokenStore();
    expect(store.isMemoryOnly).toBe(true);

    store.write(record());
    expect(store.read()?.accessToken).toBe(record().accessToken);
  });

  test("the key is the shared convention", () => {
    expect(createMemoryTokenStore().key).toBe("trips.auth.v1");
    expect(createWebTokenStore({ storage: new FakeStorage() }).key).toBe(AUTH_STORAGE_KEY);
  });
});
