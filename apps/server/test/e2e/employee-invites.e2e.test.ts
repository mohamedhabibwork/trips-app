import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { eq, schema } from "@trips-app/db";
import { hashSha256 } from "@trips-app/domain";

import { app } from "../../src/index";
import { db } from "../../src/services";

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT_RANGE = [409, 422];
const DAY_MS = 24 * 60 * 60 * 1000;

interface RpcBody {
  json?: Record<string, unknown> | null;
}

function rpcCall(procedurePath: readonly string[], body: unknown): Promise<Response> {
  return app.handle(
    new Request(`http://localhost/rpc/${procedurePath.join("/")}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ json: body ?? null }),
    }),
  );
}

async function readRpcBody(response: Response): Promise<RpcBody> {
  return (await response.json()) as RpcBody;
}

// Each run makes its own invitation on an existing organization and removes it afterwards.
const inviteToken = `e2e-invite-${randomUUID()}`;
const createdIds: string[] = [];
let organizationNameEn = "";

beforeAll(async () => {
  // Arrange: an organization from the local seed and a pending invitation with a known token.
  const [org] = await db
    .select({ id: schema.organizations.id, displayNameEn: schema.organizations.displayNameEn })
    .from(schema.organizations)
    .limit(1);
  if (!org) throw new Error("The local database has no organization; run the seed first.");
  organizationNameEn = org.displayNameEn;
  const [membership] = await db
    .insert(schema.employeeMemberships)
    .values({
      tenantId: org.id,
      invitedEmail: `qa+invite+${randomUUID().slice(0, 8)}@example.com`,
      roleTitle: "Operations",
      permissions: {
        trips: "manage",
        fleet: "view",
        staffing: "none",
        bookings: "view",
        coupons: "none",
        accounting: "none",
        employees: "none",
        settings: "none",
        tracking: "view",
      } as never,
      inviteTokenHash: hashSha256(inviteToken),
      inviteExpiresAt: new Date(Date.now() + 7 * DAY_MS),
    })
    .returning({ id: schema.employeeMemberships.id });
  if (membership) createdIds.push(membership.id);
});

afterAll(async () => {
  for (const id of createdIds) {
    await db.delete(schema.auditLogs).where(eq(schema.auditLogs.targetEntityId, id));
    await db.delete(schema.employeeMemberships).where(eq(schema.employeeMemberships.id, id));
  }
});

describe("E2E: employee invitation by email-link token (SCR-ORG-02)", () => {
  test("employees.previewInvite returns the organization and areas without a session", async () => {
    // Act
    const response = await rpcCall(["employees", "previewInvite"], { inviteToken });
    const body = await readRpcBody(response);

    // Assert
    expect(response.status).toBe(HTTP_OK);
    expect(body.json).toMatchObject({
      organizationNameEn,
      roleTitle: "Operations",
      state: "pending",
    });
    expect(body.json?.permissions).toMatchObject({ trips: "manage" });
  });

  test("employees.previewInvite answers an unknown token with 404 and no details", async () => {
    // Act
    const response = await rpcCall(["employees", "previewInvite"], {
      inviteToken: `unknown-${randomUUID()}`,
    });
    const body = await readRpcBody(response);

    // Assert
    expect(response.status).toBe(HTTP_NOT_FOUND);
    expect(body.json).toMatchObject({ code: "RESOURCE_NOT_FOUND" });
    expect(JSON.stringify(body.json)).not.toContain(organizationNameEn);
  });

  test("employees.previewInvite rejects a short token with 400 VALIDATION_ERROR", async () => {
    // Act
    const response = await rpcCall(["employees", "previewInvite"], { inviteToken: "short" });
    const body = await readRpcBody(response);
    const envelope = body.json?.data as { error?: { code?: string } } | undefined;

    // Assert
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(envelope?.error?.code).toBe("VALIDATION_ERROR");
  });

  test("employees.declineInvite withdraws a pending invitation, then refuses a second decline", async () => {
    // Act
    const first = await rpcCall(["employees", "declineInvite"], { inviteToken });
    const firstBody = await readRpcBody(first);
    const preview = await readRpcBody(
      await rpcCall(["employees", "previewInvite"], { inviteToken }),
    );
    const second = await rpcCall(["employees", "declineInvite"], { inviteToken });
    const secondBody = await readRpcBody(second);

    // Assert
    expect(first.status).toBe(HTTP_OK);
    expect(firstBody.json).toMatchObject({ state: "withdrawn" });
    expect(preview.json).toMatchObject({ state: "withdrawn" });
    expect(HTTP_CONFLICT_RANGE).toContain(second.status);
    expect(secondBody.json).toMatchObject({ code: "INVALID_STATE_TRANSITION" });
  });
});
