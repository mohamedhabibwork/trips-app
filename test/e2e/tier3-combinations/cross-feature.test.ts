import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { and, eq, inArray, schema } from "@trips-app/db";
import { createInsertSchema } from "@trips-app/db";
import { TRIP_STATES } from "@trips-app/service-trips";
import { VEHICLE_STATUSES } from "@trips-app/service-fleet";
import { linkUploadedFilesOnItemSave } from "@trips-app/db";
import { z } from "zod/v4";
import { getTestContext, getTestDb, TestEntityTracker } from "../helpers/db";

describe("Tier 3 - Cross-Feature Combinations (R1, R2, R3, R4 Pairwise & Multi-Feature)", () => {
  const db = getTestDb();
  const tracker = new TestEntityTracker();
  let tenantId: string;
  let ownerAccountId: string;

  beforeAll(async () => {
    const ctx = await getTestContext();
    tenantId = ctx.tenantId;
    ownerAccountId = ctx.ownerAccountId;
  });

  afterAll(async () => {
    await tracker.cleanup(db);
  });

  test("COMBO-01 (R1 + R2): Schema-validated payload directly drives atomic db.transaction mutations", async () => {
    // 1. Dynamic insert schema derived from trips table
    const tripInsertSchema = createInsertSchema(schema.trips, {
      titleAr: (col) => col.trim().min(3).max(200),
      titleEn: (col) => col.trim().min(3).max(200),
      basePriceMinor: (col) => col.int().min(0),
    });

    const rawInput = {
      tenantId,
      titleAr: "رحلة مركبة تجريبية",
      titleEn: "Combined Feature Trip",
      categoryLookupCode: "CAT_COMBO",
      language: "ar",
      timezone: "Africa/Cairo",
      basePriceMinor: 45000,
      totalCapacity: 25,
      state: "draft",
      publishMode: "draft",
      createdByAccountId: ownerAccountId,
    };

    // 2. Validate input at boundary
    const validation = tripInsertSchema.safeParse(rawInput);
    expect(validation.success).toBe(true);
    if (!validation.success) return;

    const tripId = tracker.trackTrip(randomUUID());

    // 3. Drive transaction using validated data
    await db.transaction(async (tx) => {
      await tx.insert(schema.trips).values({
        id: tripId,
        ...validation.data,
      });
    });

    // Verify record in DB
    const [fetched] = await db.select().from(schema.trips).where(eq(schema.trips.id, tripId));
    expect(fetched).toBeDefined();
    expect(fetched?.titleEn).toBe("Combined Feature Trip");
  });

  test("COMBO-02 (R2 + R3): Dynamic query building ($dynamic()) filtering by canonical domain enums", async () => {
    // Filter trips dynamically using canonical TRIP_STATES
    function filterTripsByStates(states: typeof TRIP_STATES) {
      const qb = db.select().from(schema.trips).$dynamic();
      return qb
        .where(and(eq(schema.trips.tenantId, tenantId), inArray(schema.trips.state, [...states])))
        .limit(10);
    }

    const draftResults = await filterTripsByStates(["draft", "published"]);
    expect(Array.isArray(draftResults)).toBe(true);
    for (const trip of draftResults) {
      expect(["draft", "published"]).toContain(trip.state);
    }
  });

  test("COMBO-03 (R2 + R4): Entity mutation and media file linking executed atomically in transaction", async () => {
    const fileId = tracker.trackFile(randomUUID());
    const vehicleTypeId = tracker.trackVehicleType(randomUUID());
    const vehicleId = tracker.trackVehicle(randomUUID());

    // Create an uploaded file in pending status
    await db.insert(schema.uploadedFiles).values({
      id: fileId,
      uploaderAccountId: ownerAccountId,
      tenantId,
      disk: "uploads",
      storageKey: `vehicles/reg_${Date.now()}.pdf`,
      originalFilename: "reg.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 10240,
      checksumSha256: "dummy_checksum_12345",
      publicUrl: "https://storage.example.com/reg.pdf",
      purpose: "vehicle_registration",
      status: "pending",
    });

    const dummyLayout = {
      rows: 4,
      cols: 4,
      cells: [
        { row: 0, col: 0, type: "seat" as const, seatLabel: "1A" },
        { row: 0, col: 1, type: "seat" as const, seatLabel: "1B" },
      ],
    };

    // Atomic transaction: create vehicle + link file
    await db.transaction(async (tx) => {
      await tx.insert(schema.vehicleTypes).values({
        id: vehicleTypeId,
        tenantId,
        categoryLookupCode: "CAT_VAN",
        nameAr: "نوع ربط الوسائط",
        nameEn: "Media Link Type",
        seatCount: 15,
        seatLayout: dummyLayout,
        scope: "organization",
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      await tx.insert(schema.vehicles).values({
        id: vehicleId,
        tenantId,
        vehicleTypeId,
        plateNumber: "LNK 1111",
        plateNumberNormalized: "LNK1111",
        model: "Toyota HiAce",
        manufacturingYear: 2022,
        seatCount: 15,
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      // Link file inside transaction
      await linkUploadedFilesOnItemSave(tx as any, {
        tenantId,
        entityType: "vehicle",
        entityId: vehicleId,
        fileIds: [fileId],
      });
    });

    // Verify file is now linked and status is verified/linked
    const [fileRow] = await db
      .select()
      .from(schema.uploadedFiles)
      .where(eq(schema.uploadedFiles.id, fileId));
    expect(fileRow?.linkedEntityType).toBe("vehicle");
    expect(fileRow?.linkedEntityId).toBe(vehicleId);
    expect(fileRow?.status).toBe("linked");
  });

  test("COMBO-04 (R1 + R2 + R3): Bulk multi-row insert with schemas and canonical enum values", async () => {
    const couponItemSchema = createInsertSchema(schema.coupons, {
      titleAr: (c) => c.trim().min(2),
      titleEn: (c) => c.trim().min(2),
      discountValue: (c) => c.int().min(1),
    });

    const c1 = tracker.trackCoupon(randomUUID());
    const c2 = tracker.trackCoupon(randomUUID());

    const batchData = [
      {
        id: c1,
        tenantId,
        ownerAccountId,
        code: `CMB1_${Date.now()}`,
        titleAr: "كوبون مدمج 1",
        titleEn: "Combo 1",
        discountType: "percentage" as const,
        discountValue: 12,
        currencyCode: "EGP" as const,
        status: "active" as const,
      },
      {
        id: c2,
        tenantId,
        ownerAccountId,
        code: `CMB2_${Date.now()}`,
        titleAr: "كوبون مدمج 2",
        titleEn: "Combo 2",
        discountType: "fixed" as const,
        discountValue: 2500,
        currencyCode: "EGP" as const,
        status: "active" as const,
      },
    ];

    for (const item of batchData) {
      expect(couponItemSchema.safeParse(item).success).toBe(true);
    }

    const inserted = await db.insert(schema.coupons).values(batchData).returning();
    expect(inserted.length).toBe(2);
  });

  test("COMBO-05 (R2 + R4): Read state via dynamic query within transaction before committing updates", async () => {
    const couponId = tracker.trackCoupon(randomUUID());

    await db.insert(schema.coupons).values({
      id: couponId,
      tenantId,
      ownerAccountId,
      code: `TX_INSPECT_${Date.now()}`,
      titleAr: "كوبون فحص المعاملة",
      titleEn: "Tx Inspect Coupon",
      discountType: "percentage",
      discountValue: 20,
      currencyCode: "EGP",
      status: "active",
    });

    await db.transaction(async (tx) => {
      // Step 1: Dynamic query inspects coupon state inside tx
      const [existing] = await tx
        .select()
        .from(schema.coupons)
        .$dynamic()
        .where(and(eq(schema.coupons.id, couponId), eq(schema.coupons.status, "active")))
        .limit(1);

      expect(existing).toBeDefined();

      // Step 2: Conditionally mutate
      if (existing) {
        await tx
          .update(schema.coupons)
          .set({ status: "paused" })
          .where(eq(schema.coupons.id, couponId));
      }
    });

    const [updated] = await db
      .select()
      .from(schema.coupons)
      .where(eq(schema.coupons.id, couponId));
    expect(updated?.status).toBe("paused");
  });

  test("COMBO-06 (R1 + R2 + R4): Multi-table transactional consistency across interdependent entities", async () => {
    const tripId = tracker.trackTrip(randomUUID());
    const vehicleTypeId = tracker.trackVehicleType(randomUUID());
    const vehicleId = tracker.trackVehicle(randomUUID());

    const dummyLayout = {
      rows: 2,
      cols: 2,
      cells: [
        { row: 0, col: 0, type: "seat" as const, seatLabel: "A1" },
        { row: 0, col: 1, type: "seat" as const, seatLabel: "A2" },
      ],
    };

    // Coordinated multi-entity write
    await db.transaction(async (tx) => {
      await tx.insert(schema.vehicleTypes).values({
        id: vehicleTypeId,
        tenantId,
        categoryLookupCode: "CAT_VAN",
        nameAr: "نوع مشترك",
        nameEn: "Shared Type",
        seatCount: 10,
        seatLayout: dummyLayout,
        scope: "organization",
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      await tx.insert(schema.vehicles).values({
        id: vehicleId,
        tenantId,
        vehicleTypeId,
        plateNumber: "COOR 123",
        plateNumberNormalized: "COOR123",
        model: "Ford Transit",
        manufacturingYear: 2021,
        seatCount: 10,
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      await tx.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: "رحلة منسقة",
        titleEn: "Coordinated Trip",
        categoryLookupCode: "CAT_TEST",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 15000,
        totalCapacity: 10,
        state: "draft",
        publishMode: "draft",
        createdByAccountId: ownerAccountId,
      });

      // Link vehicle to trip
      await tx.insert(schema.tripVehicles).values({
        tenantId,
        tripId,
        vehicleId,
        seatCountSnapshot: 10,
        seatLayoutSnapshot: dummyLayout,
      });
    });

    // Verify trip vehicle association persisted
    const [tv] = await db
      .select()
      .from(schema.tripVehicles)
      .where(and(eq(schema.tripVehicles.tripId, tripId), eq(schema.tripVehicles.vehicleId, vehicleId)));
    expect(tv).toBeDefined();
    expect(tv?.seatCountSnapshot).toBe(10);
  });
});
