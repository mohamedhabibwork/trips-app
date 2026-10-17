// Expiry rules R1 and R6 (PRD §7.2). Pure arithmetic on the persisted record.
import { REFRESH_LEAD_MS } from "./conventions/index";
import type { SessionRecord } from "./types";

/** R1: true when the access token is inside the refresh window (or already past it). */
export function isAccessTokenExpiring(
  record: SessionRecord,
  nowMs: number,
  leadMs: number = REFRESH_LEAD_MS,
): boolean {
  return nowMs >= record.accessTokenExpiresAt - leadMs;
}

/** R6: the 12-hour web cap. At or past the boundary the session counts as expired. */
export function isSessionExpired(record: SessionRecord, nowMs: number): boolean {
  return nowMs >= record.sessionMaxExpiresAt;
}

/**
 * The decision the transport makes before an authenticated call: refresh only when the token is
 * inside the lead window **and** the hard cap has not been reached (R6 short-circuits R1).
 */
export function shouldRefreshBeforeCall(record: SessionRecord, nowMs: number): boolean {
  if (isSessionExpired(record, nowMs)) return false;
  return isAccessTokenExpiring(record, nowMs);
}

/** Milliseconds until the access token expires (negative once past). */
export function remainingAccessTokenMs(record: SessionRecord, nowMs: number): number {
  return record.accessTokenExpiresAt - nowMs;
}

/** Milliseconds until the 12-hour cap (negative once past). */
export function remainingSessionMs(record: SessionRecord, nowMs: number): number {
  return record.sessionMaxExpiresAt - nowMs;
}

/** The record with rotated tokens applied (R5). Both expiries are recomputed from the response. */
export function withRotatedTokens(
  record: SessionRecord,
  rotation: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresInSeconds: number;
    sessionMaxExpiresAt: string;
  },
  nowMs: number,
): SessionRecord {
  const sessionMaxExpiresAt = Date.parse(rotation.sessionMaxExpiresAt);
  return {
    ...record,
    accessToken: rotation.accessToken,
    refreshToken: rotation.refreshToken,
    accessTokenExpiresAt: nowMs + rotation.accessTokenExpiresInSeconds * 1000,
    sessionMaxExpiresAt: Number.isFinite(sessionMaxExpiresAt)
      ? sessionMaxExpiresAt
      : record.sessionMaxExpiresAt,
  };
}
