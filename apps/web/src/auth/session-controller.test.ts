import { describe, expect, test } from "bun:test";
import { SessionExpiredError, toSessionRecord } from "@trips-app/auth";
import type { SessionRecord, SessionTokenPayload } from "@trips-app/auth";

import { SessionController } from "./session-controller";
import { createMemoryTokenStore, type TokenStore } from "./token-store";

const NOW = Date.parse("2026-10-17T12:00:00.000Z");

function base64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function accessToken(sub = "acct_1"): string {
  return `${base64UrlJson({ alg: "HS256" })}.${base64UrlJson({ sub })}.sig`;
}

function payload(overrides: Partial<SessionTokenPayload> = {}): SessionTokenPayload {
  return {
    sessionId: "sess_1",
    accessToken: accessToken(),
    refreshToken: "refresh_1",
    accessTokenExpiresInSeconds: 900,
    sessionMaxExpiresAt: new Date(NOW + 43_200_000).toISOString(),
    activeRole: "traveler",
    adminSubRole: null,
    activeTenantId: null,
    planTier: "free",
    permissions: null,
    moderatorVehicleId: null,
    moderatorTripId: null,
    ...overrides,
  };
}

function record(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return { ...toSessionRecord(payload(), NOW), ...overrides };
}

interface CallLogEntry {
  procedure: string;
  input?: unknown;
}

/** A scripted transport: records every call and answers from `handlers`. */
function fakeCall(handlers: Record<string, (input?: unknown) => unknown> = {}) {
  const log: CallLogEntry[] = [];
  const call = async (procedure: string, input?: unknown): Promise<unknown> => {
    log.push({ procedure, input });
    const handler = handlers[procedure];
    if (!handler) throw new Error(`Unexpected call: ${procedure}`);
    return handler(input);
  };
  return { call, log };
}

function controllerWith(options: {
  store?: TokenStore;
  handlers?: Record<string, (input?: unknown) => unknown>;
  now?: number;
}) {
  const store = options.store ?? createMemoryTokenStore();
  const { call, log } = fakeCall(options.handlers);
  const controller = new SessionController({
    store,
    call,
    now: () => options.now ?? NOW,
  });
  return { controller, store, log };
}

/** A store that returns whatever it is given, bypassing the shape validation of the web parser. */
function partialActorStore(initial: SessionRecord): TokenStore {
  let current: SessionRecord | null = initial;
  return {
    key: "trips.auth.v1",
    isMemoryOnly: true,
    read: () => current,
    write: (next) => {
      current = next;
    },
    clear: () => {
      current = null;
    },
  };
}

describe("Unit: hydrate and restore (AC-4)", () => {
  test("hydrate authenticates from the store with no network call", () => {
    const store = createMemoryTokenStore();
    store.write(record());
    const { controller, log } = controllerWith({ store });

    controller.hydrate();

    expect(controller.getSnapshot().status).toBe("authenticated");
    expect(controller.getSnapshot().actor?.accountId).toBe("acct_1");
    expect(log.length).toBe(0);
  });

  test("hydrate with no record is anonymous", () => {
    const { controller } = controllerWith({});
    controller.hydrate();
    expect(controller.getSnapshot().status).toBe("anonymous");
  });

  test("restore makes no network call when the cached actor is present", async () => {
    const store = createMemoryTokenStore();
    store.write(record());
    const { controller, log } = controllerWith({ store });

    await controller.restore();

    expect(controller.getSnapshot().status).toBe("authenticated");
    expect(log.length).toBe(0);
  });

  test("restore calls auth/getSession only when the cached actor is absent", async () => {
    // A platform store (e.g. Android) can hold a record whose actor claims are missing; the web
    // parser would reject that, so the store is faked to exercise the restore branch.
    const stored = record();
    const store = partialActorStore({ ...stored, actor: { ...stored.actor, accountId: "" } });
    const { controller, log } = controllerWith({
      store,
      handlers: {
        "auth/getSession": () => ({ authenticated: true, actor: { ...stored.actor } }),
      },
    });

    await controller.restore();

    expect(log.map((entry) => entry.procedure)).toEqual(["auth/getSession"]);
    expect(controller.getSnapshot().actor?.accountId).toBe("acct_1");
  });

  test("a failed getSession probe keeps the cached session", async () => {
    const stored = record();
    const store = partialActorStore({ ...stored, actor: { ...stored.actor, accountId: "" } });
    const { controller } = controllerWith({
      store,
      handlers: {
        "auth/getSession": () => {
          throw new Error("offline");
        },
      },
    });

    await controller.restore();

    expect(controller.getSnapshot().status).toBe("authenticated");
  });
});

describe("Unit: single-flight refresh (R1, R3, AC-4)", () => {
  test("two concurrent callers share exactly one refresh", async () => {
    const store = createMemoryTokenStore();
    store.write(record({ accessTokenExpiresAt: NOW + 30_000 }));
    let refreshes = 0;
    const { controller, log } = controllerWith({
      store,
      handlers: {
        "auth/refreshSession": () => {
          refreshes += 1;
          return {
            sessionId: "sess_1",
            accessToken: accessToken("acct_1"),
            refreshToken: "refresh_2",
            accessTokenExpiresInSeconds: 900,
            sessionMaxExpiresAt: new Date(NOW + 43_200_000).toISOString(),
          };
        },
      },
    });
    controller.hydrate();

    const [first, second] = await Promise.all([controller.ensureFresh(), controller.ensureFresh()]);

    expect(refreshes).toBe(1);
    expect(log.length).toBe(1);
    expect(first?.refreshToken).toBe("refresh_2");
    expect(second?.refreshToken).toBe("refresh_2");
    // R5: the rotated pair is persisted.
    expect(store.read()?.refreshToken).toBe("refresh_2");
    expect(store.read()?.accessTokenExpiresAt).toBe(NOW + 900_000);
  });

  test("a fresh token needs no refresh", async () => {
    const store = createMemoryTokenStore();
    store.write(record());
    const { controller, log } = controllerWith({ store });
    controller.hydrate();

    await controller.ensureFresh();

    expect(log.length).toBe(0);
  });

  test("ensureFresh returns null for an anonymous caller instead of waiting", async () => {
    const { controller, log } = controllerWith({});
    controller.hydrate();

    expect(await controller.ensureFresh()).toBeNull();
    expect(log.length).toBe(0);
  });
});

describe("Unit: reactive refresh (R2, F3)", () => {
  test("handleAuthError refreshes and asks for exactly one replay", async () => {
    const store = createMemoryTokenStore();
    store.write(record());
    const { controller, log } = controllerWith({
      store,
      handlers: {
        "auth/refreshSession": () => ({
          sessionId: "sess_1",
          accessToken: accessToken(),
          refreshToken: "refresh_2",
          accessTokenExpiresInSeconds: 900,
          sessionMaxExpiresAt: new Date(NOW + 43_200_000).toISOString(),
        }),
      },
    });
    controller.hydrate();

    const replay = await controller.handleAuthError({
      status: 401,
      code: "AUTH_TOKEN_EXPIRED",
      procedure: "booking/list",
    });

    expect(replay).toBe(true);
    expect(log.map((entry) => entry.procedure)).toEqual(["auth/refreshSession"]);
  });

  test("a no-refresh procedure is never refreshed (R4)", async () => {
    const store = createMemoryTokenStore();
    store.write(record());
    const { controller, log } = controllerWith({ store });
    controller.hydrate();

    const replay = await controller.handleAuthError({
      status: 401,
      code: "AUTH_TOKEN_EXPIRED",
      procedure: "auth/signIn",
    });

    expect(replay).toBe(false);
    expect(log.length).toBe(0);
    expect(controller.getSnapshot().status).toBe("authenticated");
  });

  test("no refresh token means no refresh (R4)", async () => {
    const { controller, log } = controllerWith({});
    controller.hydrate();

    expect(
      await controller.handleAuthError({
        status: 401,
        code: "AUTH_TOKEN_EXPIRED",
        procedure: "booking/list",
      }),
    ).toBe(false);
    expect(log.length).toBe(0);
  });

  test("a non-401 error is never refreshed", async () => {
    const store = createMemoryTokenStore();
    store.write(record());
    const { controller, log } = controllerWith({ store });
    controller.hydrate();

    expect(
      await controller.handleAuthError({
        status: 403,
        code: "FORBIDDEN",
        procedure: "booking/list",
      }),
    ).toBe(false);
    expect(log.length).toBe(0);
  });
});

describe("Unit: refresh failures (F1, R5)", () => {
  test("a rejected refresh clears the store and moves to sessionExpired", async () => {
    const store = createMemoryTokenStore();
    store.write(record({ accessTokenExpiresAt: NOW + 10_000 }));
    const { controller } = controllerWith({
      store,
      handlers: {
        "auth/refreshSession": () => {
          throw new Error("401");
        },
      },
    });
    controller.hydrate();

    await expect(controller.refreshOnce()).rejects.toBeInstanceOf(SessionExpiredError);

    expect(store.read()).toBeNull();
    expect(controller.getSnapshot().status).toBe("sessionExpired");
    expect(controller.accessToken()).toBeNull();
  });

  test("a refresh response without a refresh token is a hard failure", async () => {
    const store = createMemoryTokenStore();
    store.write(record({ accessTokenExpiresAt: NOW + 10_000 }));
    const { controller } = controllerWith({
      store,
      handlers: {
        "auth/refreshSession": () => ({
          sessionId: "sess_1",
          accessToken: accessToken(),
          accessTokenExpiresInSeconds: 900,
          sessionMaxExpiresAt: new Date(NOW + 43_200_000).toISOString(),
        }),
      },
    });
    controller.hydrate();

    await expect(controller.refreshOnce()).rejects.toBeInstanceOf(SessionExpiredError);
    expect(store.read()).toBeNull();
    expect(controller.getSnapshot().status).toBe("sessionExpired");
  });

  test("MAX_SESSION_DURATION_REACHED is reported to the listener (F2)", async () => {
    const store = createMemoryTokenStore();
    store.write(record({ accessTokenExpiresAt: NOW + 10_000 }));
    // The real shape: a transport failure carrying the ApiErrorResponse envelope, with the reason as
    // a detail (it is never an error code — see ARCHITECTURE §1.2).
    const { call } = fakeCall({
      "auth/refreshSession": () => {
        throw Object.assign(new Error("expired"), {
          status: 401,
          code: "UNAUTHORIZED",
          data: {
            success: false,
            data: null,
            error: {
              code: "UNAUTHORIZED",
              status: 401,
              details: { reason: "MAX_SESSION_DURATION_REACHED", draftsRetained: true },
            },
            requestId: "req_1",
          },
        });
      },
    });
    const seen: boolean[] = [];
    const controller = new SessionController({
      store,
      call,
      now: () => NOW,
      onExpired: (info) => seen.push(info.maxSessionReached),
    });
    controller.hydrate();

    await expect(controller.refreshOnce()).rejects.toBeInstanceOf(SessionExpiredError);
    expect(seen).toEqual([true]);
    expect(store.read()).toBeNull();
    expect(controller.expiredByMaxSession).toBe(true);
  });

  test("an ordinary refresh failure is not reported as the 12-hour cap (F2)", async () => {
    const store = createMemoryTokenStore();
    store.write(record({ accessTokenExpiresAt: NOW + 10_000 }));
    const { call } = fakeCall({
      "auth/refreshSession": () => {
        throw Object.assign(new Error("revoked"), {
          status: 401,
          code: "UNAUTHORIZED",
          data: { error: { code: "UNAUTHORIZED" }, requestId: "req_1" },
        });
      },
    });
    const seen: boolean[] = [];
    const controller = new SessionController({
      store,
      call,
      now: () => NOW,
      onExpired: (info) => seen.push(info.maxSessionReached),
    });
    controller.hydrate();

    await expect(controller.refreshOnce()).rejects.toBeInstanceOf(SessionExpiredError);
    expect(seen).toEqual([false]);
    expect(controller.expiredByMaxSession).toBe(false);
  });
});

describe("Unit: the 12-hour cap (R6, AC-4)", () => {
  test("no network call is made once the cap is reached", async () => {
    const store = createMemoryTokenStore();
    store.write(record({ sessionMaxExpiresAt: NOW }));
    const { controller, log } = controllerWith({ store });
    controller.hydrate();

    await expect(controller.ensureFresh()).rejects.toBeInstanceOf(SessionExpiredError);

    expect(log.length).toBe(0);
    expect(store.read()).toBeNull();
    expect(controller.getSnapshot().status).toBe("sessionExpired");
  });

  test("hydrate itself refuses an already-capped record", () => {
    const store = createMemoryTokenStore();
    store.write(record({ sessionMaxExpiresAt: NOW - 1 }));
    const { controller } = controllerWith({ store });

    controller.hydrate();

    expect(controller.getSnapshot().status).toBe("sessionExpired");
    expect(store.read()).toBeNull();
  });
});

describe("Unit: sign out (S1–S5, AC-3)", () => {
  test("sends the refresh token and the allDevices flag, then clears", async () => {
    const store = createMemoryTokenStore();
    store.write(record());
    const { controller, log } = controllerWith({
      store,
      handlers: { "auth/signOut": () => ({ signedOut: true }) },
    });
    controller.hydrate();

    await controller.signOut(false);

    expect(log[0]?.procedure).toBe("auth/signOut");
    expect(log[0]?.input).toEqual({ refreshToken: "refresh_1", allDevices: false });
    expect(store.read()).toBeNull();
    expect(controller.getSnapshot().status).toBe("anonymous");
  });

  test("allDevices is forwarded (S2)", async () => {
    const store = createMemoryTokenStore();
    store.write(record());
    const { controller, log } = controllerWith({
      store,
      handlers: { "auth/signOut": () => ({ signedOut: true }) },
    });
    controller.hydrate();

    await controller.signOut(true);

    expect(log[0]?.input).toEqual({ refreshToken: "refresh_1", allDevices: true });
  });

  test("clears the session even when the network call throws (S3)", async () => {
    const store = createMemoryTokenStore();
    store.write(record());
    const { controller } = controllerWith({
      store,
      handlers: {
        "auth/signOut": () => {
          throw new Error("offline");
        },
      },
    });
    controller.hydrate();

    await controller.signOut(false);

    expect(store.read()).toBeNull();
    expect(controller.getSnapshot().status).toBe("anonymous");
    expect(controller.getSnapshot().actor).toBeNull();
  });

  test("signing out with no session still clears and resolves", async () => {
    const { controller, log } = controllerWith({});
    controller.hydrate();

    await controller.signOut(false);

    expect(log.length).toBe(0);
    expect(controller.getSnapshot().status).toBe("anonymous");
  });
});

describe("Unit: adopting sessions and tokens", () => {
  test("adoptSession persists the record and authenticates", () => {
    const { controller, store } = controllerWith({});

    controller.adoptSession(payload());

    expect(controller.getSnapshot().status).toBe("authenticated");
    expect(store.read()?.actor.accountId).toBe("acct_1");
    expect(store.read()?.accessTokenExpiresAt).toBe(NOW + 900_000);
  });

  test("adoptTokens replaces the access token only (P1 role switching)", () => {
    const store = createMemoryTokenStore();
    store.write(record());
    const { controller } = controllerWith({ store });
    controller.hydrate();

    controller.adoptTokens({
      sessionId: "sess_1",
      accessToken: accessToken("acct_1"),
      refreshToken: "ignored",
      accessTokenExpiresInSeconds: 900,
      sessionMaxExpiresAt: new Date(NOW + 43_200_000).toISOString(),
    });

    expect(store.read()?.refreshToken).toBe("refresh_1");
    expect(store.read()?.accessTokenExpiresAt).toBe(NOW + 900_000);
  });

  test("adoptTokens is a no-op without a stored session", () => {
    const { controller, store } = controllerWith({});
    controller.hydrate();

    expect(
      controller.adoptTokens({
        sessionId: "sess_1",
        accessToken: "a",
        refreshToken: "b",
        accessTokenExpiresInSeconds: 900,
        sessionMaxExpiresAt: new Date(NOW).toISOString(),
      }),
    ).toBeNull();
    expect(store.read()).toBeNull();
  });
});

describe("Unit: subscribers", () => {
  test("every state change notifies subscribers and unsubscribe stops it", () => {
    const { controller } = controllerWith({});
    let notifications = 0;
    const unsubscribe = controller.subscribe(() => {
      notifications += 1;
    });

    controller.hydrate();
    expect(notifications).toBe(1);

    // Same state: no notification.
    controller.hydrate();
    expect(notifications).toBe(1);

    controller.adoptSession(payload());
    expect(notifications).toBe(2);

    unsubscribe();
    controller.clearSession("anonymous");
    expect(notifications).toBe(2);
  });

  test("a throwing subscriber does not break the others", () => {
    const { controller } = controllerWith({});
    let second = 0;
    controller.subscribe(() => {
      throw new Error("boom");
    });
    controller.subscribe(() => {
      second += 1;
    });

    controller.hydrate();

    expect(second).toBe(1);
  });

  test("the loading snapshot is stable for SSR", () => {
    const { controller } = controllerWith({});
    expect(controller.getServerSnapshot().status).toBe("loading");
    expect(controller.getSnapshot()).toBe(controller.getServerSnapshot());
  });
});
