import { randomUUID } from "node:crypto";
import { describe, expect, test } from "bun:test";
import { is } from "drizzle-orm";
import { getTableConfig, PgTable, QueryBuilder } from "drizzle-orm/pg-core";
import {
  accountPublicColumns,
  ACCOUNT_SECRET_COLUMNS,
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  omitColumns,
  schema,
} from "@trips-app/db";
import {
  selectBookingsSchema,
  selectTripsSchema,
  selectVehiclesSchema,
  selectVehicleTypesSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

describe("Tier 1 - Feature R1: Dynamic Zod Schema Generation from Drizzle Tables", () => {
  const qb = new QueryBuilder();

  test("R1-01: createSelectSchema dynamically generates valid Zod select schemas for core Drizzle tables", () => {
    // Authoritative source: Drizzle Zod select schema guidance (https://orm.drizzle.team/docs/zod#select-schema)
    const tripSelect = createSelectSchema(schema.trips);
    expect(typeof tripSelect.safeParse).toBe("function");

    const testTripId = randomUUID();
    const testTenantId = randomUUID();
    const testCreatedBy = randomUUID();

    const validTripRow = {
      id: testTripId,
      tenantId: testTenantId,
      titleAr: "رحلة الأهرامات",
      titleEn: "Pyramids Trip",
      descriptionAr: "وصف الرحلة",
      descriptionEn: "Trip description",
      categoryLookupCode: "CAT_CULTURAL",
      language: "ar",
      coverImageUrl: "https://example.com/cover.jpg",
      galleryImageUrls: ["https://example.com/1.jpg"],
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 86400000),
      timezone: "Africa/Cairo",
      origin: { nameAr: "القاهرة", nameEn: "Cairo" },
      destinations: [{ nameAr: "الجيزة", nameEn: "Giza" }],
      seatAssignmentMode: "open",
      seatPriorityWindowHours: 24,
      basePriceMinor: 50000,
      currencyCode: "EGP",
      totalCapacity: 30,
      confirmedSeatsCount: 0,
      heldSeatsCount: 0,
      childTrackingEnabled: false,
      state: "draft",
      publishMode: "draft",
      targetedAudienceIds: [],
      vipEarlyAccessUntil: null,
      wizardSteps: {
        basics: true,
        schedule: false,
        vehicles: false,
        staffing: false,
        programs: false,
        seating: false,
        pricing: false,
        publish: false,
      },
      hasStaffingGap: false,
      publishedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      cancelledByAccountId: null,
      createdByAccountId: testCreatedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const parsed = tripSelect.safeParse(validTripRow);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.id).toBe(testTripId);
      expect(parsed.data.titleAr).toBe("رحلة الأهرامات");
    }
  });

  test("R1-02: createInsertSchema generates schemas supporting custom overrides and optional generated columns", () => {
    // Authoritative source: Drizzle Zod insert schema guidance
    const vehicleInsert = createInsertSchema(schema.vehicles, {
      plateNumber: (col) => col.trim().min(2).max(20),
      model: (col) => col.trim().min(1).max(100),
      manufacturingYear: (col) => col.int().min(1990).max(2050),
      seatCount: (col) => col.int().min(1).max(120),
    });

    const validPayload = {
      tenantId: randomUUID(),
      vehicleTypeId: randomUUID(),
      plateNumber: "ABC 1234",
      plateNumberNormalized: "ABC1234",
      model: "Mercedes Tourismo",
      manufacturingYear: 2023,
      seatCount: 50,
      createdByAccountId: randomUUID(),
    };

    const result = vehicleInsert.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  test("R1-03: createUpdateSchema generates partial schemas for entity mutations", () => {
    // Authoritative source: Drizzle Zod update schema guidance
    const couponUpdate = createUpdateSchema(schema.coupons, {
      titleAr: (col) => col.trim().min(1).max(120),
      titleEn: (col) => col.trim().min(1).max(120),
    });

    // Update payload with only partial fields
    const partialPayload = {
      titleAr: "خصم الصيف المحدث",
      discountValue: 15,
    };

    const result = couponUpdate.safeParse(partialPayload);
    expect(result.success).toBe(true);
  });

  test("R1-04: Service boundary schemas derive cleanly using .pick(), .omit(), and .extend()", () => {
    // Derivation invariant specified in PROJECT.md interface contracts
    const baseVehicleTypeInsert = createInsertSchema(schema.vehicleTypes, {
      nameAr: (col) => col.trim().min(1).max(100),
      nameEn: (col) => col.trim().min(1).max(100),
      seatCount: (col) => col.int().min(1).max(100),
    });

    // Derived DTO for an RPC endpoint
    const createVehicleTypeDtoSchema = baseVehicleTypeInsert
      .pick({
        nameAr: true,
        nameEn: true,
        seatCount: true,
      })
      .extend({
        categoryLookupCode: z.string().trim().min(1).max(80),
      });

    const conformingInput = {
      nameAr: "حافلة كبيرة",
      nameEn: "Coach Bus",
      seatCount: 50,
      categoryLookupCode: "CAT_BUS",
    };

    const parsed = createVehicleTypeDtoSchema.safeParse(conformingInput);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.nameEn).toBe("Coach Bus");
      expect(parsed.data.categoryLookupCode).toBe("CAT_BUS");
    }
  });

  test("R1-05: Drizzle goodies integration preserves column sets, masking, and QueryBuilder invariants", () => {
    // Authoritative source: https://orm.drizzle.team/docs/goodies
    // 1. Column omit utility
    const omitted = omitColumns(schema.accounts, ["passwordHash", "totpSecretEncrypted"]);
    expect(Object.keys(omitted)).not.toContain("passwordHash");
    expect(Object.keys(omitted)).not.toContain("totpSecretEncrypted");
    expect(Object.keys(omitted)).toContain("id");
    expect(Object.keys(omitted)).toContain("fullName");

    // 2. Secret columns exclusion
    for (const sec of ACCOUNT_SECRET_COLUMNS) {
      expect(Object.keys(accountPublicColumns)).not.toContain(sec);
    }

    // 3. QueryBuilder generation
    const { sql } = qb.select(accountPublicColumns).from(schema.accounts).toSQL();
    expect(sql).toContain('select');
    expect(sql).not.toContain("password_hash");
  });

  test("R1-06: Every table discovered in the Drizzle schema can generate functional Zod schemas", () => {
    // Discovers every PgTable across all schema modules
    const allTables = Object.values(schema).filter((v): v is PgTable => is(v, PgTable));
    expect(allTables.length).toBeGreaterThanOrEqual(40);

    for (const table of allTables) {
      const config = getTableConfig(table);
      const generatedSelect = createSelectSchema(table);
      const generatedInsert = createInsertSchema(table);
      const generatedUpdate = createUpdateSchema(table);

      expect(typeof generatedSelect.safeParse).toBe("function");
      expect(typeof generatedInsert.safeParse).toBe("function");
      expect(typeof generatedUpdate.safeParse).toBe("function");
    }
  });
});
