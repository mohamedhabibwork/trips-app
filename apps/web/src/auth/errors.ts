// Web-side error plumbing: unwrap the oRPC error (or a raw RPC failure) and hand the shared mapper
// exactly the fields it needs. The mapping table itself lives in @trips-app/auth.
import { mapAuthError, SessionExpiredError } from "@trips-app/auth";
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
    readFieldErrors(errorPayload.fieldErrors) ?? readFieldErrors(candidate.fieldErrors);

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
    });
  }
  return issues.length > 0 ? issues : undefined;
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
