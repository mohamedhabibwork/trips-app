// The complete §3.1 error matrix, in both shipped locales (PRD §7.6, AC-7, M3).
//
// Every row is asserted on the *rule* — key, recovery, field — never on a sentence, so copy can be
// edited freely while a mapping regression fails. Locale coverage is part of the rule: a key that
// renders English to an Arabic user is a bug in this product (I2 makes Arabic the default).
import { describe, expect, test } from "bun:test";

import { mapAuthError, messageFor } from "../src/index";
import type { AuthErrorInput, AuthErrorView } from "../src/index";

interface Row {
  /** What the backend actually sends, in the words of the design's §3.1 table. */
  readonly condition: string;
  /** `locale` is supplied per assertion, so it is omitted here; `code` is always known. */
  readonly input: Omit<AuthErrorInput, "locale">;
  readonly key: string;
  readonly recovery: AuthErrorView["recovery"];
  readonly field?: string;
  /**
   * True for `field.<name>` rows: their template is `{message}`, i.e. the server's already-localized
   * sentence (PRD §7.7 I3), so the rendered text is the server's language, not the catalog's.
   */
  readonly sentenceFromServer?: string;
}

const ROWS: readonly Row[] = [
  {
    condition: "UNAUTHORIZED on a sign-in procedure",
    input: { code: "UNAUTHORIZED", procedure: "auth/signIn" },
    key: "auth.error.invalidCredentials",
    recovery: "focusPassword",
    field: "password",
  },
  {
    condition: "UNAUTHORIZED on auth/refreshSession",
    input: { code: "UNAUTHORIZED", procedure: "auth/refreshSession" },
    key: "auth.error.sessionExpired",
    recovery: "refresh",
  },
  {
    condition: "UNAUTHORIZED with the 12-hour reason",
    input: {
      code: "UNAUTHORIZED",
      procedure: "auth/refreshSession",
      details: { reason: "MAX_SESSION_DURATION_REACHED", draftsRetained: true },
    },
    key: "auth.error.sessionExpiredMax",
    recovery: "refresh",
  },
  {
    condition: "RATE_LIMITED with lockedUntil",
    input: { code: "RATE_LIMITED", details: { lockedUntil: "2026-10-17T12:15:00.000Z" } },
    key: "auth.error.accountLocked",
    recovery: "countdown",
  },
  {
    condition: "RATE_LIMITED with remainingLockoutSeconds",
    input: { code: "RATE_LIMITED", details: { remainingLockoutSeconds: 600 } },
    key: "auth.error.accountLocked",
    recovery: "countdown",
  },
  {
    condition: "RATE_LIMITED with pausedUntil",
    input: { code: "RATE_LIMITED", details: { pausedUntil: "2026-10-17T12:30:00.000Z" } },
    key: "auth.error.otpPaused",
    recovery: "countdown",
  },
  {
    condition: "RATE_LIMITED with retryAfterSeconds",
    input: { code: "RATE_LIMITED", details: { retryAfterSeconds: 45 } },
    key: "auth.error.otpCooldown",
    recovery: "enableResend",
  },
  {
    condition: "RATE_LIMITED with no details",
    input: { code: "RATE_LIMITED" },
    key: "auth.error.rateLimited",
    recovery: "countdown",
  },
  {
    condition: "VALIDATION_ERROR on an OTP procedure with wrongAttempts",
    input: { code: "VALIDATION_ERROR", procedure: "auth/verifyOtp", details: { wrongAttempts: 1 } },
    key: "auth.error.otpInvalid",
    recovery: "clearCode",
  },
  {
    condition: "VALIDATION_ERROR on an OTP procedure with no counter",
    input: { code: "VALIDATION_ERROR", procedure: "auth/verifyOtp", details: {} },
    key: "auth.error.otpExpired",
    recovery: "enableResend",
  },
  {
    condition: "FORBIDDEN for a suspended account",
    input: { code: "FORBIDDEN", details: { status: "suspended", suspendedReason: "Fraud review" } },
    key: "auth.error.suspended",
    recovery: "noRetry",
  },
  {
    condition: "FORBIDDEN on the surface field",
    input: { code: "FORBIDDEN", details: { field: "surface" } },
    key: "auth.error.webOnlyRegistration",
    recovery: "noRetry",
  },
  {
    condition: "plain FORBIDDEN",
    input: { code: "FORBIDDEN" },
    key: "auth.error.forbidden",
    recovery: "stay",
  },
  {
    condition: "ROLE_FORBIDDEN",
    input: { code: "ROLE_FORBIDDEN" },
    key: "auth.error.forbidden",
    recovery: "stay",
  },
  {
    condition: "PERMISSION_DENIED",
    input: { code: "PERMISSION_DENIED" },
    key: "auth.error.forbidden",
    recovery: "stay",
  },
  {
    condition: "ADMIN_SUBROLE_FORBIDDEN",
    input: { code: "ADMIN_SUBROLE_FORBIDDEN" },
    key: "auth.error.forbidden",
    recovery: "stay",
  },
  {
    condition: "MODERATOR_SCOPE_FORBIDDEN",
    input: { code: "MODERATOR_SCOPE_FORBIDDEN" },
    key: "auth.error.forbidden",
    recovery: "stay",
  },
  {
    condition: "VALIDATION_ERROR with fieldErrors",
    input: {
      code: "VALIDATION_ERROR",
      fieldErrors: [{ field: "email", code: "INVALID_EMAIL", message: "Enter a valid email." }],
    },
    key: "field.email",
    recovery: "focusField",
    field: "email",
    sentenceFromServer: "Enter a valid email.",
  },
  {
    condition: "VALIDATION_ERROR with details.field and a message",
    input: { code: "VALIDATION_ERROR", details: { field: "password" }, message: "Too short." },
    key: "field.password",
    recovery: "focusField",
    field: "password",
    sentenceFromServer: "Too short.",
  },
  {
    condition: "CONFLICT on a field",
    input: { code: "CONFLICT", details: { field: "email" } },
    key: "auth.error.alreadyExists",
    recovery: "focusField",
  },
  {
    condition: "DUPLICATE_RESOURCE",
    input: { code: "DUPLICATE_RESOURCE" },
    key: "auth.error.alreadyExists",
    recovery: "focusField",
  },
  {
    condition: "AUTH_MFA_REQUIRED",
    input: { code: "AUTH_MFA_REQUIRED" },
    key: "auth.error.mfaRequired",
    recovery: "routeMfa",
  },
  {
    condition: "AUTH_VERIFICATION_REQUIRED",
    input: { code: "AUTH_VERIFICATION_REQUIRED" },
    key: "auth.error.verificationRequired",
    recovery: "routeOtp",
  },
  {
    condition: "AUTH_WEB_ONLY_REGISTRATION",
    input: { code: "AUTH_WEB_ONLY_REGISTRATION" },
    key: "auth.error.webOnlyRegistration",
    recovery: "noRetry",
  },
  {
    condition: "AUTH_DELETION_PENDING",
    input: { code: "AUTH_DELETION_PENDING" },
    key: "auth.error.deletionPending",
    recovery: "stay",
  },
  {
    condition: "AUTH_ACCOUNT_LOCKED",
    input: { code: "AUTH_ACCOUNT_LOCKED", details: { remainingLockoutSeconds: 60 } },
    key: "auth.error.accountLocked",
    recovery: "countdown",
  },
  {
    condition: "AUTH_OTP_INVALID",
    input: { code: "AUTH_OTP_INVALID" },
    key: "auth.error.otpInvalid",
    recovery: "clearCode",
  },
  {
    condition: "AUTH_OTP_EXPIRED",
    input: { code: "AUTH_OTP_EXPIRED" },
    key: "auth.error.otpExpired",
    recovery: "enableResend",
  },
  {
    condition: "AUTH_OTP_PAUSED",
    input: { code: "AUTH_OTP_PAUSED", details: { pausedUntil: "2026-10-17T12:30:00.000Z" } },
    key: "auth.error.otpPaused",
    recovery: "countdown",
  },
  {
    condition: "AUTH_OTP_COOLDOWN",
    input: { code: "AUTH_OTP_COOLDOWN", details: { retryAfterSeconds: 30 } },
    key: "auth.error.otpCooldown",
    recovery: "enableResend",
  },
  {
    condition: "AUTH_ACCOUNT_SUSPENDED",
    input: { code: "AUTH_ACCOUNT_SUSPENDED" },
    key: "auth.error.suspended",
    recovery: "noRetry",
  },
  {
    condition: "AUTH_TOKEN_EXPIRED",
    input: { code: "AUTH_TOKEN_EXPIRED" },
    key: "auth.error.sessionExpired",
    recovery: "refresh",
  },
  {
    condition: "AUTH_SESSION_EXPIRED",
    input: { code: "AUTH_SESSION_EXPIRED" },
    key: "auth.error.sessionExpired",
    recovery: "refresh",
  },
  {
    condition: "INTERNAL_ERROR",
    input: { code: "INTERNAL_ERROR" },
    key: "auth.error.unavailable",
    recovery: "retry",
  },
  {
    condition: "SERVICE_UNAVAILABLE",
    input: { code: "SERVICE_UNAVAILABLE" },
    key: "auth.error.unavailable",
    recovery: "retry",
  },
  {
    condition: "NOT_FOUND",
    input: { code: "NOT_FOUND" },
    key: "auth.error.notFound",
    recovery: "stay",
  },
  {
    condition: "RESOURCE_NOT_FOUND",
    input: { code: "RESOURCE_NOT_FOUND" },
    key: "auth.error.notFound",
    recovery: "stay",
  },
  {
    condition: "TENANT_NOT_FOUND",
    input: { code: "TENANT_NOT_FOUND" },
    key: "auth.error.notFound",
    recovery: "stay",
  },
  {
    condition: "an unmapped code",
    input: { code: "BRAND_NEW_CODE", requestId: "req_unmapped" },
    key: "auth.error.unexpected",
    recovery: "retry",
  },
];

/** Arabic letters, so a missing translation cannot pass as Arabic. */
const ARABIC = /[\u0600-\u06FF]/;

function view(row: Row, locale: "en" | "ar"): AuthErrorView {
  return mapAuthError({ locale, ...row.input });
}

describe("Unit: §3.1 row → key, recovery and field, in both locales", () => {
  test("the table under test covers every row the design lists", () => {
    // 39 conditions, one per line of §3.1 (several rows list multiple codes).
    expect(ROWS.length).toBe(39);
    expect(new Set(ROWS.map((row) => row.key)).size).toBeGreaterThan(15);
  });

  for (const row of ROWS) {
    test(`${row.condition} → ${row.key} (en + ar)`, () => {
      const english = view(row, "en");
      const arabic = view(row, "ar");

      expect(english.key).toBe(row.key);
      expect(arabic.key).toBe(row.key);

      expect(english.recovery).toBe(row.recovery);
      expect(arabic.recovery).toBe(row.recovery);

      if (row.field !== undefined) {
        expect(english.field).toBe(row.field);
        expect(arabic.field).toBe(row.field);
      }

      const englishMessage = messageFor(english, "en");
      const arabicMessage = messageFor(arabic, "ar");

      expect(englishMessage.length).toBeGreaterThan(0);
      expect(arabicMessage.length).toBeGreaterThan(0);
      // A key that resolves to its own name means missing copy (messageFor falls back, so assert
      // the *content* differs from the key).
      expect(englishMessage).not.toBe(row.key);
      expect(arabicMessage).not.toBe(row.key);

      if (row.sentenceFromServer !== undefined) {
        // I3: the server's localized sentence is what the input shows, in both locales.
        expect(englishMessage).toBe(row.sentenceFromServer);
        expect(arabicMessage).toBe(row.sentenceFromServer);
        return;
      }
      expect(ARABIC.test(arabicMessage)).toBe(true);
    });
  }
});

describe("Unit: field errors take priority", () => {
  test("fieldErrors win over details.field when both are present", () => {
    const view1 = mapAuthError({
      code: "VALIDATION_ERROR",
      locale: "en",
      details: { field: "password" },
      fieldErrors: [{ field: "email", code: "INVALID_EMAIL", message: "Bad email." }],
    });

    expect(view1.field).toBe("email");
    expect(view1.key).toBe("field.email");
    expect(view1.fieldErrors?.length).toBe(1);
  });

  test("every fieldError becomes its own view, in order", () => {
    const view1 = mapAuthError({
      code: "INVALID_INPUT",
      locale: "ar",
      fieldErrors: [
        { field: "fullName", code: "REQUIRED", message: "مطلوب" },
        { field: "country", code: "REQUIRED", message: "مطلوب" },
        { field: "phone", code: "INVALID", message: "غير صالح" },
      ],
    });

    expect(view1.fieldErrors?.map((issue) => issue.field)).toEqual([
      "fullName",
      "country",
      "phone",
    ]);
    expect(view1.fieldErrors?.map((issue) => issue.key)).toEqual([
      "field.fullName",
      "field.country",
      "field.phone",
    ]);
  });

  test("field errors do not leak into a non-validation code", () => {
    const view1 = mapAuthError({
      code: "CONFLICT",
      locale: "en",
      fieldErrors: [{ field: "email", code: "DUPLICATE", message: "Taken." }],
      details: { field: "email" },
    });

    // CONFLICT is a table row: it names the field but keeps its own key (M2 puts the message under
    // the input, and the table decides the copy).
    expect(view1.key).toBe("auth.error.alreadyExists");
    expect(view1.params.field).toBe("email");
  });
});

describe("Unit: M1 — the raw code is never user-visible", () => {
  test("an unmapped code never appears in either message", () => {
    const view1 = mapAuthError({
      code: "TOTALLY_UNKNOWN",
      locale: "en",
      requestId: "req_42",
      procedure: "booking/create",
    });

    expect(view1.key).toBe("auth.error.unexpected");
    expect(view1.params.requestId).toBe("req_42");
    expect(view1.requestId).toBe("req_42");
    expect(messageFor(view1, "en")).not.toContain("TOTALLY_UNKNOWN");
    expect(messageFor(view1, "ar")).not.toContain("TOTALLY_UNKNOWN");
  });

  test("an unmapped code with no request id still renders (— placeholder)", () => {
    const view1 = mapAuthError({ code: "TOTALLY_UNKNOWN", locale: "en" });

    expect(view1.params.requestId).toBe("—");
    expect(messageFor(view1, "en").length).toBeGreaterThan(0);
  });

  test("a view whose key is missing from the catalog falls back to the unexpected copy", () => {
    const orphan: AuthErrorView = {
      key: "auth.error.notInTheCatalog",
      params: {},
      recovery: "retry",
    };
    const rendered = messageFor(orphan, "en");

    expect(rendered).not.toBe(orphan.key);
    expect(rendered.length).toBeGreaterThan(0);
  });
});

describe("Unit: M3 purity across every row", () => {
  test("two calls with the same input are deep-equal and neither mutates the input", () => {
    for (const row of ROWS) {
      const input: AuthErrorInput = { locale: "en", ...row.input };
      const snapshot = JSON.stringify(input);

      const first = mapAuthError(input);
      const second = mapAuthError({ ...input });

      expect(first).toEqual(second);
      expect(JSON.stringify(input)).toBe(snapshot);
    }
  });

  test("the returned params are a fresh object each time", () => {
    const first = mapAuthError({
      code: "RATE_LIMITED",
      details: { retryAfterSeconds: 5 },
      locale: "en",
    });
    const second = mapAuthError({
      code: "RATE_LIMITED",
      details: { retryAfterSeconds: 5 },
      locale: "en",
    });

    expect(first.params).not.toBe(second.params);
    expect(first.params).toEqual(second.params);
  });
});
