// The oRPC transport for the web app (ARCHITECTURE §4.2).
//
// Two things live here:
//   1. `createRpcCall` — a raw, interceptor-free call used by the session controller for
//      refresh/sign-out/getSession (R3: the refresh call itself must never be wrapped by R2).
//   2. `buildAuthLink` — the RPCLink the app uses, with a dynamic bearer and one reactive replay.
import type { ClientContext } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { SessionExpiredError, needsRefreshOnError } from "@trips-app/auth";

import type { RpcCall, SessionController } from "./session-controller";

/** A failed RPC call, carrying exactly what `extractTransportError` reads. */
export class RpcCallError extends Error {
  readonly status: number;
  readonly code: string;
  readonly data?: unknown;

  constructor(status: number, code: string, message: string, data?: unknown) {
    super(message);
    this.name = "RpcCallError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

/**
 * A minimal RPC client for the oRPC RPC protocol: `POST /rpc/<procedure>` with `{ json: input }`,
 * answered with `{ json: output }`. Errors arrive as `{ json: { code, status, message, data } }`.
 *
 * It is deliberately independent of `RPCLink` so the controller can call `auth/refreshSession`
 * without passing through the refresh interceptor.
 */
export function createRpcCall(options: {
  baseUrl: string;
  getAccessToken: () => string | null;
  fetchImpl?: typeof fetch;
}): RpcCall {
  const base = options.baseUrl.replace(/\/$/, "");
  const doFetch = options.fetchImpl ?? globalThis.fetch.bind(globalThis);

  return async (procedure: string, input?: unknown): Promise<unknown> => {
    const headers: Record<string, string> = { "content-type": "application/json" };
    const token = options.getAccessToken();
    if (token) headers.authorization = `Bearer ${token}`;

    const response = await doFetch(`${base}/rpc/${procedure}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ json: input ?? null }),
    });

    // The RPC protocol wraps success *and* failure payloads in `{ json: … }`, so this is the inner
    // object: `{ code, status, message, data }` for a failure, the handler result for a success.
    const payload = await readRpcPayload(response);
    if (!response.ok) {
      const code = firstString(
        isRecord(payload) ? payload.code : undefined,
        isRecord(payload) && isRecord(payload.data) && isRecord(payload.data.error)
          ? payload.data.error.code
          : undefined,
      );
      const message =
        firstString(isRecord(payload) ? payload.message : undefined) ?? response.statusText;
      throw new RpcCallError(
        response.status,
        code ?? "",
        message.length > 0 ? message : `RPC ${procedure} failed`,
        // The `ApiErrorResponse` envelope: `extractTransportError` and the controller's F2 check
        // both read `data.error.details` / `data.requestId` from here.
        isRecord(payload) ? payload.data : undefined,
      );
    }
    return payload ?? null;
  };
}

/**
 * The app's link: the bearer is read on every call, so a rotation needs no re-creation.
 *
 * Order of operations for one call (R1, R2, R3):
 *   1. `ensureFresh()` — proactive refresh, or a `SessionExpiredError` with no network call (R6).
 *   2. send the request;
 *   3. on a 401 whose code is refreshable and whose procedure is not in the no-refresh set,
 *      refresh once (shared with every other caller) and replay **exactly once**.
 */
export function buildAuthLink<T extends ClientContext = ClientContext>(options: {
  controller: SessionController;
  baseUrl: string;
  fetchImpl?: typeof fetch;
}): RPCLink<T> {
  const doFetch = options.fetchImpl ?? globalThis.fetch.bind(globalThis);

  const authFetch = async (
    request: Request,
    _init: { redirect?: Request["redirect"] },
    _clientOptions: unknown,
    path: readonly string[],
    _input: unknown,
  ): Promise<Response> => {
    const procedure = path.join("/");

    // R1 / R6: a hard expiry rejects here, before any network call (F3).
    await options.controller.ensureFresh();

    // Keep a replayable copy: the first fetch consumes the original body stream.
    const replaySource = request.clone();
    const response = await doFetch(request);
    if (response.status !== 401) return response;

    const code = await peekErrorCode(response.clone());
    const decision = needsRefreshOnError({ status: 401, code, procedure });
    if (!decision) return response;

    const refreshed = await options.controller.handleAuthError({ status: 401, code, procedure });
    if (!refreshed) return response;

    const replay = await withCurrentToken(replaySource, options.controller.accessToken());
    return doFetch(replay);
  };

  return new RPCLink<T>({
    url: `${options.baseUrl.replace(/\/$/, "")}/rpc`,
    headers: () => {
      const token = options.controller.accessToken();
      return token ? { authorization: `Bearer ${token}` } : {};
    },
    fetch: authFetch,
  });
}

/** Reads `{ json: { code } }` from a cloned error response without consuming the original. */
export async function peekErrorCode(response: Response): Promise<string> {
  try {
    const payload = await readRpcPayload(response);
    if (isRecord(payload)) {
      const direct = firstString(payload.code);
      if (direct) return direct;
      if (isRecord(payload.data) && isRecord(payload.data.error)) {
        return firstString(payload.data.error.code) ?? "";
      }
    }
  } catch {
    return "";
  }
  return "";
}

/** Rebuilds the request with the rotated bearer, preserving method, headers and body bytes. */
async function withCurrentToken(request: Request, token: string | null): Promise<Request> {
  const headers = new Headers(request.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  else headers.delete("authorization");

  const method = request.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? null : await request.arrayBuffer();
  return new Request(request.url, { method, headers, body });
}

/**
 * Parses a response and unwraps the RPC protocol's `{ json: … }` wrapper.
 *
 * Both success and failure payloads are wrapped, and the code of a failure lives at `json.code`
 * (mirrored inside `json.data.error.code`). Reading the wrapper as if it were the payload silently
 * yields `code: ""`, which would disable the reactive refresh of R2 entirely.
 */
async function readRpcPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) return null;
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return null;
  }
  // A body that is not the wrapper (e.g. a bare HTTP error) is returned as-is.
  return isRecord(body) && "json" in body ? body.json : body;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export { SessionExpiredError };
