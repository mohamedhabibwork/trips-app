// T4 / AC-5: no token ever reaches a log line, an error message, or an analytics payload.
// Every place that logs an auth failure must go through this module.

/** The only thing that may appear in a log where a token would have been. */
export const REDACTED = "[redacted]";

/** Key fragments that make a value sensitive. Case-insensitive. */
const SENSITIVE_KEY = /(token|authorization|password|secret|otp|credential|cookie)/i;

/** Values that look like a bearer token or a JWT, wherever they appear inside a message. */
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}/g;

/**
 * Never returns any part of the token — not a prefix, not a suffix, not its length.
 * `null`/`undefined`/empty become an empty string so call sites can interpolate safely.
 */
export function redactToken(token?: string | null): string {
  if (typeof token !== "string" || token.length === 0) return "";
  return REDACTED;
}

/** Strips bearer tokens and JWTs out of an arbitrary log message. */
export function redactMessage(message: string): string {
  if (typeof message !== "string") return "";
  return message.replace(BEARER_PATTERN, `Bearer ${REDACTED}`).replace(JWT_PATTERN, REDACTED);
}

/**
 * Deep-copies `value` with every sensitive field replaced. Safe on cycles, arrays, and Errors.
 * Used before an error object is logged or reported (AC-5).
 */
export function scrubPayload(value: unknown): unknown {
  return scrub(value, 0, new WeakSet<object>());
}

/** The sink a platform supplies (`console.warn`, a telemetry client, …). */
export type AuthLogSink = (message: string, context?: unknown) => void;

/** A logger that can only be called with scrubbed data. */
export interface AuthLogger {
  debug(message: string, context?: unknown): void;
  info(message: string, context?: unknown): void;
  warn(message: string, context?: unknown): void;
  error(message: string, context?: unknown): void;
}

/**
 * Wraps a sink so no caller can leak a token: the message is redacted and the context is scrubbed
 * before the sink sees either. There is deliberately no way to bypass it.
 */
export function createAuthLogger(sink: AuthLogSink): AuthLogger {
  const emit = (message: string, context?: unknown): void => {
    sink(redactMessage(message), context === undefined ? undefined : scrubPayload(context));
  };
  return {
    debug: emit,
    info: emit,
    warn: emit,
    error: emit,
  };
}

/** A logger that discards everything; the default in tests and in the browser build. */
export const NOOP_AUTH_LOGGER: AuthLogger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

function scrub(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;
  if (depth > 6) return "[depth-limit]";
  if (typeof value === "string") return redactMessage(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "function" || typeof value === "symbol") return "[unsupported]";

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactMessage(value.message),
      stack: value.stack ? redactMessage(value.stack) : undefined,
    };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => scrub(entry, depth + 1, seen));
  }

  if (typeof value === "object") {
    if (seen.has(value)) return "[circular]";
    seen.add(value);
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      result[key] =
        SENSITIVE_KEY.test(key) && entry !== null && entry !== undefined
          ? REDACTED
          : scrub(entry, depth + 1, seen);
    }
    seen.delete(value);
    return result;
  }

  return "[unsupported]";
}
