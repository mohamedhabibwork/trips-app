import { describe, expect, test } from "bun:test";

import {
  REFRESH_LEAD_MS,
  isAccessTokenExpiring,
  isSessionExpired,
  remainingAccessTokenMs,
  remainingSessionMs,
  shouldRefreshBeforeCall,
  withRotatedTokens,
} from "../src/index";
import type { SessionRecord } from "../src/index";

const NOW = 1_000_000;

function record(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    accessToken: "access",
    refreshToken: "refresh",
    // 900 s ttl, received at NOW.
    accessTokenExpiresAt: NOW + 900_000,
    // 12 h web cap.
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

describe("Unit: refresh lead window (R1)", () => {
  test("the lead is 60 seconds", () => {
    expect(REFRESH_LEAD_MS).toBe(60_000);
  });

  test("a fresh token is not expiring", () => {
    expect(isAccessTokenExpiring(record(), NOW)).toBe(false);
  });

  test("exactly at the window edge counts as expiring", () => {
    const atEdge = record({ accessTokenExpiresAt: NOW + REFRESH_LEAD_MS });
    expect(isAccessTokenExpiring(atEdge, NOW)).toBe(true);
  });

  test("one millisecond before the edge is still fresh", () => {
    const justOutside = record({ accessTokenExpiresAt: NOW + REFRESH_LEAD_MS + 1 });
    expect(isAccessTokenExpiring(justOutside, NOW)).toBe(false);
  });

  test("an already expired token is expiring", () => {
    expect(isAccessTokenExpiring(record({ accessTokenExpiresAt: NOW }), NOW)).toBe(true);
    expect(isAccessTokenExpiring(record({ accessTokenExpiresAt: NOW - 1 }), NOW)).toBe(true);
  });

  test("a custom lead widens the window", () => {
    const target = record({ accessTokenExpiresAt: NOW + 120_000 });
    expect(isAccessTokenExpiring(target, NOW, 60_000)).toBe(false);
    expect(isAccessTokenExpiring(target, NOW, 120_000)).toBe(true);
  });
});

describe("Unit: session cap (R6)", () => {
  test("expired exactly at the cap boundary", () => {
    expect(isSessionExpired(record({ sessionMaxExpiresAt: NOW }), NOW)).toBe(true);
  });

  test("one millisecond before the cap is still valid", () => {
    expect(isSessionExpired(record({ sessionMaxExpiresAt: NOW + 1 }), NOW)).toBe(false);
  });

  test("R6 short-circuits R1: no refresh is attempted at the cap", () => {
    const capped = record({ accessTokenExpiresAt: NOW - 5_000, sessionMaxExpiresAt: NOW });
    expect(isAccessTokenExpiring(capped, NOW)).toBe(true);
    expect(shouldRefreshBeforeCall(capped, NOW)).toBe(false);
  });

  test("shouldRefreshBeforeCall is true only inside the window and under the cap", () => {
    expect(shouldRefreshBeforeCall(record(), NOW)).toBe(false);
    expect(shouldRefreshBeforeCall(record({ accessTokenExpiresAt: NOW + 30_000 }), NOW)).toBe(true);
  });
});

describe("Unit: remaining time", () => {
  test("reports signed milliseconds", () => {
    expect(remainingAccessTokenMs(record(), NOW)).toBe(900_000);
    expect(remainingSessionMs(record(), NOW)).toBe(43_200_000);
    expect(remainingAccessTokenMs(record({ accessTokenExpiresAt: NOW - 1 }), NOW)).toBe(-1);
  });
});

describe("Unit: rotation (R5)", () => {
  test("replaces both tokens and recomputes the access expiry", () => {
    const rotated = withRotatedTokens(
      record(),
      {
        accessToken: "access_2",
        refreshToken: "refresh_2",
        accessTokenExpiresInSeconds: 900,
        sessionMaxExpiresAt: new Date(NOW + 43_200_000).toISOString(),
      },
      NOW + 60_000,
    );

    expect(rotated.accessToken).toBe("access_2");
    expect(rotated.refreshToken).toBe("refresh_2");
    expect(rotated.accessTokenExpiresAt).toBe(NOW + 60_000 + 900_000);
    expect(rotated.actor).toEqual(record().actor);
  });

  test("keeps the previous cap when the response omits a usable timestamp", () => {
    const rotated = withRotatedTokens(
      record(),
      {
        accessToken: "access_2",
        refreshToken: "refresh_2",
        accessTokenExpiresInSeconds: 900,
        sessionMaxExpiresAt: "nonsense",
      },
      NOW,
    );

    expect(rotated.sessionMaxExpiresAt).toBe(record().sessionMaxExpiresAt);
  });
});
