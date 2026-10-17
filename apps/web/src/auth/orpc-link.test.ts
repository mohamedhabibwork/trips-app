// The transport half of R1/R2/R3/R4/R6 (ARCHITECTURE §4.1). The session-controller tests prove the
// state machine; these prove the *interceptor* — that a 401 produces exactly one replay with the
// rotated bearer, that a no-refresh procedure produces none, and that the 12-hour cap rejects before
// a single byte leaves the tab.
//
// The real `RPCLink` is used, so the request shape, the header callback and the response decoding are
// the ones production uses; only `fetch` is scripted.
import { describe, expect, test } from "bun:test";
import { SessionExpiredError, toSessionRecord } from "@trips-app/auth";
import type { SessionRecord, SessionTokenPayload } from "@trips-app/auth";

import { RpcCallError, buildAuthLink, createRpcCall, peekErrorCode } from "./orpc-link";
import { SessionController } from "./session-controller";
import { createMemoryTokenStore, type TokenStore } from "./token-store";

const NOW = Date.parse("2026-10-17T12:00:00.000Z");
const BASE_URL = "http://localhost:3000";

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
    planTier: null,
    permissions: null,
    moderatorVehicleId: null,
    moderatorTripId: null,
    ...overrides,
  };
}

function record(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return { ...toSessionRecord(payload(), NOW), ...overrides };
}

interface FetchCall {
  url: string;
  authorization: string | null;
  body: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * The exact body the server sends for a failure.
 *
 * Verified against the running app (`app.handle` on `/rpc/auth/refreshSession`) and pinned by
 * `apps/server/test/e2e/auth.e2e.test.ts`: the oRPC RPC protocol wraps *both* success and failure
 * payloads in `{ json: ... }`, so the code lives at `json.code` and the envelope at `json.data`.
 */
function authError(status: number, code: string, details: Record<string, unknown> = {}): Response {
  return jsonResponse(
    {
      json: {
        defined: false,
        code,
        status,
        message: code,
        data: {
          ...details,
          success: false,
          data: null,
          error: {
            code,
            category: code,
            status,
            message: code,
            ...(Object.keys(details).length > 0 ? { details } : {}),
          },
          requestId: "req_1",
          meta: { requestId: "req_1", timestamp: "2026-10-17T12:00:00.000Z", locale: "ar" },
        },
      },
    },
    status,
  );
}

interface Harness {
  controller: SessionController;
  store: TokenStore;
  calls: FetchCall[];
  procedures: string[];
  /** Drives one authenticated RPC through the real link. */
  rpc(procedure: readonly string[], input?: unknown): Promise<unknown>;
}

function harness(options: {
  stored?: SessionRecord | null;
  now?: number;
  refresh?: (input?: unknown) => unknown;
  respond?: (call: FetchCall, attempt: number) => Response;
}): Harness {
  const store = createMemoryTokenStore();
  if (options.stored) store.write(options.stored);

  const procedures: string[] = [];
  const call = async (procedure: string, input?: unknown): Promise<unknown> => {
    procedures.push(procedure);
    if (procedure === "auth/refreshSession") {
      if (!options.refresh) throw new Error(`Unexpected refresh in this test`);
      return options.refresh(input);
    }
    return null;
  };

  const controller = new SessionController({ store, call, now: () => options.now ?? NOW });
  controller.hydrate();

  const calls: FetchCall[] = [];
  const fetchImpl = (async (request: Request): Promise<Response> => {
    const call: FetchCall = {
      url: request.url,
      authorization: request.headers.get("authorization"),
      body: await request.text(),
    };
    calls.push(call);
    const respond = options.respond ?? (() => jsonResponse({ json: { ok: true } }));
    return respond(call, calls.length);
  }) as unknown as typeof fetch;

  const link = buildAuthLink({ controller, baseUrl: BASE_URL, fetchImpl });

  return {
    controller,
    store,
    calls,
    procedures,
    rpc: (procedure, input) =>
      link.call(procedure, input, { context: {} } as never) as Promise<unknown>,
  };
}

const ROTATED = {
  sessionId: "sess_1",
  accessToken: accessToken("acct_1"),
  refreshToken: "refresh_2",
  accessTokenExpiresInSeconds: 900,
  sessionMaxExpiresAt: new Date(NOW + 43_200_000).toISOString(),
};

describe("Unit: R2 — one refresh, one replay", () => {
  test("a 401 with AUTH_TOKEN_EXPIRED is replayed once with the rotated bearer", async () => {
    const rotatedToken = accessToken("acct_1");
    const harnessed = harness({
      stored: record(),
      refresh: () => ({ ...ROTATED, accessToken: rotatedToken }),
      respond: (_call, attempt) => {
        if (attempt === 1) return authError(401, "AUTH_TOKEN_EXPIRED");
        return jsonResponse({ json: { ok: true, attempt } });
      },
    });

    const result = await harnessed.rpc(["auth", "getSession"]);

    expect(result).toEqual({ ok: true, attempt: 2 });
    expect(harnessed.calls.length).toBe(2);
    expect(harnessed.procedures).toEqual(["auth/refreshSession"]);
    // The replay carries the rotated token, not the one that failed.
    expect(harnessed.calls[1]?.authorization).toBe(`Bearer ${rotatedToken}`);
    // Both attempts hit the same procedure with the same body.
    expect(harnessed.calls[1]?.url).toBe(harnessed.calls[0]?.url);
    expect(harnessed.calls[1]?.body).toBe(harnessed.calls[0]?.body);
    expect(harnessed.store.read()?.refreshToken).toBe("refresh_2");
  });

  test("a second consecutive 401 is not replayed again", async () => {
    const harnessed = harness({
      stored: record(),
      refresh: () => ROTATED,
      respond: () => authError(401, "AUTH_TOKEN_EXPIRED"),
    });

    await expect(harnessed.rpc(["auth", "getSession"])).rejects.toBeDefined();

    // Exactly two attempts: the original and one replay. A third would be a loop.
    expect(harnessed.calls.length).toBe(2);
    expect(harnessed.procedures).toEqual(["auth/refreshSession"]);
  });

  test("an UNAUTHORIZED 401 on a data procedure refreshes (the server's real expiry code)", async () => {
    const harnessed = harness({
      stored: record(),
      refresh: () => ROTATED,
      respond: (_call, attempt) =>
        attempt === 1 ? authError(401, "UNAUTHORIZED") : jsonResponse({ json: { ok: true } }),
    });

    expect(await harnessed.rpc(["booking", "list"])).toEqual({ ok: true });
    expect(harnessed.procedures).toEqual(["auth/refreshSession"]);
  });

  test("the 401 code is read from data.error.code too", async () => {
    const harnessed = harness({
      stored: record(),
      refresh: () => ROTATED,
      respond: (_call, attempt) =>
        attempt === 1
          ? jsonResponse(
              { json: { data: { success: false, error: { code: "AUTH_TOKEN_EXPIRED" } } } },
              401,
            )
          : jsonResponse({ json: { ok: true } }),
    });

    expect(await harnessed.rpc(["booking", "list"])).toEqual({ ok: true });
    expect(harnessed.procedures).toEqual(["auth/refreshSession"]);
  });
});

describe("Unit: R4 — no refresh on the auth procedures", () => {
  test("a 401 from auth/signIn is returned to the caller untouched", async () => {
    const harnessed = harness({
      stored: record(),
      respond: () => authError(401, "UNAUTHORIZED"),
    });

    await expect(
      harnessed.rpc(["auth", "signIn"], { identifier: "sara@example.com" }),
    ).rejects.toBeDefined();

    expect(harnessed.calls.length).toBe(1);
    expect(harnessed.procedures).toEqual([]);
  });

  test("a 401 from auth/verifyOtp is not refreshed either", async () => {
    const harnessed = harness({
      stored: record(),
      respond: () => authError(401, "AUTH_TOKEN_EXPIRED"),
    });

    await expect(harnessed.rpc(["auth", "verifyOtp"])).rejects.toBeDefined();
    expect(harnessed.procedures).toEqual([]);
  });

  test("a 403 with a refreshable code is never refreshed (A3)", async () => {
    const harnessed = harness({
      stored: record(),
      respond: () => authError(403, "AUTH_TOKEN_EXPIRED"),
    });

    await expect(harnessed.rpc(["booking", "list"])).rejects.toBeDefined();
    expect(harnessed.calls.length).toBe(1);
    expect(harnessed.procedures).toEqual([]);
  });
});

describe("Unit: refresh failures (F1, F3)", () => {
  test("a failed refresh returns the original 401 and clears the session", async () => {
    const harnessed = harness({
      stored: record(),
      refresh: () => {
        throw new RpcCallError(401, "UNAUTHORIZED", "revoked", {
          reason: "MAX_SESSION_DURATION_REACHED",
        });
      },
      respond: () => authError(401, "AUTH_TOKEN_EXPIRED"),
    });

    await expect(harnessed.rpc(["booking", "list"])).rejects.toBeDefined();

    expect(harnessed.calls.length).toBe(1);
    expect(harnessed.store.read()).toBeNull();
    expect(harnessed.controller.getSnapshot().status).toBe("sessionExpired");
  });
});

describe("Unit: R1 / R6 — the proactive half", () => {
  test("a token inside the lead window is refreshed before the request is sent", async () => {
    const harnessed = harness({
      stored: record({ accessTokenExpiresAt: NOW + 30_000 }),
      refresh: () => ROTATED,
      respond: () => jsonResponse({ json: { ok: true } }),
    });

    await harnessed.rpc(["booking", "list"]);

    expect(harnessed.procedures).toEqual(["auth/refreshSession"]);
    expect(harnessed.calls.length).toBe(1);
    expect(harnessed.calls[0]?.authorization).toBe(`Bearer ${ROTATED.accessToken}`);
  });

  test("past the 12-hour cap nothing is sent and the caller gets SessionExpiredError", async () => {
    const harnessed = harness({
      stored: record({ sessionMaxExpiresAt: NOW }),
      respond: () => jsonResponse({ json: { ok: true } }),
    });

    await expect(harnessed.rpc(["booking", "list"])).rejects.toBeInstanceOf(SessionExpiredError);

    expect(harnessed.calls.length).toBe(0);
    expect(harnessed.procedures).toEqual([]);
    expect(harnessed.store.read()).toBeNull();
  });

  test("an anonymous call is sent with no authorization header and no refresh", async () => {
    const harnessed = harness({
      stored: null,
      respond: () => jsonResponse({ json: { ok: true } }),
    });

    await harnessed.rpc(["health", "check"]);

    expect(harnessed.calls.length).toBe(1);
    expect(harnessed.calls[0]?.authorization).toBeNull();
    expect(harnessed.procedures).toEqual([]);
  });
});

describe("Unit: the link shape", () => {
  test("the request is a POST to /rpc/<procedure> carrying { json: input }", async () => {
    const harnessed = harness({ stored: record() });

    await harnessed.rpc(["booking", "create"], { seats: 2 });

    expect(harnessed.calls[0]?.url).toBe(`${BASE_URL}/rpc/booking/create`);
    expect(JSON.parse(harnessed.calls[0]!.body)).toEqual({ json: { seats: 2 } });
    expect(harnessed.calls[0]?.authorization).toBe(`Bearer ${record().accessToken}`);
  });
});

describe("Unit: createRpcCall (the interceptor-free transport)", () => {
  function rpcHarness(respond: (call: FetchCall) => Response, token: string | null = null) {
    const calls: FetchCall[] = [];
    const fetchImpl = (async (url: string, init: RequestInit): Promise<Response> => {
      const headers = new Headers(init.headers);
      const call: FetchCall = {
        url,
        authorization: headers.get("authorization"),
        body: String(init.body ?? ""),
      };
      calls.push(call);
      return respond(call);
    }) as unknown as typeof fetch;

    return {
      call: createRpcCall({ baseUrl: BASE_URL, getAccessToken: () => token, fetchImpl }),
      calls,
    };
  }

  test("sends the bearer, the JSON body, and returns the decoded output", async () => {
    const { call, calls } = rpcHarness(
      () => jsonResponse({ json: { signedOut: true } }),
      "token_1",
    );

    const result = await call("auth/signOut", { allDevices: false });

    expect(result).toEqual({ signedOut: true });
    expect(calls[0]?.url).toBe(`${BASE_URL}/rpc/auth/signOut`);
    expect(calls[0]?.authorization).toBe("Bearer token_1");
    expect(JSON.parse(calls[0]!.body)).toEqual({ json: { allDevices: false } });
  });

  test("sends no authorization header when there is no token", async () => {
    const { call, calls } = rpcHarness(() => jsonResponse({ json: null }), null);

    await call("auth/getSession");

    expect(calls[0]?.authorization).toBeNull();
  });

  test("throws RpcCallError with the status, code and data of a failure", async () => {
    const { call } = rpcHarness(() =>
      authError(401, "UNAUTHORIZED", { reason: "MAX_SESSION_DURATION_REACHED" }),
    );

    const error = (await call("auth/refreshSession", { refreshToken: "x" }).catch(
      (thrown: unknown) => thrown,
    )) as RpcCallError;

    expect(error).toBeInstanceOf(RpcCallError);
    expect(error.status).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
    expect((error.data as Record<string, unknown>).reason).toBe("MAX_SESSION_DURATION_REACHED");
  });

  test("reads the code from data.error.code when the top level omits it", async () => {
    const { call } = rpcHarness(() =>
      jsonResponse(
        { json: { data: { success: false, error: { code: "ADMIN_SUBROLE_FORBIDDEN" } } } },
        403,
      ),
    );

    const error = (await call("admin/getSystemSettings").catch(
      (thrown: unknown) => thrown,
    )) as RpcCallError;

    expect(error.code).toBe("ADMIN_SUBROLE_FORBIDDEN");
    expect(error.status).toBe(403);
  });

  test("an empty body is null, not a parse error", async () => {
    const { call } = rpcHarness(() => new Response("", { status: 200 }));

    expect(await call("health/check")).toBeNull();
  });

  test("a non-JSON body still produces a usable error", async () => {
    const { call } = rpcHarness(() => new Response("<html>oops</html>", { status: 500 }));

    const error = (await call("booking/list").catch((thrown: unknown) => thrown)) as RpcCallError;

    expect(error).toBeInstanceOf(RpcCallError);
    expect(error.status).toBe(500);
    expect(error.code).toBe("");
  });
});

describe("Unit: peekErrorCode reads a clone without consuming it", () => {
  test("finds the code at both documented locations of the real envelope", async () => {
    expect(await peekErrorCode(authError(401, "UNAUTHORIZED"))).toBe("UNAUTHORIZED");
    expect(
      await peekErrorCode(
        jsonResponse(
          { json: { data: { success: false, error: { code: "AUTH_TOKEN_EXPIRED" } } } },
          401,
        ),
      ),
    ).toBe("AUTH_TOKEN_EXPIRED");
  });

  test("returns an empty string for anything unreadable", async () => {
    expect(await peekErrorCode(new Response("not json", { status: 500 }))).toBe("");
    expect(await peekErrorCode(jsonResponse({ json: null }, 500))).toBe("");
    expect(await peekErrorCode(new Response("", { status: 500 }))).toBe("");
  });

  test("the original response body is still readable afterwards", async () => {
    const response = authError(401, "UNAUTHORIZED");

    await peekErrorCode(response.clone());

    expect(await response.text()).toContain("UNAUTHORIZED");
  });
});
