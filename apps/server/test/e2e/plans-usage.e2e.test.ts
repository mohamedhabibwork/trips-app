import { beforeAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { schema } from "@trips-app/db";
import { signAccessToken } from "@trips-app/domain";

import { app } from "../../src/index";
import { db } from "../../src/services";

const HTTP_OK = 200;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;

interface RpcBody {
  json?: Record<string, unknown> | null;
}

function rpcCall(procedurePath: readonly string[], token?: string): Promise<Response> {
  return app.handle(
    new Request(`http://localhost/rpc/${procedurePath.join("/")}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ json: null }),
    }),
  );
}

async function readRpcBody(response: Response): Promise<RpcBody> {
  return (await response.json()) as RpcBody;
}

let tenantId = "";

beforeAll(async () => {
  // Arrange: read-only; any organization from the local seed.
  const [org] = await db
    .select({ id: schema.organizations.id })
    .from(schema.organizations)
    .limit(1);
  if (!org) throw new Error("The local database has no organization; run the seed first.");
  tenantId = org.id;
});

function ownerToken(): string {
  return signAccessToken({
    sub: randomUUID(),
    sid: randomUUID(),
    role: "organization_owner",
    tenantId,
  });
}

describe("E2E: plans.getOrganizationUsage (SCR-ORG-01, 04, 12, 33)", () => {
  test("returns the organization's usage counts for the current month", async () => {
    // Act
    const response = await rpcCall(["plans", "getOrganizationUsage"], ownerToken());
    const body = await readRpcBody(response);

    // Assert
    expect(response.status).toBe(HTTP_OK);
    for (const key of [
      "activeTripsThisMonth",
      "employees",
      "activeCoupons",
      "maxVehiclesPerTrip",
      "maxProgramsPerTrip",
    ]) {
      expect(typeof body.json?.[key]).toBe("number");
    }
    const monthStart = new Date(String(body.json?.monthStart));
    expect(monthStart.getUTCDate()).toBe(1);
  });

  test("rejects a call without a token with 401", async () => {
    // Act
    const response = await rpcCall(["plans", "getOrganizationUsage"]);

    // Assert
    expect(response.status).toBe(HTTP_UNAUTHORIZED);
  });

  test("answers a session with no organization as not found (IF-12)", async () => {
    // Arrange
    const traveler = signAccessToken({ sub: randomUUID(), sid: randomUUID(), role: "traveler" });

    // Act
    const response = await rpcCall(["plans", "getOrganizationUsage"], traveler);

    // Assert
    expect(response.status).toBe(HTTP_NOT_FOUND);
  });

  test("rejects a non-organization role that carries a tenant with 403", async () => {
    // Arrange
    const traveler = signAccessToken({
      sub: randomUUID(),
      sid: randomUUID(),
      role: "traveler",
      tenantId,
    });

    // Act
    const response = await rpcCall(["plans", "getOrganizationUsage"], traveler);

    // Assert
    expect(response.status).toBe(HTTP_FORBIDDEN);
  });
});
