// The auth state machine (PRD §7.2–7.4, ARCHITECTURE §4.1).
//
// Plain TypeScript: no React, no DOM, no router. Constructed once in ./instance.ts and shared by
// `utils/orpc.ts` (transport) and the router (guards), so there is exactly one session in the tab.
import {
  SessionExpiredError,
  isMaxSessionReason,
  isSessionExpired,
  needsRefreshOnError,
  shouldRefreshBeforeCall,
  toSessionRecord,
  withRotatedTokens,
} from "@trips-app/auth";
import type {
  AuthActor,
  AuthStatus,
  AuthTransportError,
  RefreshTokenPayload,
  SessionRecord,
  SessionTokenPayload,
} from "@trips-app/auth";

import type { TokenStore } from "./token-store";

/** One procedure call, already authenticated. Throws on failure. */
export type RpcCall = (procedure: string, input?: unknown) => Promise<unknown>;

/** What React reads through `useSyncExternalStore`. */
export interface SessionSnapshot {
  status: AuthStatus;
  actor: AuthActor | null;
  record: SessionRecord | null;
}

export interface SessionControllerOptions {
  store: TokenStore;
  /** Raw transport used for refresh/sign-out/getSession: it must bypass the interceptor (R3). */
  call: RpcCall;
  now?: () => number;
  /** Called after the store is cleared because the session ended (F1). */
  onExpired?: (info: { maxSessionReached: boolean }) => void;
}

/** The initial snapshot: identical on the server and on the first client render (§4.3). */
export const LOADING_SNAPSHOT: SessionSnapshot = {
  status: "loading",
  actor: null,
  record: null,
};

export class SessionController {
  private readonly store: TokenStore;
  private readonly call: RpcCall;
  private readonly now: () => number;
  private readonly onExpired?: (info: { maxSessionReached: boolean }) => void;

  private snapshot: SessionSnapshot = LOADING_SNAPSHOT;
  private readonly listeners = new Set<() => void>();
  /** R3: one in-flight refresh shared by every concurrent caller. */
  private inflight: Promise<SessionRecord> | null = null;
  private hydrated = false;
  /** Whether the last expiry was the 12-hour cap (F2: the notice wording differs). */
  private maxSessionReached = false;

  constructor(options: SessionControllerOptions) {
    this.store = options.store;
    this.call = options.call;
    this.now = options.now ?? (() => Date.now());
    this.onExpired = options.onExpired;
  }

  /** Stable reference for `useSyncExternalStore`. */
  getSnapshot = (): SessionSnapshot => this.snapshot;

  /** The snapshot the server renders, so hydration cannot mismatch. */
  getServerSnapshot = (): SessionSnapshot => LOADING_SNAPSHOT;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** The bearer for the next request, or null when signed out. */
  accessToken = (): string | null => this.store.read()?.accessToken ?? null;

  /** The stored record, for callers that need both tokens (sign-out). */
  getRecord = (): SessionRecord | null => this.store.read();

  /** Synchronous read of the store. Client-only: never call it during SSR. */
  hydrate = (): void => {
    this.hydrated = true;
    const record = this.store.read();
    if (!record) {
      this.setSnapshot("anonymous", null, null);
      return;
    }
    if (isSessionExpired(record, this.now())) {
      this.expire(false);
      return;
    }
    this.setSnapshot("authenticated", record.actor, record);
  };

  /**
   * Boot sequence: hydrate from the store, then call `auth/getSession` **only** when the cached actor
   * is absent. A stored record with an actor needs no network round trip (AC-4).
   */
  restore = async (): Promise<void> => {
    if (!this.hydrated) this.hydrate();
    const record = this.store.read();
    if (!record) return;
    if (this.snapshot.status !== "authenticated") return;
    if (record.actor.accountId) return;

    try {
      const response = (await this.call("auth/getSession")) as { actor?: AuthActor } | null;
      const actor = response?.actor;
      if (actor && typeof actor.accountId === "string") {
        const next: SessionRecord = { ...record, actor };
        this.store.write(next);
        this.setSnapshot("authenticated", actor, next);
      }
    } catch {
      // A failed probe must not sign the user out; the next authenticated call will refresh or fail.
    }
  };

  /**
   * R1/R6 before an authenticated call.
   *
   * Returns null when there is no session (anonymous calls must never wait). Throws
   * `SessionExpiredError` when the 12-hour cap has passed: no network call is made and the request
   * that triggered it is rejected (F3).
   */
  ensureFresh = async (): Promise<SessionRecord | null> => {
    const record = this.store.read();
    if (!record) {
      // After an expiry the store is already empty, but the caller must still get the typed
      // rejection instead of a bare 401 (F3).
      if (this.snapshot.status === "sessionExpired") {
        throw new SessionExpiredError(
          this.maxSessionReached
            ? "The 12-hour session limit has been reached."
            : "The session has expired.",
          this.maxSessionReached,
        );
      }
      return null;
    }

    const now = this.now();
    if (isSessionExpired(record, now)) {
      this.expire(true);
      throw new SessionExpiredError("The 12-hour session limit has been reached.", true);
    }
    if (!shouldRefreshBeforeCall(record, now)) return record;
    return this.refreshOnce();
  };

  /** R2/R3/R5: one refresh, shared by every concurrent caller. */
  refreshOnce = (): Promise<SessionRecord> => {
    if (this.inflight) return this.inflight;

    const promise = this.doRefresh().finally(() => {
      if (this.inflight === promise) this.inflight = null;
    });
    this.inflight = promise;
    return promise;
  };

  /**
   * The reactive half of R2: returns true when the caller should replay the original request
   * exactly once. Never throws — a failed refresh has already moved the state to `sessionExpired`.
   */
  handleAuthError = async (error: AuthTransportError): Promise<boolean> => {
    const decision = needsRefreshOnError({
      status: error.status,
      code: error.code,
      procedure: error.procedure ?? "",
    });
    if (!decision) return false;
    // R4: nothing to refresh with.
    if (!this.store.read()?.refreshToken) return false;

    try {
      await this.refreshOnce();
      return true;
    } catch {
      return false;
    }
  };

  /** S1–S5: revoke server-side when possible, clear locally always. */
  signOut = async (allDevices = false): Promise<void> => {
    const record = this.store.read();
    try {
      if (record) {
        await this.call("auth/signOut", { refreshToken: record.refreshToken, allDevices });
      }
    } catch {
      // S3: the local session is cleared even when the network call fails.
    } finally {
      this.clearSession("anonymous");
    }
  };

  /** Adopts a session returned by signIn / verifyOtp / adminVerifyTotp / staffVerifySecondFactor. */
  adoptSession = (payload: SessionTokenPayload): SessionRecord => {
    const record = toSessionRecord(payload, this.now());
    this.store.write(record);
    this.maxSessionReached = false;
    this.setSnapshot("authenticated", record.actor, record);
    return record;
  };

  /**
   * Adopts an access-token-only rotation (P1 switchRole / switchOrganization): the refresh token is
   * deliberately left untouched.
   */
  adoptTokens = (rotation: RefreshTokenPayload): SessionRecord | null => {
    const record = this.store.read();
    if (!record) return null;
    const next: SessionRecord = {
      ...record,
      accessToken: rotation.accessToken,
      accessTokenExpiresAt: this.now() + rotation.accessTokenExpiresInSeconds * 1000,
    };
    this.store.write(next);
    this.setSnapshot("authenticated", next.actor, next);
    return next;
  };

  /** Clears the store and moves to `status`. Used by sign-out and by every F1 path. */
  clearSession = (status: AuthStatus = "anonymous"): void => {
    this.store.clear();
    this.inflight = null;
    this.maxSessionReached = false;
    this.setSnapshot(status, null, null);
  };

  /** Whether a refresh is currently in flight — asserted by the single-flight test. */
  get isRefreshing(): boolean {
    return this.inflight !== null;
  }

  /** F2: whether the last expiry was the 12-hour cap (the notice wording differs). */
  get expiredByMaxSession(): boolean {
    return this.maxSessionReached;
  }

  private doRefresh = async (): Promise<SessionRecord> => {
    const record = this.store.read();
    if (!record) {
      throw new SessionExpiredError("There is no session to refresh.");
    }

    const now = this.now();
    if (isSessionExpired(record, now)) {
      this.expire(true);
      throw new SessionExpiredError("The 12-hour session limit has been reached.", true);
    }

    let response: RefreshTokenPayload;
    try {
      response = (await this.call("auth/refreshSession", {
        refreshToken: record.refreshToken,
      })) as RefreshTokenPayload;
    } catch (error) {
      // F1: any refresh failure ends the session — no retry, no redirect loop.
      this.expire(isMaxSessionReason(detailsOf(error)));
      throw new SessionExpiredError(
        "The refresh request failed.",
        isMaxSessionReason(detailsOf(error)),
      );
    }

    // R5: a rotation response without both tokens is a hard failure.
    if (
      !response ||
      typeof response.accessToken !== "string" ||
      response.accessToken.length === 0 ||
      typeof response.refreshToken !== "string" ||
      response.refreshToken.length === 0 ||
      typeof response.accessTokenExpiresInSeconds !== "number"
    ) {
      this.expire(false);
      throw new SessionExpiredError("The refresh response did not rotate both tokens.");
    }

    const next = withRotatedTokens(record, response, this.now());
    this.store.write(next);
    this.setSnapshot("authenticated", next.actor, next);
    return next;
  };

  /** F1: clear, publish `sessionExpired`, notify the app. */
  private expire(maxSessionReached: boolean): void {
    this.maxSessionReached = maxSessionReached;
    this.store.clear();
    this.inflight = null;
    this.setSnapshot("sessionExpired", null, null);
    try {
      this.onExpired?.({ maxSessionReached });
    } catch {
      // A misbehaving listener must not break the state machine.
    }
  }

  private setSnapshot(
    status: AuthStatus,
    actor: AuthActor | null,
    record: SessionRecord | null,
  ): void {
    if (
      this.snapshot.status === status &&
      this.snapshot.actor?.accountId === actor?.accountId &&
      this.snapshot.actor?.activeRole === actor?.activeRole &&
      this.snapshot.record?.accessToken === record?.accessToken &&
      this.snapshot.record?.refreshToken === record?.refreshToken
    ) {
      return;
    }

    this.snapshot = { status, actor, record };
    const listenersSnapshot = [...this.listeners];
    for (const listener of listenersSnapshot) {
      try {
        listener();
      } catch {
        // One broken subscriber must not stop the others.
      }
    }
  }
}

/** Builds a controller; the app uses the singleton in ./instance.ts. */
export function createSessionController(options: SessionControllerOptions): SessionController {
  return new SessionController(options);
}

/** Reads `details` from anything a transport can throw. */
function detailsOf(error: unknown): Record<string, unknown> | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const candidate = error as { details?: unknown; data?: unknown };
  if (isRecord(candidate.details)) return candidate.details;
  if (isRecord(candidate.data)) {
    const nested = candidate.data.error;
    if (isRecord(nested) && isRecord(nested.details)) return nested.details;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
