import { describe, expect, test } from "bun:test";

import {
  AUTH_STORAGE_KEY,
  InvalidSessionPayloadError,
  parseSessionRecord,
  serializeSessionRecord,
  toSessionRecord,
} from "../src/index";
import type { SessionRecord, SessionTokenPayload } from "../src/index";

function base64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function fakeAccessToken(claims: Record<string, unknown> = { sub: "acct_1" }): string {
  return `${base64UrlJson({ alg: "HS256", typ: "JWT" })}.${base64UrlJson(claims)}.signature`;
}

function payload(overrides: Partial<SessionTokenPayload> = {}): SessionTokenPayload {
  return {
    sessionId: "sess_1",
    accessToken: fakeAccessToken(),
    refreshToken: "refresh_1",
    accessTokenExpiresInSeconds: 900,
    sessionMaxExpiresAt: "2026-10-17T23:00:00.000Z",
    activeRole: "traveler",
    adminSubRole: null,
    activeTenantId: null,
    planTier: "free",
    permissions: null,
    moderatorVehicleId: null,
    moderatorTripId: null,
    ...overrides,
  };
}

describe("Unit: storage key (T1)", () => {
  test("exactly one namespaced key is used", () => {
    expect(AUTH_STORAGE_KEY).toBe("trips.auth.v1");
  });
});

describe("Unit: toSessionRecord (T2)", () => {
  test("computes accessTokenExpiresAt from the ttl and keeps sessionMaxExpiresAt verbatim", () => {
    const now = 1_000_000;
    const record = toSessionRecord(payload(), now);

    expect(record.accessTokenExpiresAt).toBe(now + 900 * 1000);
    expect(record.sessionMaxExpiresAt).toBe(Date.parse("2026-10-17T23:00:00.000Z"));
    expect(record.actor.accountId).toBe("acct_1");
    expect(record.actor.sessionId).toBe("sess_1");
    expect(record.actor.activeRole).toBe("traveler");
    expect(record.actor.planTier).toBe("free");
  });

  test("copies every actor claim the design lists", () => {
    const record = toSessionRecord(
      payload({
        activeRole: "organization_employee",
        adminSubRole: null,
        activeTenantId: "tenant_1",
        permissions: { trips: "manage" },
        moderatorVehicleId: null,
        moderatorTripId: null,
      }),
      0,
    );

    expect(record.actor).toEqual({
      accountId: "acct_1",
      sessionId: "sess_1",
      activeRole: "organization_employee",
      adminSubRole: null,
      activeTenantId: "tenant_1",
      planTier: "free",
      permissions: { trips: "manage" },
      moderatorVehicleId: null,
      moderatorTripId: null,
    });
  });

  test("rejects a payload without a refresh token (R5 hard failure)", () => {
    expect(() => toSessionRecord(payload({ refreshToken: "" }), 0)).toThrow(
      InvalidSessionPayloadError,
    );
  });

  test("rejects a payload whose session cap is not a timestamp", () => {
    expect(() => toSessionRecord(payload({ sessionMaxExpiresAt: "not-a-date" }), 0)).toThrow(
      InvalidSessionPayloadError,
    );
  });

  test("rejects an access token that carries no subject claim", () => {
    expect(() => toSessionRecord(payload({ accessToken: "not-a-jwt" }), 0)).toThrow(
      InvalidSessionPayloadError,
    );
  });
});

describe("Unit: serialize / parse round trip", () => {
  test("a serialized record parses back to a deep-equal record", () => {
    const record = toSessionRecord(
      payload({ adminSubRole: "super_admin", activeRole: "admin" }),
      42,
    );
    const parsed = parseSessionRecord(serializeSessionRecord(record));

    expect(parsed).toEqual(record);
  });

  test("the stored JSON carries exactly the documented fields", () => {
    const record = toSessionRecord(payload(), 42);
    const raw = JSON.parse(serializeSessionRecord(record)) as Record<string, unknown>;

    expect(Object.keys(raw).sort()).toEqual(
      [
        "accessToken",
        "accessTokenExpiresAt",
        "actor",
        "refreshToken",
        "sessionMaxExpiresAt",
      ].sort(),
    );
    expect(typeof raw.accessTokenExpiresAt).toBe("number");
    expect(typeof raw.sessionMaxExpiresAt).toBe("number");
  });

  test("parseSessionRecord rejects every malformed shape", () => {
    expect(parseSessionRecord(null)).toBeNull();
    expect(parseSessionRecord("")).toBeNull();
    expect(parseSessionRecord("   ")).toBeNull();
    expect(parseSessionRecord("{not json")).toBeNull();
    expect(parseSessionRecord("[]")).toBeNull();
    expect(parseSessionRecord("null")).toBeNull();
    expect(parseSessionRecord(JSON.stringify({ accessToken: "a" }))).toBeNull();
  });

  test("parseSessionRecord rejects a missing field", () => {
    const record = toSessionRecord(payload(), 42);
    const raw = JSON.parse(serializeSessionRecord(record)) as Record<string, unknown>;
    delete raw.refreshToken;

    expect(parseSessionRecord(JSON.stringify(raw))).toBeNull();
  });

  test("parseSessionRecord rejects a wrong type", () => {
    const record = toSessionRecord(payload(), 42);
    const raw = JSON.parse(serializeSessionRecord(record)) as Record<string, unknown>;
    raw.accessTokenExpiresAt = "1750000000000";

    expect(parseSessionRecord(JSON.stringify(raw))).toBeNull();
  });

  test("parseSessionRecord rejects an actor without an account id", () => {
    const record = toSessionRecord(payload(), 42);
    const raw = JSON.parse(serializeSessionRecord(record)) as { actor: Record<string, unknown> };
    raw.actor.accountId = "";

    expect(parseSessionRecord(JSON.stringify(raw))).toBeNull();
  });

  test("a stored record survives a round trip with null claims", () => {
    const record: SessionRecord = {
      accessToken: "access",
      refreshToken: "refresh",
      accessTokenExpiresAt: 1,
      sessionMaxExpiresAt: 2,
      actor: {
        accountId: "acct",
        sessionId: "sess",
        activeRole: "moderator",
        adminSubRole: null,
        activeTenantId: null,
        planTier: null,
        permissions: null,
        moderatorVehicleId: "vehicle_1",
        moderatorTripId: null,
      },
    };

    expect(parseSessionRecord(serializeSessionRecord(record))).toEqual(record);
  });
});
