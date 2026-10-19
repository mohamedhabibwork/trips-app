import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import {
  hasInputSchema,
  INTENTIONALLY_PUBLIC,
  listAppProcedures,
  procedureName,
} from "@trips-app/api/testing/procedure-catalog";
import { signAccessToken } from "@trips-app/domain";

import { app } from "../../src/index";

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;

type RpcBody = { json?: Record<string, unknown> | null };

function send(path: string, init: RequestInit = {}): Promise<Response> {
  return app.handle(new Request(`http://localhost${path}`, init));
}

function rpcCall(
  procedurePath: readonly string[],
  body: unknown,
  token?: string,
): Promise<Response> {
  return send(`/rpc/${procedurePath.join("/")}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ json: body }),
  });
}

type AdminSubRole = "super_admin" | "operations" | "finance";

function tokenFor(claims: { role: "admin" | "traveler"; adminSubRole?: AdminSubRole }): string {
  // Claims are generated per call: no test relies on a shared static account or session id.
  return signAccessToken({
    sub: randomUUID(),
    sid: randomUUID(),
    ...claims,
  } as Parameters<typeof signAccessToken>[0]);
}

async function readRpcBody(response: Response): Promise<RpcBody> {
  return (await response.json()) as RpcBody;
}

describe("E2E: system endpoints (apps/server)", () => {
  test("GET /health returns the standard success envelope", async () => {
    // Arrange / Act
    const response = await send("/health");
    const body = (await response.json()) as { success: boolean; data: { status: string } };

    // Assert
    expect(response.status).toBe(HTTP_OK);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("OK");
  });

  test("unknown route returns 404", async () => {
    const response = await send("/this-route-does-not-exist");
    expect(response.status).toBe(HTTP_NOT_FOUND);
  });

  // Observed: unknown routes return 404 with an empty body, not the ApiErrorResponse envelope.
  test.todo("unknown route returns the standard ApiErrorResponse envelope (RESOURCE_NOT_FOUND)");
});

describe("E2E: every RPC endpoint is mounted, guarded, and never crashes over HTTP", () => {
  for (const { path, procedure } of listAppProcedures()) {
    const name = procedureName(path);
    const isPublic = name in INTENTIONALLY_PUBLIC;
    const isStatusRoute = path[path.length - 1] === "status";

    test(`${name} responds without a server error to an unauthenticated call`, async () => {
      // Arrange / Act
      const response = await rpcCall(path, {});

      // Assert
      expect(response.status).toBeLessThan(500);
      if (isStatusRoute) {
        expect(response.status).toBe(HTTP_OK);
        const body = await readRpcBody(response);
        expect(body.json?.status).toBe("ok");
        return;
      }
      if (isPublic) {
        // A public procedure never asks for a session; one with a required input (an invite
        // token, a lookup code) answers an empty body with a validation error instead.
        const publicStatuses = hasInputSchema(procedure) ? [HTTP_OK, HTTP_BAD_REQUEST] : [HTTP_OK];
        expect(publicStatuses).toContain(response.status);
        return;
      }
      const expectedStatuses = hasInputSchema(procedure)
        ? [HTTP_UNAUTHORIZED, HTTP_BAD_REQUEST]
        : [HTTP_UNAUTHORIZED];
      expect(expectedStatuses).toContain(response.status);
    });
  }
});

describe("E2E: authentication and role enforcement", () => {
  test("admin.getSystemSettings without a token returns 401 UNAUTHORIZED", async () => {
    const response = await rpcCall(["admin", "getSystemSettings"], undefined);
    const body = await readRpcBody(response);

    expect(response.status).toBe(HTTP_UNAUTHORIZED);
    expect(body.json).toMatchObject({ code: "UNAUTHORIZED" });
  });

  test("admin.getSystemSettings with a traveler token returns 403 ADMIN_SUBROLE_FORBIDDEN", async () => {
    const response = await rpcCall(
      ["admin", "getSystemSettings"],
      undefined,
      tokenFor({ role: "traveler" }),
    );
    const body = await readRpcBody(response);

    expect(response.status).toBe(HTTP_FORBIDDEN);
    expect(body.json).toMatchObject({ code: "ADMIN_SUBROLE_FORBIDDEN" });
  });

  test("admin.getSystemSettings with a super admin token returns the settings document", async () => {
    const response = await rpcCall(
      ["admin", "getSystemSettings"],
      undefined,
      tokenFor({ role: "admin", adminSubRole: "super_admin" }),
    );
    const body = await readRpcBody(response);

    expect(response.status).toBe(HTTP_OK);
    expect(body.json).toHaveProperty("markets");
  });
});

describe("E2E: admin business endpoints (happy path and role matrix)", () => {
  test("admin.previewSystemSettingsChange returns impact counts and the four-eyes flag for a super admin", async () => {
    const response = await rpcCall(
      ["admin", "previewSystemSettingsChange"],
      { marketCountryCode: "EG" },
      tokenFor({ role: "admin", adminSubRole: "super_admin" }),
    );
    const body = await readRpcBody(response);

    expect(response.status).toBe(HTTP_OK);
    expect(body.json).toMatchObject({
      requiresFourEyesApproval: true,
      proposedChanges: { marketCountryCode: "EG" },
    });
    expect(typeof body.json?.affectedAccountsCount).toBe("number");
    expect(typeof body.json?.affectedOrganizationsCount).toBe("number");
  });

  test("admin.previewSystemSettingsChange refuses an operations admin (super admin only)", async () => {
    const response = await rpcCall(
      ["admin", "previewSystemSettingsChange"],
      {},
      tokenFor({ role: "admin", adminSubRole: "operations" }),
    );
    const body = await readRpcBody(response);

    expect(response.status).toBe(HTTP_FORBIDDEN);
    expect(body.json).toMatchObject({ code: "ADMIN_SUBROLE_FORBIDDEN" });
  });

  test("admin.getSystemSettings is open to operations admins (any admin sub-role)", async () => {
    const response = await rpcCall(
      ["admin", "getSystemSettings"],
      undefined,
      tokenFor({ role: "admin", adminSubRole: "operations" }),
    );

    expect(response.status).toBe(HTTP_OK);
  });
});

describe("E2E: input validation over HTTP", () => {
  test("admin.updateSystemSettings rejects an unknown payload with 400 VALIDATION_ERROR", async () => {
    const response = await rpcCall(
      ["admin", "updateSystemSettings"],
      { bogus: 1 },
      tokenFor({ role: "admin", adminSubRole: "super_admin" }),
    );
    const body = await readRpcBody(response);
    const envelope = body.json?.data as { error?: { code?: string } } | undefined;

    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(envelope?.error?.code).toBe("VALIDATION_ERROR");
  });
});

describe("E2E: core lookups endpoints by lookup_types.code and lookups.code", () => {
  test("lookups.getTypeByCode returns lookup type and ordered items by code (e.g. COUNTRY and child SERVICE_REGION)", async () => {
    const countryRes = await rpcCall(["lookups", "getTypeByCode"], { code: "COUNTRY" });
    const countryBody = await readRpcBody(countryRes);

    expect(countryRes.status).toBe(HTTP_OK);
    const lookupType = countryBody.json?.lookupType as
      | { code: string; items: Array<{ code: string; value: string }> }
      | undefined;
    expect(lookupType?.code).toBe("COUNTRY");
    expect(lookupType?.items.map((i) => i.value)).toEqual(["EG", "SA", "AE"]);

    const regionRes = await rpcCall(["lookups", "getTypeByCode"], {
      code: "SERVICE_REGION",
      parentLookupCode: "EG",
    });
    const regionBody = await readRpcBody(regionRes);
    expect(regionRes.status).toBe(HTTP_OK);
    const regionType = regionBody.json?.lookupType as
      | { code: string; items: Array<{ code: string; value: string; parentCode: string | null }> }
      | undefined;
    expect(regionType?.code).toBe("SERVICE_REGION");
    expect(regionType?.items.length).toBeGreaterThanOrEqual(5);
    expect(regionType?.items.every((item) => item.parentCode === "EG")).toBe(true);
  });

  test("lookups.getByCode returns a single lookup item and its child lookups", async () => {
    const res = await rpcCall(["lookups", "getByCode"], {
      code: "EG",
      typeCode: "COUNTRY",
    });
    const body = await readRpcBody(res);

    expect(res.status).toBe(HTTP_OK);
    const lookup = body.json?.lookup as { code: string; value: string } | undefined;
    const childLookups = body.json?.childLookups as Array<{ code: string }> | undefined;
    expect(lookup?.code).toBe("EG");
    expect(lookup?.value).toBe("EG");
    expect(Array.isArray(childLookups)).toBe(true);
    expect((childLookups ?? []).some((c) => c.code === "CAIRO")).toBe(true);
  });

  test("lookups.getByTypeCodes batch fetches multiple lookup types by code", async () => {
    const res = await rpcCall(["lookups", "getByTypeCodes"], {
      codes: ["VEHICLE_TYPE", "TRIP_CATEGORY"],
    });
    const body = await readRpcBody(res);

    expect(res.status).toBe(HTTP_OK);
    const lookupTypes = body.json?.lookupTypes as Record<string, { code: string }> | undefined;
    expect(lookupTypes?.VEHICLE_TYPE?.code).toBe("VEHICLE_TYPE");
    expect(lookupTypes?.TRIP_CATEGORY?.code).toBe("TRIP_CATEGORY");
  });
});
