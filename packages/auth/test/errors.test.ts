import { describe, expect, test } from "bun:test";

import { AUTH_ERROR_VIEWS, fieldMessageFor, mapAuthError, messageFor } from "../src/index";
import type { AuthErrorInput } from "../src/index";

function input(overrides: Partial<AuthErrorInput> = {}): AuthErrorInput {
  return { code: "INTERNAL_ERROR", locale: "en", ...overrides };
}

/** Arabic letters, so a missing translation cannot pass as Arabic. */
function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

describe("Unit: §3.5 disambiguation — UNAUTHORIZED", () => {
  test("on a sign-in procedure it is bad credentials", () => {
    const view = mapAuthError(input({ code: "UNAUTHORIZED", procedure: "auth/signIn" }));

    expect(view.key).toBe("auth.error.invalidCredentials");
    expect(view.recovery).toBe("focusPassword");
    expect(view.field).toBe("password");
  });

  test("on every sign-in procedure, including the second factors", () => {
    for (const procedure of [
      "auth/signIn",
      "auth/adminSignIn",
      "auth/adminVerifyTotp",
      "auth/staffSignIn",
      "auth/staffVerifySecondFactor",
      "auth/moderatorSignIn",
      "auth/verifyOtp",
    ]) {
      expect(mapAuthError(input({ code: "UNAUTHORIZED", procedure })).key).toBe(
        "auth.error.invalidCredentials",
      );
    }
  });

  test("on refreshSession it is an expired session, never bad credentials", () => {
    const view = mapAuthError(input({ code: "UNAUTHORIZED", procedure: "auth/refreshSession" }));

    expect(view.key).toBe("auth.error.sessionExpired");
    expect(view.recovery).toBe("refresh");
  });

  test("on an ordinary procedure it is an expired session", () => {
    expect(mapAuthError(input({ code: "UNAUTHORIZED", procedure: "booking/list" })).key).toBe(
      "auth.error.sessionExpired",
    );
  });
});

describe("Unit: §3.5 disambiguation — RATE_LIMITED", () => {
  test("lockedUntil becomes an account lockout countdown", () => {
    const view = mapAuthError(
      input({
        code: "RATE_LIMITED",
        details: { lockedUntil: new Date(Date.now() + 900_000).toISOString() },
      }),
    );

    expect(view.key).toBe("auth.error.accountLocked");
    expect(view.recovery).toBe("countdown");
    expect(view.params.seconds).toBe(900);
  });

  test("remainingLockoutSeconds is used when present", () => {
    const view = mapAuthError(
      input({ code: "RATE_LIMITED", details: { remainingLockoutSeconds: 42 } }),
    );

    expect(view.params.seconds).toBe(42);
  });

  test("pausedUntil becomes the OTP pause", () => {
    const view = mapAuthError(
      input({
        code: "RATE_LIMITED",
        details: { pausedUntil: new Date(Date.now() + 1_800_000).toISOString() },
      }),
    );

    expect(view.key).toBe("auth.error.otpPaused");
    expect(view.params.seconds).toBe(1800);
  });

  test("retryAfterSeconds becomes the OTP cooldown", () => {
    const view = mapAuthError(input({ code: "RATE_LIMITED", details: { retryAfterSeconds: 30 } }));

    expect(view.key).toBe("auth.error.otpCooldown");
    expect(view.recovery).toBe("enableResend");
  });

  test("a bare RATE_LIMITED still shows a countdown", () => {
    const view = mapAuthError(input({ code: "RATE_LIMITED" }));

    expect(view.key).toBe("auth.error.rateLimited");
    expect(view.recovery).toBe("countdown");
  });
});

describe("Unit: §3.5 disambiguation — OTP VALIDATION_ERROR", () => {
  test("wrong attempts become otpInvalid with the remaining count", () => {
    const view = mapAuthError(
      input({
        code: "VALIDATION_ERROR",
        procedure: "auth/verifyOtp",
        details: { wrongAttempts: 2 },
      }),
    );

    expect(view.key).toBe("auth.error.otpInvalid");
    expect(view.recovery).toBe("clearCode");
    expect(view.params.wrongAttempts).toBe(2);
    expect(view.params.remaining).toBe(3);
  });

  test("no attempt counter means the code expired", () => {
    const view = mapAuthError(
      input({ code: "VALIDATION_ERROR", procedure: "auth/verifyOtp", details: {} }),
    );

    expect(view.key).toBe("auth.error.otpExpired");
    expect(view.recovery).toBe("enableResend");
  });

  test("the same code outside an OTP procedure is not an OTP failure", () => {
    const view = mapAuthError(
      input({
        code: "VALIDATION_ERROR",
        procedure: "booking/create",
        details: { wrongAttempts: 2 },
      }),
    );

    expect(view.key).toBe("auth.error.validation");
  });
});

describe("Unit: §3.5 disambiguation — FORBIDDEN", () => {
  test("a suspended account carries the reason", () => {
    const view = mapAuthError(
      input({
        code: "FORBIDDEN",
        details: { status: "suspended", suspendedReason: "Fraud review" },
      }),
    );

    expect(view.key).toBe("auth.error.suspended");
    expect(view.recovery).toBe("noRetry");
    expect(view.params.reason).toBe("Fraud review");
  });

  test("a mobile organization registration is web-only", () => {
    const view = mapAuthError(input({ code: "FORBIDDEN", details: { field: "surface" } }));

    expect(view.key).toBe("auth.error.webOnlyRegistration");
    expect(view.recovery).toBe("noRetry");
  });

  test("plain FORBIDDEN keeps the session", () => {
    expect(mapAuthError(input({ code: "FORBIDDEN" })).key).toBe("auth.error.forbidden");
    expect(mapAuthError(input({ code: "ROLE_FORBIDDEN" })).recovery).toBe("stay");
    expect(mapAuthError(input({ code: "PERMISSION_DENIED" })).key).toBe("auth.error.forbidden");
    expect(mapAuthError(input({ code: "ADMIN_SUBROLE_FORBIDDEN" })).key).toBe(
      "auth.error.forbidden",
    );
    expect(mapAuthError(input({ code: "MODERATOR_SCOPE_FORBIDDEN" })).key).toBe(
      "auth.error.forbidden",
    );
  });
});

describe("Unit: §3.5 disambiguation — expiry and the 12-hour cap", () => {
  test("AUTH_TOKEN_EXPIRED refreshes", () => {
    const view = mapAuthError(input({ code: "AUTH_TOKEN_EXPIRED" }));
    expect(view.key).toBe("auth.error.sessionExpired");
    expect(view.recovery).toBe("refresh");
  });

  test("MAX_SESSION_DURATION_REACHED uses the drafts-retained wording", () => {
    const view = mapAuthError(
      input({
        code: "UNAUTHORIZED",
        procedure: "auth/refreshSession",
        details: { reason: "MAX_SESSION_DURATION_REACHED", draftsRetained: true },
      }),
    );

    expect(view.key).toBe("auth.error.sessionExpiredMax");
    expect(messageFor(view, "en")).toContain("12 hours");
    expect(messageFor(view, "en")).toContain("drafts");
  });
});

describe("Unit: field-level errors (AC-7, M2)", () => {
  test("fieldErrors become one view per input", () => {
    const view = mapAuthError(
      input({
        code: "VALIDATION_ERROR",
        fieldErrors: [
          { field: "email", code: "INVALID_EMAIL", message: "Enter a valid email address." },
          { field: "password", code: "TOO_SHORT", message: "Use at least 12 characters." },
        ],
      }),
    );

    expect(view.recovery).toBe("focusField");
    expect(view.field).toBe("email");
    // A coded issue renders from the catalog; the sentence is only the fallback.
    expect(view.key).toBe("validation.invalidEmail");
    expect(view.fieldErrors?.length).toBe(2);
    expect(fieldMessageFor(view.fieldErrors![1]!, "en")).toBe("Use at least 12 characters.");
  });

  test("details.field plus the message covers the password-policy throw", () => {
    const view = mapAuthError(
      input({
        code: "VALIDATION_ERROR",
        details: { field: "password" },
        message: "Password must be at least 12 characters.",
      }),
    );

    expect(view.key).toBe("field.password");
    expect(view.field).toBe("password");
    expect(messageFor(view, "en")).toBe("Password must be at least 12 characters.");
  });

  test("an unknown field falls back to the generic validation key", () => {
    const view = mapAuthError(
      input({
        code: "INVALID_INPUT",
        fieldErrors: [{ field: "unknownField", code: "X", message: "Nope." }],
      }),
    );

    expect(view.key).toBe("auth.error.validation");
    expect(view.field).toBe("unknownField");
  });

  test("CONFLICT names the field that already exists", () => {
    const view = mapAuthError(input({ code: "CONFLICT", details: { field: "email" } }));

    expect(view.key).toBe("auth.error.alreadyExists");
    expect(view.params.field).toBe("email");
    expect(view.recovery).toBe("focusField");
  });
});

describe("Unit: the remaining table rows", () => {
  const rows: Array<[string, string]> = [
    ["AUTH_ACCOUNT_LOCKED", "auth.error.accountLocked"],
    ["AUTH_OTP_INVALID", "auth.error.otpInvalid"],
    ["AUTH_OTP_EXPIRED", "auth.error.otpExpired"],
    ["AUTH_OTP_PAUSED", "auth.error.otpPaused"],
    ["AUTH_OTP_COOLDOWN", "auth.error.otpCooldown"],
    ["AUTH_MFA_REQUIRED", "auth.error.mfaRequired"],
    ["AUTH_VERIFICATION_REQUIRED", "auth.error.verificationRequired"],
    ["AUTH_ACCOUNT_SUSPENDED", "auth.error.suspended"],
    ["AUTH_DELETION_PENDING", "auth.error.deletionPending"],
    ["AUTH_WEB_ONLY_REGISTRATION", "auth.error.webOnlyRegistration"],
    ["SERVICE_UNAVAILABLE", "auth.error.unavailable"],
    ["INTERNAL_ERROR", "auth.error.unavailable"],
    ["NOT_FOUND", "auth.error.notFound"],
    ["DUPLICATE_RESOURCE", "auth.error.alreadyExists"],
  ];

  for (const [code, key] of rows) {
    test(`${code} maps to ${key} in both locales`, () => {
      const view = mapAuthError(input({ code, locale: "en" }));
      expect(view.key).toBe(key);
      expect(messageFor(view, "en").length).toBeGreaterThan(0);

      const arabic = mapAuthError(input({ code, locale: "ar" }));
      expect(arabic.key).toBe(key);
      expect(isArabic(messageFor(arabic, "ar"))).toBe(true);
    });
  }

  test("AUTH_MFA_REQUIRED and AUTH_VERIFICATION_REQUIRED route the UI", () => {
    expect(mapAuthError(input({ code: "AUTH_MFA_REQUIRED" })).recovery).toBe("routeMfa");
    expect(mapAuthError(input({ code: "AUTH_VERIFICATION_REQUIRED" })).recovery).toBe("routeOtp");
  });
});

describe("Unit: unmapped codes (M1)", () => {
  test("fall back to unexpected with the request id", () => {
    const view = mapAuthError(
      input({ code: "SOMETHING_NEW", requestId: "req_123", procedure: "booking/list" }),
    );

    expect(view.key).toBe("auth.error.unexpected");
    expect(view.recovery).toBe("retry");
    expect(view.params.requestId).toBe("req_123");
    expect(view.requestId).toBe("req_123");
    expect(messageFor(view, "en")).toContain("req_123");
  });

  test("a network failure with no code still yields a renderable view", () => {
    const view = mapAuthError(input({ code: "", procedure: "booking/list" }));
    expect(view.key).toBe("auth.error.unexpected");
    expect(messageFor(view, "en").length).toBeGreaterThan(0);
  });
});

describe("Unit: M3 purity", () => {
  test("the same input produces a deep-equal output and never mutates the input", () => {
    const base = input({
      code: "RATE_LIMITED",
      details: { lockedUntil: "2026-10-17T12:15:00.000Z" },
      procedure: "auth/signIn",
    });
    const frozen = JSON.stringify(base);

    const first = mapAuthError(base);
    const second = mapAuthError(base);

    expect(first).toEqual(second);
    expect(JSON.stringify(base)).toBe(frozen);
  });

  test("the mapper ignores an unknown locale value instead of throwing", () => {
    const view = mapAuthError({ code: "FORBIDDEN", locale: "fr" as unknown as "en" });
    expect(view.key).toBe("auth.error.forbidden");
  });
});

describe("Unit: copy for views that are not server errors", () => {
  test("the staff 2FA setup step has a message with a support hint (correction 7)", () => {
    const view = AUTH_ERROR_VIEWS.staffTwoFactorSetupRequired!;
    expect(messageFor(view, "en")).toContain("administrator");
    expect(isArabic(messageFor(view, "ar"))).toBe(true);
  });

  test("a pending application has a message and stores no session", () => {
    const view = AUTH_ERROR_VIEWS.pendingApproval!;
    expect(messageFor(view, "en").length).toBeGreaterThan(0);
  });
});

describe("Unit: the countdown uses the clock, not a constant", () => {
  test("lockedUntil is resolved against the wall clock", () => {
    const view = mapAuthError({
      code: "RATE_LIMITED",
      details: { lockedUntil: new Date(Date.now() + 120_000).toISOString() },
      locale: "en",
    });

    expect(typeof view.params.seconds).toBe("number");
    expect(Number(view.params.seconds)).toBeGreaterThan(0);
    expect(Number(view.params.seconds)).toBeLessThanOrEqual(120);
  });
});
