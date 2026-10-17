// Boundary matrix for R1/R6 and T2 (PRD §7.1–7.2). The existing suite checks the window edges in
// absolute timestamps; these tests phrase the same rule the way the PRD does ("60 s before expiry")
// and add the cases a production bug would hide in: a fresh token under an already-reached cap, and
// a ttl that is not the server default.
import { describe, expect, test } from "bun:test";

import {
  REFRESH_LEAD_MS,
  isAccessTokenExpiring,
  isSessionExpired,
  shouldRefreshBeforeCall,
  toSessionRecord,
} from "../src/index";
import type { SessionRecord, SessionTokenPayload } from "../src/index";

const NOW = Date.parse("2026-10-17T12:00:00.000Z");

function record(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    accessToken: "access",
    refreshToken: "refresh",
    accessTokenExpiresAt: NOW + 900_000,
    sessionMaxExpiresAt: NOW + 43_200_000,
    actor: {
      accountId: "acct",
      sessionId: "sess",
      activeRole: "traveler",
      adminSubRole: null,
      activeTenantId: null,
      planTier: null,
      permissions: null,
      moderatorVehicleId: null,
      moderatorTripId: null,
    },
    ...overrides,
  };
}

function payload(overrides: Partial<SessionTokenPayload> = {}): SessionTokenPayload {
  const claims = Buffer.from(JSON.stringify({ sub: "acct_1" })).toString("base64url");
  return {
    sessionId: "sess_1",
    accessToken: `header.${claims}.signature`,
    refreshToken: "refresh_1",
    accessTokenExpiresInSeconds: 900,
    sessionMaxExpiresAt: new Date(NOW + 43_200_000).toISOString(),
    activeRole: "traveler",
    adminSubRole: null,
    activeTenantId: null,
    planTier: null,
    permissions: null,
    moderatorVehicleId: null,
    moderatorTripId: null,
    ...overrides,
  };
}

/** A record whose access token has exactly `remainingMs` left at NOW. */
function withRemaining(remainingMs: number): SessionRecord {
  return record({ accessTokenExpiresAt: NOW + remainingMs });
}

describe("Unit: R1 lead window, expressed as remaining time", () => {
  test("59 999 ms left is inside the window", () => {
    expect(isAccessTokenExpiring(withRemaining(59_999), NOW)).toBe(true);
    expect(shouldRefreshBeforeCall(withRemaining(59_999), NOW)).toBe(true);
  });

  test("60 000 ms left is the first millisecond that refreshes", () => {
    expect(isAccessTokenExpiring(withRemaining(60_000), NOW)).toBe(true);
    expect(shouldRefreshBeforeCall(withRemaining(60_000), NOW)).toBe(true);
  });

  test("60 001 ms left is still fresh", () => {
    expect(isAccessTokenExpiring(withRemaining(60_001), NOW)).toBe(false);
    expect(shouldRefreshBeforeCall(withRemaining(60_001), NOW)).toBe(false);
  });

  test("the three boundaries are symmetric around the documented lead", () => {
    const lead = REFRESH_LEAD_MS;
    expect(isAccessTokenExpiring(withRemaining(lead - 1), NOW)).toBe(true);
    expect(isAccessTokenExpiring(withRemaining(lead), NOW)).toBe(true);
    expect(isAccessTokenExpiring(withRemaining(lead + 1), NOW)).toBe(false);
  });
});

describe("Unit: R6, the hard cap", () => {
  test("now == sessionMaxExpiresAt is already expired", () => {
    expect(isSessionExpired(record({ sessionMaxExpiresAt: NOW }), NOW)).toBe(true);
  });

  test("R6 wins even when the access token is completely fresh", () => {
    // The cap is reached while the access token still has its full 900 s: the client must expire
    // the session rather than keep refreshing a session that cannot outlive its cap.
    const capped = record({ accessTokenExpiresAt: NOW + 900_000, sessionMaxExpiresAt: NOW });

    expect(isAccessTokenExpiring(capped, NOW)).toBe(false);
    expect(isSessionExpired(capped, NOW)).toBe(true);
    expect(shouldRefreshBeforeCall(capped, NOW)).toBe(false);
  });

  test("one millisecond before the cap a proactive refresh is still allowed", () => {
    const almost = record({
      accessTokenExpiresAt: NOW + 30_000,
      sessionMaxExpiresAt: NOW + 1,
    });

    expect(isSessionExpired(almost, NOW)).toBe(false);
    expect(shouldRefreshBeforeCall(almost, NOW)).toBe(true);
  });
});

describe("Unit: T2 expiry arithmetic", () => {
  test("accessTokenExpiresAt is now + ttl * 1000 for a ttl that is not the default", () => {
    const created = toSessionRecord(payload({ accessTokenExpiresInSeconds: 60 }), NOW);

    expect(created.accessTokenExpiresAt).toBe(NOW + 60_000);
    // Not the 900 s server default: the response is the authority.
    expect(created.accessTokenExpiresAt).not.toBe(NOW + 900_000);
  });

  test("sessionMaxExpiresAt is the response timestamp verbatim, in epoch milliseconds", () => {
    const iso = "2026-10-17T23:59:59.999Z";
    const created = toSessionRecord(payload({ sessionMaxExpiresAt: iso }), NOW);

    expect(created.sessionMaxExpiresAt).toBe(Date.parse(iso));
    expect(created.sessionMaxExpiresAt).toBe(1_792_281_599_999);
    // Not rounded, not recomputed from the 12-hour convention.
    expect(created.sessionMaxExpiresAt).not.toBe(NOW + 43_200_000);
  });

  test("a ttl of zero is accepted and yields an immediately expiring token", () => {
    const created = toSessionRecord(payload({ accessTokenExpiresInSeconds: 0 }), NOW);

    expect(created.accessTokenExpiresAt).toBe(NOW);
    expect(isAccessTokenExpiring(created, NOW)).toBe(true);
  });
});
