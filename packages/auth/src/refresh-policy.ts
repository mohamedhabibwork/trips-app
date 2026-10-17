// Refresh policy rules R2–R6 (PRD §7.2–7.3) and the countdown helper the mapper needs (§1.2 AC-2).
import {
  MAX_SESSION_REASON,
  NO_REFRESH_PROCEDURES,
  OTP_PROCEDURES,
  REFRESHABLE_CODES,
  SIGN_IN_PROCEDURES,
} from "./conventions/index";

/** True when `procedure` must never trigger a refresh (R4). */
export function isNoRefreshProcedure(procedure: string): boolean {
  return NO_REFRESH_PROCEDURES.includes(procedure);
}

/** True when a 401 code is worth one refresh and one replay (R2). */
export function isRefreshableCode(code: string): boolean {
  return REFRESHABLE_CODES.includes(code);
}

/** True when a 401 on this procedure means "bad credentials", not "expired session" (§3.5). */
export function isSignInProcedure(procedure: string): boolean {
  return SIGN_IN_PROCEDURES.includes(procedure);
}

/** True when a VALIDATION_ERROR on this procedure is an OTP-code failure (§3.5). */
export function isOtpProcedure(procedure: string): boolean {
  return OTP_PROCEDURES.includes(procedure);
}

/**
 * R2 + R4: a failed call is retried after one refresh only when it is a 401 whose code is
 * refreshable and the procedure is not in the no-refresh set. R4's "no refresh token" clause is
 * enforced by the controller, which owns the store.
 */
export function needsRefreshOnError(input: {
  status: number;
  code: string;
  procedure: string;
}): boolean {
  if (input.status !== 401) return false;
  if (isNoRefreshProcedure(input.procedure)) return false;
  return isRefreshableCode(input.code);
}

/** F2: the 12-hour cap surfaced as `UNAUTHORIZED` + `details.reason` (never as an error code). */
export function isMaxSessionReason(details?: Record<string, unknown>): boolean {
  return details?.reason === MAX_SESSION_REASON;
}

/**
 * Seconds left on a lockout, an OTP pause, or an OTP cooldown.
 *
 * The server uses three different shapes for the same idea (§1.2):
 *   - already locked: `remainingLockoutSeconds` + `lockedUntil`
 *   - just locked by the 5th attempt: `lockedUntil` only
 *   - OTP cooldown: `retryAfterSeconds`; OTP pause: `pausedUntil`
 * Whichever is present, the caller gets a non-negative integer.
 */
export function lockoutSecondsRemaining(
  details?: Record<string, unknown>,
  nowMs: number = Date.now(),
): number {
  if (!details) return 0;

  const remaining = finiteNumber(details.remainingLockoutSeconds);
  if (remaining !== null && remaining > 0) return Math.ceil(remaining);

  for (const field of ["lockedUntil", "pausedUntil"] as const) {
    const raw = details[field];
    if (typeof raw === "string") {
      const at = Date.parse(raw);
      if (Number.isFinite(at)) {
        const seconds = Math.ceil((at - nowMs) / 1000);
        return seconds > 0 ? seconds : 0;
      }
    }
  }

  const retryAfter = finiteNumber(details.retryAfterSeconds);
  if (retryAfter !== null && retryAfter > 0) return Math.ceil(retryAfter);

  return 0;
}

/** Remaining OTP attempts, derived from the wrong-attempt counter the server sends (§1.2). */
export function remainingOtpAttempts(
  details: Record<string, unknown> | undefined,
  maxAttempts: number,
): number {
  const wrong = finiteNumber(details?.wrongAttempts) ?? 0;
  const left = maxAttempts - wrong;
  return left > 0 ? left : 0;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
