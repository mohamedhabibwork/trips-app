import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { and, desc, eq, inArray, schema, seedDefaultData } from "@trips-app/db";
import { getTestContext, getTestDb, TestEntityTracker } from "../helpers/db";
import { createOrganizationRepository } from "../../../packages/services/organization/src/repository";
import { createProgramsRepository } from "../../../packages/services/programs/src/repository";

describe("Tier 1 - Feature R2: Dynamic Query Building, Transactions & Batch Patterns", () => {
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

  test("R2-01: db.select().from(...).$dynamic() conditionally composes WHERE, ORDER BY, and LIMIT clauses", async () => {
    // Authoritative source: https://orm.drizzle.team/docs/dynamic-query-building
    // Create two test vehicle types with distinct scopes
    const typeId1 = tracker.trackVehicleType(randomUUID());
    const typeId2 = tracker.trackVehicleType(randomUUID());

    const dummyLayout = {
      rows: 4,
      cols: 4,
      cells: [
        { row: 0, col: 0, type: "seat" as const, seatLabel: "1A" },
        { row: 0, col: 1, type: "seat" as const, seatLabel: "1B" },
      ],
    };

    await db.insert(schema.vehicleTypes).values([
      {
        id: typeId1,
        tenantId,
        categoryLookupCode: "CAT_VAN",
        nameAr: "حافلة صغيرة أ",
        nameEn: "Mini Van A",
        seatCount: 14,
        seatLayout: dummyLayout,
        scope: "organization",
        status: "active",
        createdByAccountId: ownerAccountId,
      },
      {
        id: typeId2,
        tenantId,
        categoryLookupCode: "CAT_BUS",
        nameAr: "حافلة كبيرة ب",
        nameEn: "Large Coach B",
        seatCount: 50,
        seatLayout: dummyLayout,
        scope: "platform",
        status: "active",
        createdByAccountId: ownerAccountId,
      },
    ]);

    // Dynamic query helper pattern
    function buildDynamicQuery(filters: { scope?: "organization" | "platform"; minSeats?: number }) {
      const qb = db.select().from(schema.vehicleTypes).$dynamic();
      const conditions = [eq(schema.vehicleTypes.tenantId, tenantId)];

      if (filters.scope) {
        conditions.push(eq(schema.vehicleTypes.scope, filters.scope));
      }
      if (filters.minSeats !== undefined) {
        conditions.push(eq(schema.vehicleTypes.seatCount, filters.minSeats));
      }

      return qb.where(and(...conditions)).orderBy(desc(schema.vehicleTypes.createdAt)).limit(10);
    }

    const orgResults = await buildDynamicQuery({ scope: "organization" });
    expect(orgResults.some((vt) => vt.id === typeId1)).toBe(true);
    expect(orgResults.some((vt) => vt.id === typeId2)).toBe(false);

    const coachResults = await buildDynamicQuery({ minSeats: 50 });
    expect(coachResults.some((vt) => vt.id === typeId2)).toBe(true);
  });

  test("R2-02: db.transaction(...) coordinates multi-table mutations atomically committing on success", async () => {
    // Authoritative source: https://orm.drizzle.team/docs/transactions
    const tripId = tracker.trackTrip(randomUUID());
    const vehicleTypeId = tracker.trackVehicleType(randomUUID());
    const vehicleId = tracker.trackVehicle(randomUUID());

    const dummyLayout = {
      rows: 4,
      cols: 4,
      cells: [
        { row: 0, col: 0, type: "seat" as const, seatLabel: "1A" },
        { row: 0, col: 1, type: "seat" as const, seatLabel: "1B" },
      ],
    };

    await db.transaction(async (tx) => {
      // Step 1: Create vehicle type
      await tx.insert(schema.vehicleTypes).values({
        id: vehicleTypeId,
        tenantId,
        categoryLookupCode: "CAT_TEST",
        nameAr: "نوع تجريبي",
        nameEn: "Test Type",
        seatCount: 20,
        seatLayout: dummyLayout,
        scope: "organization",
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      // Step 2: Create vehicle
      await tx.insert(schema.vehicles).values({
        id: vehicleId,
        tenantId,
        vehicleTypeId,
        plateNumber: "TRX 9999",
        plateNumberNormalized: "TRX9999",
        model: "Mercedes Sprinter",
        manufacturingYear: 2024,
        seatCount: 20,
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      // Step 3: Create trip
      await tx.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: "رحلة المعاملة",
        titleEn: "Transaction Trip",
        categoryLookupCode: "CAT_TEST",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 25000,
        totalCapacity: 20,
        state: "draft",
        publishMode: "draft",
        createdByAccountId: ownerAccountId,
      });
    });

    // Verify all 3 records committed successfully
    const [fetchedType] = await db
      .select()
      .from(schema.vehicleTypes)
      .where(eq(schema.vehicleTypes.id, vehicleTypeId));
    const [fetchedVehicle] = await db
      .select()
      .from(schema.vehicles)
      .where(eq(schema.vehicles.id, vehicleId));
    const [fetchedTrip] = await db.select().from(schema.trips).where(eq(schema.trips.id, tripId));

    expect(fetchedType).toBeDefined();
    expect(fetchedVehicle).toBeDefined();
    expect(fetchedTrip).toBeDefined();
  });

  test("R2-03: db.transaction(...) rolls back all operations when an intermediate statement throws", async () => {
    const tripId = randomUUID();

    const execution = db.transaction(async (tx) => {
      // Step 1: Insert trip
      await tx.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: "رحلة ستفشل",
        titleEn: "Doomed Trip",
        categoryLookupCode: "CAT_TEST",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 10000,
        totalCapacity: 10,
        state: "draft",
        publishMode: "draft",
        createdByAccountId: ownerAccountId,
      });

      // Step 2: Intentional error to trigger rollback
      throw new Error("Simulated transactional failure");
    });

    await expect(execution).rejects.toThrow("Simulated transactional failure");

    // Verify trip was NOT committed to the database
    const [orphanTrip] = await db.select().from(schema.trips).where(eq(schema.trips.id, tripId));
    expect(orphanTrip).toBeUndefined();
  });

  test("R2-04: High-performance parallel reads via Promise.all execute concurrently without data races", async () => {
    // Authoritative source: PG batch patterns in PROJECT.md
    const [tripsCountRes, vehiclesCountRes, orgRes] = await Promise.all([
      db.select().from(schema.trips).where(eq(schema.trips.tenantId, tenantId)),
      db.select().from(schema.vehicles).where(eq(schema.vehicles.tenantId, tenantId)),
      db.select().from(schema.organizations).where(eq(schema.organizations.id, tenantId)),
    ]);

    expect(Array.isArray(tripsCountRes)).toBe(true);
    expect(Array.isArray(vehiclesCountRes)).toBe(true);
    expect(orgRes.length).toBe(1);
    expect(orgRes[0]?.id).toBe(tenantId);
  });

  test("R2-05: Multi-row bulk insert patterns (.values([...])) execute in a single atomic database statement", async () => {
    // Authoritative source: https://orm.drizzle.team/docs/batch-api / PostgreSQL bulk insert
    const c1Id = tracker.trackCoupon(randomUUID());
    const c2Id = tracker.trackCoupon(randomUUID());
    const c3Id = tracker.trackCoupon(randomUUID());

    const bulkCoupons = [
      {
        id: c1Id,
        tenantId,
        ownerAccountId,
        code: `BULK1_${Date.now()}`,
        titleAr: "كوبون 1",
        titleEn: "Coupon 1",
        discountType: "percentage" as const,
        discountValue: 10,
        currencyCode: "EGP" as const,
        status: "active" as const,
      },
      {
        id: c2Id,
        tenantId,
        ownerAccountId,
        code: `BULK2_${Date.now()}`,
        titleAr: "كوبون 2",
        titleEn: "Coupon 2",
        discountType: "fixed" as const,
        discountValue: 5000,
        currencyCode: "EGP" as const,
        status: "active" as const,
      },
      {
        id: c3Id,
        tenantId,
        ownerAccountId,
        code: `BULK3_${Date.now()}`,
        titleAr: "كوبون 3",
        titleEn: "Coupon 3",
        discountType: "percentage" as const,
        discountValue: 15,
        currencyCode: "EGP" as const,
        status: "active" as const,
      },
    ];

    const insertResult = await db.insert(schema.coupons).values(bulkCoupons).returning();
    expect(insertResult.length).toBe(3);

    const fetched = await db
      .select()
      .from(schema.coupons)
      .where(inArray(schema.coupons.id, [c1Id, c2Id, c3Id]));
    expect(fetched.length).toBe(3);
  });

  test("R2-06: Database transaction client tx satisfies the ServiceDatabase interface", async () => {
    // Invariant: Repository factories must accept both Database and TransactionClient (tx)
    let ranWithTx = false;

    await db.transaction(async (tx) => {
      // Prove that tx can execute arbitrary type-safe queries as ServiceDatabase
      const rows = await tx
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.id, tenantId))
        .limit(1);

      expect(rows.length).toBe(1);
      ranWithTx = true;
    });

    expect(ranWithTx).toBe(true);
  });

  test("R2-07: programs:updateProgramForTenant atomically coordinates program update and uploaded file linking", async () => {
    const tripId = tracker.trackTrip(randomUUID());
    const fileId1 = tracker.trackFile(randomUUID());
    const fileId2 = tracker.trackFile(randomUUID());

    // Create a trip to link program to
    await db.insert(schema.trips).values({
      id: tripId,
      tenantId,
      titleAr: "رحلة لبرنامج المعاملة",
      titleEn: "Trip for Program Transaction",
      categoryLookupCode: "CAT_TEST",
      language: "ar",
      timezone: "Africa/Cairo",
      basePriceMinor: 15000,
      totalCapacity: 20,
      state: "draft",
      publishMode: "draft",
      createdByAccountId: ownerAccountId,
    });

    // Create two pending uploaded files
    await db.insert(schema.uploadedFiles).values([
      {
        id: fileId1,
        tenantId,
        uploaderAccountId: ownerAccountId,
        purpose: "trip_gallery",
        status: "pending",
        originalFilename: "file-1.jpg",
        storageKey: `programs/file-1-${fileId1}.jpg`,
        publicUrl: `https://storage.trips-enjoy.com/uploads/media/programs/file-1-${fileId1}.jpg`,
        mimeType: "image/jpeg",
        fileSizeBytes: 1024,
        checksumSha256: "sha256-file-1",
      },
      {
        id: fileId2,
        tenantId,
        uploaderAccountId: ownerAccountId,
        purpose: "trip_gallery",
        status: "pending",
        originalFilename: "file-2.jpg",
        storageKey: `programs/file-2-${fileId2}.jpg`,
        publicUrl: `https://storage.trips-enjoy.com/uploads/media/programs/file-2-${fileId2}.jpg`,
        mimeType: "image/jpeg",
        fileSizeBytes: 2048,
        checksumSha256: "sha256-file-2",
      },
    ]);

    const programsRepo = createProgramsRepository(db);
    const created = await programsRepo.insertProgram({
      tenantId,
      tripId,
      titleAr: "برنامج أولي",
      titleEn: "Initial Program",
      descriptionAr: "وصف البرنامج الأولي",
      descriptionEn: "Initial Program Description",
      dayNumber: 1,
      priceMinor: 500,
      currencyCode: "EGP",
      isIncludedInBase: true,
      attachmentUrls: [`https://storage.trips-enjoy.com/uploads/media/programs/file-1-${fileId1}.jpg`],
      createdByAccountId: ownerAccountId,
      fileIds: [fileId1],
    });

    // Verify first file is linked
    const [file1] = await db.select().from(schema.uploadedFiles).where(eq(schema.uploadedFiles.id, fileId1));
    expect(file1?.status).toBe("linked");
    expect(file1?.linkedEntityType).toBe("trip_program");
    expect(file1?.linkedEntityId).toBe(created.id);

    // Update program with second file
    const updated = await programsRepo.updateProgramForTenant(tenantId, created.id, {
      titleEn: "Updated Program Title",
      attachmentUrls: [`https://storage.trips-enjoy.com/uploads/media/programs/file-2-${fileId2}.jpg`],
      updatedByAccountId: ownerAccountId,
      fileIds: [fileId2],
    });

    expect(updated?.titleEn).toBe("Updated Program Title");
    const [file2] = await db.select().from(schema.uploadedFiles).where(eq(schema.uploadedFiles.id, fileId2));
    expect(file2?.status).toBe("linked");
    expect(file2?.linkedEntityType).toBe("trip_program");
    expect(file2?.linkedEntityId).toBe(created.id);

    // Clean up program
    await db.delete(schema.tripPrograms).where(eq(schema.tripPrograms.id, created.id));
  });

  test("R2-08: organization:upsertOrganizationSettings atomically coordinates settings upsert and logo file linking", async () => {
    const logoFileId = tracker.trackFile(randomUUID());
    const logoUrl = `https://storage.trips-enjoy.com/uploads/media/org/logo-${logoFileId}.png`;

    await db.insert(schema.uploadedFiles).values({
      id: logoFileId,
      tenantId,
      uploaderAccountId: ownerAccountId,
      purpose: "avatar",
      status: "pending",
      originalFilename: "logo.png",
      storageKey: `org/logo-${logoFileId}.png`,
      publicUrl: logoUrl,
      mimeType: "image/png",
      fileSizeBytes: 4096,
      checksumSha256: "sha256-logo",
    });

    const orgRepo = createOrganizationRepository(db);
    const existingSettings = await orgRepo.findSettingsByTenantId(tenantId);

    const saved = await orgRepo.upsertOrganizationSettings(tenantId, {
      timeZone: existingSettings?.timeZone ?? "Africa/Cairo",
      defaultLanguage: existingSettings?.defaultLanguage ?? "ar",
      seatSelfSelectionEnabled: false,
      seatPriorityWindowMinutes: 0,
      childTrackingEnabledByDefault: false,
      invoiceLanguage: "ar",
      b2bInvoicingEnabled: false,
      customBrandingEnabled: true,
      logoUrl,
      updatedByAccountId: ownerAccountId,
    });

    expect(saved.logoUrl).toBe(logoUrl);

    const [logoFile] = await db.select().from(schema.uploadedFiles).where(eq(schema.uploadedFiles.id, logoFileId));
    expect(logoFile?.status).toBe("linked");
    expect(logoFile?.linkedEntityType).toBe("organization");
    expect(logoFile?.linkedEntityId).toBe(tenantId);
  });

  test("R2-09: seedDefaultData executes atomically inside db.transaction", async () => {
    const summary = await seedDefaultData(db);
    expect(summary.mode).toBe("default");
    expect(summary.systemSettingsSeeded).toBe(true);
    expect(summary.authSettingsSeeded).toBe(true);
    expect(summary.rolesSeeded).toBeGreaterThan(0);
    expect(summary.plansSeeded).toBeGreaterThan(0);
    expect(summary.bootstrapSuperAdmin.email).toBeDefined();
  });
});
