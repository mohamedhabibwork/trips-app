// `extractTransportError` is the single adapter between whatever the transport throws and the shared
// mapper (ARCHITECTURE §3.1: "details and fieldErrors are read from error.data"). Every screen calls
// `toAuthErrorView`, so a regression here is visible on every auth screen at once — and it was the one
// module in `apps/web/src/auth` with no test at all.
import { describe, expect, test } from "bun:test";
import { SessionExpiredError } from "@trips-app/auth";

import {
  authErrorViewFor,
  extractTransportError,
  isSessionExpiredFailure,
  toAuthErrorView,
} from "./errors";

/** The shape `RPCLink` throws: an ORPCError with the decoded `json.data` envelope attached. */
function orpcError(options: {
  code: string;
  status: number;
  message?: string;
  data?: Record<string, unknown>;
}): Error {
  const error = new Error(options.message ?? options.code);
  return Object.assign(error, {
    code: options.code,
    status: options.status,
    data: options.data ?? {},
  });
}

/** The envelope `toORPCError` builds: details spread at the top level, plus the ApiErrorResponse. */
function envelope(details: Record<string, unknown> = {}, extras: Record<string, unknown> = {}) {
  return {
    ...details,
    success: false,
    data: null,
    error: {
      code: extras.code ?? "UNAUTHORIZED",
      category: extras.code ?? "UNAUTHORIZED",
      status: extras.status ?? 401,
      message: "Invalid credentials.",
      ...(Object.keys(details).length > 0 ? { details } : {}),
    },
    requestId: "req_1",
    meta: { requestId: "req_1", timestamp: "2026-10-17T12:00:00.000Z", locale: "ar" },
  };
}

describe("Unit: status, code, message and requestId", () => {
  test("reads the ORPCError fields the mapper needs", () => {
    const failure = extractTransportError(
      orpcError({
        code: "UNAUTHORIZED",
        status: 401,
        message: "Invalid credentials.",
        data: envelope(),
      }),
      "auth/signIn",
    );

    expect(failure.status).toBe(401);
    expect(failure.code).toBe("UNAUTHORIZED");
    expect(failure.message).toBe("Invalid credentials.");
    expect(failure.procedure).toBe("auth/signIn");
    expect(failure.requestId).toBe("req_1");
  });

  test("prefers data.requestId and falls back to meta.requestId", () => {
    const withData = orpcError({ code: "X", status: 400, data: { requestId: "req_data" } });
    expect(extractTransportError(withData).requestId).toBe("req_data");

    const metaOnly = orpcError({
      code: "X",
      status: 400,
      data: { meta: { requestId: "req_meta" } },
    });
    expect(extractTransportError(metaOnly).requestId).toBe("req_meta");
  });

  test("survives a thrown non-object (a network failure)", () => {
    const failure = extractTransportError(new TypeError("Failed to fetch"), "booking/list");

    expect(failure.status).toBe(0);
    expect(failure.code).toBe("");
    expect(failure.procedure).toBe("booking/list");
    expect(failure.details).toEqual({});
  });
});

describe("Unit: details extraction (§3.1)", () => {
  test("top-level details from the envelope are copied", () => {
    const failure = extractTransportError(
      orpcError({
        code: "FORBIDDEN",
        status: 403,
        data: envelope(
          { status: "suspended", suspendedReason: "Fraud review" },
          { code: "FORBIDDEN", status: 403 },
        ),
      }),
    );

    expect(failure.details?.status).toBe("suspended");
    expect(failure.details?.suspendedReason).toBe("Fraud review");
    // Envelope keys must not leak into details: they would shadow real detail names.
    expect(failure.details).not.toHaveProperty("success");
    expect(failure.details).not.toHaveProperty("error");
    expect(failure.details).not.toHaveProperty("meta");
    expect(failure.details).not.toHaveProperty("requestId");
  });

  test("nested error.details wins over the spread copy", () => {
    const failure = extractTransportError(
      orpcError({
        code: "RATE_LIMITED",
        status: 429,
        data: {
          remainingLockoutSeconds: 999,
          success: false,
          data: null,
          error: { code: "RATE_LIMITED", status: 429, details: { remainingLockoutSeconds: 600 } },
          requestId: "req_1",
        },
      }),
    );

    expect(failure.details?.remainingLockoutSeconds).toBe(600);
  });

  test("fieldErrors are read from the envelope error object", () => {
    const failure = extractTransportError(
      orpcError({
        code: "VALIDATION_ERROR",
        status: 400,
        data: {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            status: 400,
            fieldErrors: [
              { field: "email", code: "INVALID_EMAIL", message: "Enter a valid email." },
              { field: "password", code: "TOO_SHORT", message: "Use 12 characters." },
            ],
          },
          requestId: "req_1",
        },
      }),
    );

    expect(failure.fieldErrors?.map((issue) => issue.field)).toEqual(["email", "password"]);
    expect(failure.fieldErrors?.[0]?.message).toBe("Enter a valid email.");
  });

  test("a malformed fieldErrors entry is skipped, not thrown", () => {
    const failure = extractTransportError(
      orpcError({
        code: "VALIDATION_ERROR",
        status: 400,
        data: { error: { fieldErrors: [null, { message: "no field" }, { field: "phone" }] } },
      }),
    );

    expect(failure.fieldErrors?.length).toBe(1);
    expect(failure.fieldErrors?.[0]).toEqual({
      field: "phone",
      code: "VALIDATION_ERROR",
      message: "",
    });
  });
});

describe("Unit: SessionExpiredError (F2, F3)", () => {
  test("becomes a 401 with the 12-hour detail when the cap was hit", () => {
    const failure = extractTransportError(new SessionExpiredError("cap", true));

    expect(failure.status).toBe(401);
    expect(failure.code).toBe("AUTH_SESSION_EXPIRED");
    expect(failure.details?.reason).toBe("MAX_SESSION_DURATION_REACHED");
  });

  test("carries no cap detail for a plain expiry", () => {
    const failure = extractTransportError(new SessionExpiredError("expired", false));

    expect(failure.status).toBe(401);
    expect(failure.details).toBeUndefined();
  });
});

describe("Unit: the view every screen renders", () => {
  test("a suspended account maps to the suspended copy with its reason", () => {
    const error = orpcError({
      code: "FORBIDDEN",
      status: 403,
      data: envelope(
        { status: "suspended", suspendedReason: "Fraud review" },
        { code: "FORBIDDEN", status: 403 },
      ),
    });

    const view = toAuthErrorView(error, { locale: "en", procedure: "auth/signIn" });

    expect(view.key).toBe("auth.error.suspended");
    expect(view.params.reason).toBe("Fraud review");
    expect(view.recovery).toBe("noRetry");
    expect(view.requestId).toBe("req_1");
  });

  test("a sign-in 401 is bad credentials; the same code elsewhere is an expired session", () => {
    const error = orpcError({ code: "UNAUTHORIZED", status: 401, data: envelope() });

    expect(toAuthErrorView(error, { locale: "en", procedure: "auth/signIn" }).key).toBe(
      "auth.error.invalidCredentials",
    );
    expect(toAuthErrorView(error, { locale: "en", procedure: "auth/refreshSession" }).key).toBe(
      "auth.error.sessionExpired",
    );
  });

  test("a lockout becomes a countdown with a positive number of seconds", () => {
    const error = orpcError({
      code: "RATE_LIMITED",
      status: 429,
      data: envelope({ remainingLockoutSeconds: 900 }, { code: "RATE_LIMITED", status: 429 }),
    });

    const view = toAuthErrorView(error, { locale: "ar" });

    expect(view.key).toBe("auth.error.accountLocked");
    expect(view.recovery).toBe("countdown");
    expect(Number(view.params.seconds)).toBe(900);
  });

  test("a mobile organization registration on the surface field is the web-only copy", () => {
    const error = orpcError({
      code: "FORBIDDEN",
      status: 403,
      data: envelope({ field: "surface" }, { code: "FORBIDDEN", status: 403 }),
    });

    expect(toAuthErrorView(error, { locale: "en" }).key).toBe("auth.error.webOnlyRegistration");
  });

  test("an unmapped code keeps the requestId for support", () => {
    const error = orpcError({
      code: "BRAND_NEW",
      status: 500,
      data: envelope({}, { code: "BRAND_NEW", status: 500 }),
    });

    const view = toAuthErrorView(error, { locale: "en" });

    expect(view.key).toBe("auth.error.unexpected");
    expect(view.params.requestId).toBe("req_1");
  });

  test("authErrorViewFor and toAuthErrorView agree", () => {
    const error = orpcError({ code: "INTERNAL_ERROR", status: 500, data: envelope() });
    const failure = extractTransportError(error, "booking/list");

    expect(authErrorViewFor(failure, "en")).toEqual(toAuthErrorView(error, { locale: "en" }));
  });
});

describe("Unit: isSessionExpiredFailure (F3)", () => {
  test("true only for a 401 with an expiry code", () => {
    expect(isSessionExpiredFailure({ status: 401, code: "UNAUTHORIZED" })).toBe(true);
    expect(isSessionExpiredFailure({ status: 401, code: "AUTH_TOKEN_EXPIRED" })).toBe(true);
    expect(isSessionExpiredFailure({ status: 401, code: "AUTH_SESSION_EXPIRED" })).toBe(true);

    expect(isSessionExpiredFailure({ status: 401, code: "FORBIDDEN" })).toBe(false);
    expect(isSessionExpiredFailure({ status: 403, code: "UNAUTHORIZED" })).toBe(false);
    expect(isSessionExpiredFailure({ status: 500, code: "INTERNAL_ERROR" })).toBe(false);
  });
});
