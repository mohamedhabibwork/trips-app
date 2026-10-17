// Web-side error plumbing: unwrap the oRPC error (or a raw RPC failure) and hand the shared mapper
// exactly the fields it needs. The mapping table itself lives in @trips-app/auth.
import { mapAuthError, OTP_CODE_LENGTH, SessionExpiredError } from "@trips-app/auth";
import type { AuthErrorFieldIssue, AuthErrorView, AuthLocale } from "@trips-app/auth";

/** The envelope keys `toORPCError` adds; everything else at the top level is a `details` entry. */
const ENVELOPE_KEYS = new Set(["success", "data", "error", "requestId", "meta"]);

/** A normalised transport failure — what the controller and the mapper both consume. */
export interface TransportFailure {
  status: number;
  code: string;
  details?: Record<string, unknown>;
  procedure?: string;
  message?: string;
  requestId?: string;
  fieldErrors?: AuthErrorFieldIssue[];
}

/**
 * Reads status/code/details/requestId out of anything thrown by the transport.
 *
 * `toORPCError` spreads `details` into `error.data` **and** nests them under `error.data.error
 * .details`; the nested copy wins because it cannot contain envelope keys.
 */
export function extractTransportError(error: unknown, procedure = ""): TransportFailure {
  if (error instanceof SessionExpiredError) {
    return {
      status: 401,
      code: "AUTH_SESSION_EXPIRED",
      procedure,
      message: error.message,
      details: error.maxSessionReached ? { reason: "MAX_SESSION_DURATION_REACHED" } : undefined,
    };
  }

  const candidate = isRecord(error) ? error : {};
  const data = isRecord(candidate.data) ? candidate.data : {};
  const errorPayload = isRecord(data.error) ? data.error : {};
  const meta = isRecord(data.meta) ? data.meta : {};

  const details: Record<string, unknown> = {};
  const nested = isRecord(errorPayload.details) ? errorPayload.details : {};
  for (const [key, value] of Object.entries(nested)) details[key] = value;
  for (const [key, value] of Object.entries(data)) {
    if (ENVELOPE_KEYS.has(key)) continue;
    if (!Object.hasOwn(details, key)) details[key] = value;
  }

  const requestId = firstString(data.requestId, meta.requestId, candidate.requestId) ?? undefined;
  const message = firstString(errorPayload.message, candidate.message) ?? undefined;
  const fieldErrors =
    readFieldErrors(errorPayload.fieldErrors) ??
    readFieldErrors(candidate.fieldErrors) ??
    readIssues(errorPayload.issues) ??
    readIssues(data.issues) ??
    readIssues(candidate.issues);

  const status = firstNumber(candidate.status, errorPayload.status) ?? 0;
  const code = firstString(candidate.code, errorPayload.code) ?? "";

  return {
    status,
    code,
    details,
    procedure,
    message,
    requestId,
    fieldErrors,
  };
}

/** Builds the renderable view from a normalised failure. */
export function authErrorViewFor(failure: TransportFailure, locale: AuthLocale): AuthErrorView {
  return mapAuthError({
    code: failure.code,
    status: failure.status,
    details: failure.details,
    fieldErrors: failure.fieldErrors,
    procedure: failure.procedure,
    locale,
    requestId: failure.requestId,
    message: failure.message,
  });
}

/** `toAuthErrorView(err, { locale, procedure })` — the single call every screen makes. */
export function toAuthErrorView(
  error: unknown,
  options: { locale: AuthLocale; procedure?: string },
): AuthErrorView {
  return authErrorViewFor(extractTransportError(error, options.procedure), options.locale);
}

/** A 401 that survived the one allowed refresh (F3): never a toast, always the expired notice. */
export function isSessionExpiredFailure(failure: TransportFailure): boolean {
  if (failure.status !== 401) return false;
  return (
    failure.code === "AUTH_TOKEN_EXPIRED" ||
    failure.code === "AUTH_SESSION_EXPIRED" ||
    failure.code === "UNAUTHORIZED"
  );
}

function readFieldErrors(value: unknown): AuthErrorFieldIssue[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const issues: AuthErrorFieldIssue[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const field = firstString(entry.field);
    if (!field) continue;
    issues.push({
      field,
      code: firstString(entry.code) ?? "VALIDATION_ERROR",
      message: firstString(entry.message) ?? "",
      params: readParams(entry.params),
    });
  }
  return issues.length > 0 ? issues : undefined;
}

/** Fields whose value is a fixed-length numeric code, so a format failure means "wrong digits". */
const CODE_FIELDS = new Set(["code", "otpCode", "totpCode", "verificationCode", "staffCode"]);

/**
 * Reads the Standard Schema `issues` array oRPC attaches to a rejected input and turns each entry
 * into a coded field issue, so `@trips-app/auth` can localize it. The server's own sentence stays in
 * `message` as the fallback for codes this build does not know yet.
 */
function readIssues(value: unknown): AuthErrorFieldIssue[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const issues: AuthErrorFieldIssue[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const field = firstPathSegment(entry.path);
    if (!field) continue;
    const code = validationCodeFor(entry, field);
    if (!code) continue;
    const params = readParams(entry);
    issues.push({
      field,
      code,
      message: firstString(entry.message) ?? "",
      // A code field is always the product's fixed OTP length, even when the pattern is opaque.
      params:
        code === "INVALID_CODE" ? { ...params, length: params?.length ?? OTP_CODE_LENGTH } : params,
    });
  }
  return issues.length > 0 ? issues : undefined;
}

/** `["email"]` → `"email"`; a nested path keeps its first segment, which is the input name. */
function firstPathSegment(path: unknown): string | null {
  if (!Array.isArray(path) || path.length === 0) return null;
  const head = path[0];
  return typeof head === "string" && head.length > 0 ? head : null;
}

/** Maps a zod issue to the canonical validation code the copy is keyed by. */
function validationCodeFor(issue: Record<string, unknown>, field: string): string | null {
  const code = firstString(issue.code) ?? "";
  // zod v4 calls it `origin`, zod v3 called it `type`; either way it says string vs number.
  const kind = firstString(issue.origin, issue.type) ?? "";

  switch (code) {
    case "too_small":
      return kind === "number" || kind === "bigint" ? "NUMBER_TOO_SMALL" : "TOO_SHORT";
    case "too_big":
      return kind === "number" || kind === "bigint" ? "NUMBER_TOO_LARGE" : "TOO_LONG";
    case "invalid_format": {
      const format = firstString(issue.format) ?? "";
      if (format === "email") return "INVALID_EMAIL";
      if (format === "phone" || format === "e164") return "INVALID_PHONE";
      return CODE_FIELDS.has(field) ? "INVALID_CODE" : "INVALID_FORMAT";
    }
    case "invalid_string": {
      // zod v3 shape: `{ validation: "email" | "regex" | "uuid" | ... }`.
      const validation = firstString(issue.validation) ?? "";
      if (validation === "email") return "INVALID_EMAIL";
      if (validation === "regex") return CODE_FIELDS.has(field) ? "INVALID_CODE" : "INVALID_FORMAT";
      return "INVALID_FORMAT";
    }
    case "invalid_value":
    case "invalid_enum_value":
      return "INVALID_CHOICE";
    case "invalid_type":
      return issue.received === "undefined" || issue.received === "null"
        ? "REQUIRED"
        : "INVALID_TYPE";
    default:
      return null;
  }
}

/**
 * The constraint values a validation sentence needs. Reads both a `fieldErrors[]` entry's `params`
 * and a raw zod issue (`minimum`, `maximum`, `pattern`), so the two transports share one shape.
 */
function readParams(source: unknown): Record<string, string | number> | undefined {
  if (!isRecord(source)) return undefined;

  const params: Record<string, string | number> = {};

  const nested = isRecord(source.params) ? source.params : source;
  const min = firstNumber(nested.min, nested.minimum, nested.inclusiveMinimum);
  const max = firstNumber(nested.max, nested.maximum, nested.inclusiveMaximum);
  if (min !== null) params.min = min;
  if (max !== null) params.max = max;

  const length = firstNumber(nested.length) ?? codeLength(nested.pattern);
  if (length !== null) params.length = length;

  return Object.keys(params).length > 0 ? params : undefined;
}

/** `^\d{6}$` → 6, for the `{length}` placeholder of a fixed-length code. */
function codeLength(pattern: unknown): number | null {
  const source =
    typeof pattern === "string" ? pattern : pattern instanceof RegExp ? pattern.source : "";
  if (source.length === 0) return null;
  const match = /\^\\d\{(\d+)\}\$/.exec(source);
  return match ? Number(match[1]) : null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
