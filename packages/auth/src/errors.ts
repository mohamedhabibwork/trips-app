// One error mapper for every platform (PRD §7.6, §3.5 of the architecture): server code → i18n key →
// localized message + recovery action. Pure: the same input always produces a deep-equal view (M3).
import { t } from "@trips-app/i18n";
import {
  AUTH_ERROR_ROWS,
  AUTH_FIELD_NAMES,
  FALLBACK_ERROR_KEY,
  OTP_MAX_WRONG_ATTEMPTS,
  errorRowForCode,
} from "./conventions/index";
import {
  isMaxSessionReason,
  isOtpProcedure,
  isSignInProcedure,
  lockoutSecondsRemaining,
  remainingOtpAttempts,
} from "./refresh-policy";
import type {
  AuthErrorFieldIssue,
  AuthErrorFieldView,
  AuthErrorInput,
  AuthErrorRecovery,
  AuthErrorView,
  AuthLocale,
} from "./types";

type Params = Record<string, string | number>;

/**
 * Codes that mean "the input was rejected". `BAD_REQUEST` and the 422 aliases are what oRPC reports
 * for a zod failure; the other two are the service's own validation codes.
 */
const VALIDATION_CODES: ReadonlySet<string> = new Set([
  "VALIDATION_ERROR",
  "INVALID_INPUT",
  "BAD_REQUEST",
  "UNPROCESSABLE_CONTENT",
  "UNPROCESSABLE_ENTITY",
]);

function isValidationCode(code: string): boolean {
  return VALIDATION_CODES.has(code);
}

/** Views that are not server errors: a `step` the P0 UI has no screen for, and a pending application. */
export const AUTH_ERROR_VIEWS: Readonly<Record<string, AuthErrorView>> = {
  /** Correction 7: `staff_2fa_setup_required` has no P0 screen. */
  staffTwoFactorSetupRequired: {
    key: "auth.error.staff2faSetupRequired",
    params: {},
    recovery: "noRetry",
  },
  pendingApproval: {
    key: "auth.error.pendingApproval",
    params: {},
    recovery: "stay",
  },
};

/**
 * Canonical validation codes → catalog keys.
 *
 * The server, the web app and the Kotlin app agree on these codes, so a rejected input is
 * localized at render time instead of shipping English prose across the wire. A code that is not
 * in this table falls back to the server sentence, then to `auth.error.validation`.
 */
const VALIDATION_KEYS: Readonly<Record<string, string>> = {
  REQUIRED: "validation.required",
  TOO_SHORT: "validation.tooShort",
  TOO_LONG: "validation.tooLong",
  NUMBER_TOO_SMALL: "validation.numberTooSmall",
  NUMBER_TOO_LARGE: "validation.numberTooLarge",
  OUT_OF_RANGE: "validation.outOfRange",
  INVALID_EMAIL: "validation.invalidEmail",
  INVALID_PHONE: "validation.invalidPhone",
  INVALID_CODE: "validation.invalidCode",
  INVALID_FORMAT: "validation.invalidFormat",
  INVALID_CHOICE: "validation.invalidChoice",
  INVALID_TYPE: "validation.invalidType",
  PASSWORD_BREACHED: "validation.passwordBreached",
  UNKNOWN_VALIDATION: "validation.unknown",
};

/** Every validation key the mapper can emit, for the drift test. */
export const VALIDATION_MESSAGE_KEYS: readonly string[] = [
  ...new Set(Object.values(VALIDATION_KEYS)),
];

/**
 * Parameters a code cannot render without. A code that arrives without them falls back to the
 * server's sentence instead of showing a raw `{min}` to the user.
 */
const REQUIRED_VALIDATION_PARAMS: Readonly<Record<string, readonly string[]>> = {
  TOO_SHORT: ["min"],
  TOO_LONG: ["max"],
  NUMBER_TOO_SMALL: ["min"],
  NUMBER_TOO_LARGE: ["max"],
  OUT_OF_RANGE: ["min", "max"],
  INVALID_CODE: ["length"],
};

/**
 * Every message key this module can emit. The drift test asserts this set equals the `auth.*` +
 * `field.*` key set of `packages/i18n/src/auth/en.ts` in both locales, so adding a row on one
 * side alone fails CI (ARCHITECTURE §6 rule 2).
 */
export const AUTH_ERROR_MESSAGE_KEYS: readonly string[] = buildMessageKeys();

/**
 * Maps a server failure to the only shape a screen renders.
 *
 * Disambiguation (§3.5) runs before the table because the real backend emits fewer codes than the
 * PRD assumed: `UNAUTHORIZED` carries sign-in failures, `RATE_LIMITED` carries three different
 * countdowns, and the `AUTH_OTP_*` codes are never emitted.
 */
export function mapAuthError(input: AuthErrorInput): AuthErrorView {
  const code = typeof input.code === "string" ? input.code : "";
  const details = isRecord(input.details) ? input.details : {};
  const procedure = typeof input.procedure === "string" ? input.procedure : "";
  const requestId = input.requestId;

  // 1. UNAUTHORIZED is procedure-aware: a sign-in 401 is bad credentials, anything else is expiry.
  //    The 12-hour cap arrives as `details.reason` on the same code (F2), so it is checked first.
  if (code === "UNAUTHORIZED") {
    if (isMaxSessionReason(details)) {
      return makeView("auth.error.sessionExpiredMax", {}, "refresh", { requestId });
    }
    return isSignInProcedure(procedure)
      ? makeView("auth.error.invalidCredentials", {}, "focusPassword", {
          field: "password",
          requestId,
        })
      : makeView("auth.error.sessionExpired", {}, "refresh", { requestId });
  }

  // 2. RATE_LIMITED carries a lockout, an OTP pause, or an OTP cooldown (§1.2).
  if (code === "RATE_LIMITED") {
    const seconds = lockoutSecondsRemaining(details);
    if (details.lockedUntil !== undefined || details.remainingLockoutSeconds !== undefined) {
      return makeView("auth.error.accountLocked", { seconds }, "countdown", { requestId });
    }
    if (details.pausedUntil !== undefined) {
      return makeView("auth.error.otpPaused", { seconds }, "countdown", { requestId });
    }
    if (details.retryAfterSeconds !== undefined) {
      return makeView("auth.error.otpCooldown", { seconds }, "enableResend", { requestId });
    }
    return makeView("auth.error.rateLimited", { seconds }, "countdown", { requestId });
  }

  // 3. FORBIDDEN: suspended account, mobile organization registration, or plain no-access.
  if (code === "FORBIDDEN") {
    if (details.status === "suspended") {
      const reason =
        typeof details.suspendedReason === "string" && details.suspendedReason.length > 0
          ? details.suspendedReason
          : "—";
      return makeView("auth.error.suspended", { reason }, "noRetry", { requestId });
    }
    if (details.field === "surface") {
      return makeView("auth.error.webOnlyRegistration", {}, "noRetry", { requestId });
    }
    return makeView("auth.error.forbidden", {}, "stay", { requestId });
  }

  // 4. Expiry, with the 12-hour cap surfaced as a detail rather than a code (F2).
  if (code === "AUTH_TOKEN_EXPIRED" || code === "AUTH_SESSION_EXPIRED") {
    return isMaxSessionReason(details)
      ? makeView("auth.error.sessionExpiredMax", {}, "refresh", { requestId })
      : makeView("auth.error.sessionExpired", {}, "refresh", { requestId });
  }

  // 5. OTP failures arrive as VALIDATION_ERROR; the attempt counter disambiguates (§1.2).
  if ((code === "VALIDATION_ERROR" || code === "INVALID_INPUT") && isOtpProcedure(procedure)) {
    const wrongAttempts = finiteNumber(details.wrongAttempts) ?? 0;
    if (wrongAttempts >= 1) {
      return makeView(
        "auth.error.otpInvalid",
        { wrongAttempts, remaining: remainingOtpAttempts(details, OTP_MAX_WRONG_ATTEMPTS) },
        "clearCode",
        { requestId },
      );
    }
    return makeView("auth.error.otpExpired", {}, "enableResend", { requestId });
  }

  // 6. Field-level issues: `fieldErrors[]` from the envelope, or the single `details.field` the
  //    auth service throws for password-policy and duplicate-contact failures. `BAD_REQUEST` and
  //    the 422 aliases are included because that is what oRPC reports when a zod schema rejects the
  //    input — without them a rejected form would fall through to the generic error.
  if (isValidationCode(code)) {
    const issues = collectFieldIssues(input, details);
    if (issues.length > 0) {
      const views = issues.map((issue) => toFieldView(issue));
      const first = views[0]!;
      return {
        key: first.key,
        params: first.params,
        field: first.field,
        recovery: "focusField",
        requestId,
        fieldErrors: views,
      };
    }
  }

  // 7. The table (§7.6), including the `AUTH_*` codes the backend does not emit yet.
  const row = errorRowForCode(code);
  if (row) {
    return makeView(row.key, paramsForRow(row.key, details), row.recovery, {
      field: row.field,
      requestId,
    });
  }

  // 8. M1: never a raw code, never a stack trace — a key plus the request id for support.
  return makeView(FALLBACK_ERROR_KEY, { requestId: requestId ?? "—" }, "retry", { requestId });
}

/** Localizes a view through `@trips-app/i18n` (I1: no user-facing string lives in a component). */
export function messageFor(view: AuthErrorView, locale: AuthLocale): string {
  const rendered = t(view.key, locale, view.params);
  if (rendered === view.key && view.key !== FALLBACK_ERROR_KEY) {
    return t(FALLBACK_ERROR_KEY, locale, { requestId: view.requestId ?? "—" });
  }
  return rendered;
}

/** The message for one field-level issue, used under the input. */
export function fieldMessageFor(view: AuthErrorFieldView, locale: AuthLocale): string {
  return t(view.key, locale, view.params);
}

function makeView(
  key: string,
  params: Params,
  recovery: AuthErrorRecovery,
  extra: { field?: string; requestId?: string } = {},
): AuthErrorView {
  const view: AuthErrorView = { key, params, recovery };
  if (extra.field !== undefined) view.field = extra.field;
  if (extra.requestId !== undefined) view.requestId = extra.requestId;
  return view;
}

/** Countdown and identifier params a table row needs, derived from `details`. */
function paramsForRow(key: string, details: Record<string, unknown>): Params {
  switch (key) {
    case "auth.error.accountLocked":
    case "auth.error.otpPaused":
    case "auth.error.otpCooldown":
    case "auth.error.rateLimited":
      return { seconds: lockoutSecondsRemaining(details) };
    case "auth.error.otpInvalid":
      return {
        wrongAttempts: finiteNumber(details.wrongAttempts) ?? 0,
        remaining: remainingOtpAttempts(details, OTP_MAX_WRONG_ATTEMPTS),
      };
    case "auth.error.suspended":
      return {
        reason:
          typeof details.suspendedReason === "string" && details.suspendedReason.length > 0
            ? details.suspendedReason
            : "—",
      };
    case "auth.error.alreadyExists":
      return { field: typeof details.field === "string" ? details.field : "—" };
    default:
      return {};
  }
}

function collectFieldIssues(
  input: AuthErrorInput,
  details: Record<string, unknown>,
): AuthErrorFieldIssue[] {
  const issues: AuthErrorFieldIssue[] = [];
  if (Array.isArray(input.fieldErrors)) {
    for (const issue of input.fieldErrors) {
      if (issue && typeof issue.field === "string" && issue.field.length > 0) {
        issues.push({
          field: issue.field,
          code: typeof issue.code === "string" ? issue.code : "VALIDATION_ERROR",
          message: typeof issue.message === "string" ? issue.message : "",
          ...(issue.params ? { params: { ...issue.params } } : {}),
        });
      }
    }
  }
  if (issues.length === 0 && typeof details.field === "string" && details.field.length > 0) {
    issues.push({
      field: details.field,
      code: "VALIDATION_ERROR",
      message: typeof input.message === "string" ? input.message : "",
    });
  }
  return issues;
}

/** The key and params for a coded validation issue, or `null` when the code is unknown. */
function validationViewFor(issue: AuthErrorFieldIssue): { key: string; params: Params } | null {
  const code = issue.code.toUpperCase();
  const key = VALIDATION_KEYS[code];
  if (key === undefined) return null;

  const params: Params = { ...issue.params };
  for (const name of REQUIRED_VALIDATION_PARAMS[code] ?? []) {
    if (params[name] === undefined) return null;
  }
  return { key, params };
}

/**
 * A field issue always maps to an existing key: a `validation.*` key when the server sent a known
 * code, `field.<name>` when it only sent a sentence, otherwise the generic validation key. The
 * server's sentence travels in `params.message`, so the input shows the real reason even when the
 * code is new to this build (AC-7, I1).
 */
function toFieldView(issue: AuthErrorFieldIssue): AuthErrorFieldView {
  const validation = validationViewFor(issue);
  if (validation) {
    return {
      field: issue.field,
      key: validation.key,
      params: validation.params,
      message: issue.message,
    };
  }

  const known = AUTH_FIELD_NAMES.includes(issue.field);
  const hasMessage = issue.message.trim().length > 0;
  if (known && hasMessage) {
    return {
      field: issue.field,
      key: `field.${issue.field}`,
      params: { field: issue.field, message: issue.message },
      message: issue.message,
    };
  }
  if (known) {
    return {
      field: issue.field,
      key: `field.${issue.field}`,
      params: { field: issue.field, message: issue.field },
      message: issue.field,
    };
  }
  return {
    field: issue.field,
    key: "auth.error.validation",
    params: { field: issue.field, message: issue.message },
    message: issue.message,
  };
}

function buildMessageKeys(): readonly string[] {
  const keys = new Set<string>();
  keys.add(FALLBACK_ERROR_KEY);
  for (const row of AUTH_ERROR_ROWS) keys.add(row.key);
  for (const view of Object.values(AUTH_ERROR_VIEWS)) keys.add(view.key);
  // Keys the disambiguation steps emit that are not table rows.
  keys.add("auth.error.invalidCredentials");
  keys.add("auth.error.sessionExpired");
  keys.add("auth.error.sessionExpiredMax");
  keys.add("auth.error.accountLocked");
  keys.add("auth.error.otpPaused");
  keys.add("auth.error.otpCooldown");
  keys.add("auth.error.rateLimited");
  keys.add("auth.error.otpInvalid");
  keys.add("auth.error.otpExpired");
  keys.add("auth.error.suspended");
  keys.add("auth.error.forbidden");
  keys.add("auth.error.webOnlyRegistration");
  keys.add("auth.error.validation");
  for (const field of AUTH_FIELD_NAMES) keys.add(`field.${field}`);
  for (const key of VALIDATION_MESSAGE_KEYS) keys.add(key);
  return [...keys].sort();
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
