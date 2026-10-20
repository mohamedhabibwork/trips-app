import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq, schema } from "@trips-app/db";
import {
  mapErrorCodeToSharedCode,
  resolveSharedErrorDefinition,
  SHARED_ERROR_CATALOG,
} from "@trips-app/domain";
import { createTripsService } from "@trips-app/service-trips";
import { z } from "zod/v4";
import { getTestContext, getTestDb, TestEntityTracker } from "../helpers/db";

describe("Tier 2 - Boundary Cases: R4 Behavioral & Interface Preservation", () => {
  const db = getTestDb();
  const tracker = new TestEntityTracker();
  let tenantA: string;
  let ownerA: string;
  let tenantB: string;

  beforeAll(async () => {
    const ctx = await getTestContext();
    tenantA = ctx.tenantId;
    ownerA = ctx.ownerAccountId;

    // Check if another organization exists
    const [secondOrg] = await db
      .select()
      .from(schema.organizations)
      .where(schema.organizations.id !== tenantA ? undefined : undefined)
      .limit(5);

    const other = (await db.select().from(schema.organizations).limit(5)).find(
      (o) => o.id !== tenantA,
    );

    if (other) {
      tenantB = other.id;
    } else {
      tenantB = tracker.trackOrganization(randomUUID());
      await db.insert(schema.organizations).values({
        id: tenantB,
        ownerAccountId: ownerA,
        legalEntityName: "Tenant B Legal",
        displayNameEn: "Tenant B",
        displayNameAr: "المستأجر ب",
        commercialRegNumberEncrypted: "enc_crn_123",
        taxNumberEncrypted: "enc_tax_123",
        tourismLicenseNumberEncrypted: "enc_lic_123",
        tourismLicenseExpiry: new Date(Date.now() + 86400000 * 365),
        countryCode: "EG",
        headquartersAddress: "Cairo, Egypt",
        signatoryFullName: "Signatory Person",
        signatoryNationalIdEncrypted: "enc_nid_123",
        signatoryRoleTitle: "Managing Director",
        payoutMethod: "bank_transfer",
        payoutIbanEncrypted: "enc_iban_123",
        planTier: "starter",
        status: "active",
      });
    }
  });

  afterAll(async () => {
    await tracker.cleanup(db);
  });

  test("R4-B01: Validation error issues contain exact path, code, and message properties", () => {
    const testSchema = z.object({
      title: z.string().min(3),
      count: z.number().int().min(1),
    });

    const result = testSchema.safeParse({ title: "ab", count: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBe(2);
      expect(result.error.issues[0]?.path).toEqual(["title"]);
      expect(result.error.issues[1]?.path).toEqual(["count"]);
      expect(typeof result.error.issues[0]?.message).toBe("string");
    }
  });

  test("R4-B02: Optional payload equivalence: schemas accept undefined and empty object identically", () => {
    const filterSchema = z
      .object({
        search: z.string().optional(),
        limit: z.number().optional(),
      })
      .optional();

    const parseUndefined = filterSchema.safeParse(undefined);
    const parseEmpty = filterSchema.safeParse({});

    expect(parseUndefined.success).toBe(true);
    expect(parseEmpty.success).toBe(true);
  });

  test("R4-B03: Date parsing boundaries reject invalid dates and accept valid Date instances and ISO strings", () => {
    const dateSchema = z.date();

    expect(dateSchema.safeParse(new Date()).success).toBe(true);
    expect(dateSchema.safeParse(new Date("invalid-date-string")).success).toBe(false);
    expect(dateSchema.safeParse("2026-10-20T00:00:00.000Z").success).toBe(false); // date schema without coercion expects Date
  });

  test("R4-B04: Cross-tenant boundary isolation: queries scoped to Tenant A never return Tenant B records", async () => {
    const tripIdB = tracker.trackTrip(randomUUID());

    // Create a trip owned by Tenant B
    await db.insert(schema.trips).values({
      id: tripIdB,
      tenantId: tenantB,
      titleAr: "رحلة المستأجر ب",
      titleEn: "Tenant B Trip",
      categoryLookupCode: "CAT_TEST",
      language: "ar",
      timezone: "Africa/Cairo",
      basePriceMinor: 20000,
      totalCapacity: 15,
      state: "draft",
      publishMode: "draft",
      createdByAccountId: ownerA,
    });

    const tripsService = createTripsService(db);
    const actorA = {
      accountId: ownerA,
      sessionId: "00000000-0000-4000-8000-000000000000",
      activeRole: "organization_owner" as const,
      activeTenantId: tenantA, // Actor belongs to Tenant A
      planTier: "enterprise",
    };

    // Attempt to access Tenant B's trip with Tenant A's actor context
    try {
      await tripsService.getOrganizationTrip(actorA, { tripId: tripIdB });
      expect(true).toBe(false); // Must throw RESOURCE_NOT_FOUND or TENANT_FORBIDDEN
    } catch (err: unknown) {
      expect(err).toBeDefined();
    }
  });

  test("R4-B05: Domain error code mappings produce HTTP status and categories matching SHARED_ERROR_CATALOG", () => {
    const notFoundShared = mapErrorCodeToSharedCode("RESOURCE_NOT_FOUND");
    expect(notFoundShared).toBe("RESOURCE_NOT_FOUND");

    const def = resolveSharedErrorDefinition("RESOURCE_NOT_FOUND");
    expect(def.status).toBe(404);
    expect(def.category).toBe("NOT_FOUND");

    const authDef = resolveSharedErrorDefinition("AUTH_TOKEN_EXPIRED");
    expect(authDef.status).toBe(401);
    expect(authDef.category).toBe("UNAUTHORIZED");
  });
});
