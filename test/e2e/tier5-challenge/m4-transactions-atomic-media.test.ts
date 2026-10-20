import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { and, eq, schema, seedDefaultData } from "@trips-app/db";
import type { ServiceDatabase } from "@trips-app/db";
import { getTestContext, getTestDb, TestEntityTracker } from "../helpers/db";

// Service & Repository factories
import { createFleetRepository } from "../../../packages/services/fleet/src/repository";
import { createFleetService } from "../../../packages/services/fleet/src/services";
import { normalizePlateNumber } from "../../../packages/services/fleet/src/model";
import type { FleetTenantActorContext } from "../../../packages/services/fleet/src/types";

import { createTripsRepository } from "../../../packages/services/trips/src/repository";
import { createTripsService } from "../../../packages/services/trips/src/services";
import type { TripsTenantActorContext } from "../../../packages/services/trips/src/types";

import { createProgramsRepository } from "../../../packages/services/programs/src/repository";
import { createProgramsService } from "../../../packages/services/programs/src/services";
import type { ProgramsTenantActorContext } from "../../../packages/services/programs/src/types";

// Extract Drizzle table name using internal Symbol(drizzle:Name)
function getTableName(table: any): string | undefined {
  if (!table) return undefined;
  const sym = Object.getOwnPropertySymbols(table).find((s) => s.description === "drizzle:Name");
  return sym ? (table[sym] as string) : undefined;
}

interface InterceptRules {
  failOnUploadedFilesUpdate?: boolean;
  failOnTripVehiclesInsert?: boolean;
  failOnPermissionCatalogInsert?: boolean;
  onInsertTable?: (tableName: string) => void;
  onUpdateTable?: (tableName: string) => void;
}

/**
 * Creates a transactional proxy around ServiceDatabase to intercept Drizzle operations
 * and simulate failure at exact transaction boundaries and media linking steps.
 */
function createInterceptingDb(baseDb: ServiceDatabase, rules: InterceptRules): ServiceDatabase {
  function wrap<T extends object>(targetObj: T): T {
    return new Proxy(targetObj, {
      get(target: any, prop: string | symbol, receiver: any) {
        if (prop === "transaction") {
          return async (cb: (tx: any) => Promise<any>, txConfig?: any) => {
            return target.transaction(async (realTx: any) => {
              const wrappedTx = wrap(realTx);
              return cb(wrappedTx);
            }, txConfig);
          };
        }

        if (prop === "update") {
          return (table: any) => {
            const tableName = getTableName(table);
            if (tableName) {
              rules.onUpdateTable?.(tableName);
            }
            if (
              rules.failOnUploadedFilesUpdate &&
              (tableName === "uploaded_files" || table === schema.uploadedFiles)
            ) {
              throw new Error(
                "SIMULATED_MEDIA_LINK_FAILURE: linkUploadedFilesOnItemSave failed during uploaded_files update",
              );
            }
            return target.update(table);
          };
        }

        if (prop === "insert") {
          return (table: any) => {
            const tableName = getTableName(table);
            if (tableName) {
              rules.onInsertTable?.(tableName);
            }
            if (
              rules.failOnTripVehiclesInsert &&
              (tableName === "trip_vehicles" || table === schema.tripVehicles)
            ) {
              throw new Error(
                "SIMULATED_TRIP_VEHICLES_INSERT_FAILURE: second step insert(tripVehicles) failed",
              );
            }
            if (
              rules.failOnPermissionCatalogInsert &&
              (tableName === "permission_catalog" || table === schema.permissionCatalog)
            ) {
              throw new Error(
                "SIMULATED_STAGE_4_PERMISSION_CATALOG_FAILURE: Stage 4 permission catalog insert failed",
              );
            }
            return target.insert(table);
          };
        }

        const val = Reflect.get(target, prop, receiver);
        if (typeof val === "function") {
          return val.bind(target);
        }
        return val;
      },
    });
  }

  return wrap(baseDb as any);
}

describe("Tier 5 Empirical Challenge: Milestone M4 Transaction Boundaries & Atomic Media Linking", () => {
  const db = getTestDb();
  const tracker = new TestEntityTracker();
  let tenantId: string;
  let ownerAccountId: string;

  const dummyLayout = {
    rows: 4,
    cols: 4,
    cells: [
      { row: 0, col: 0, type: "seat" as const, seatLabel: "1A" },
      { row: 0, col: 1, type: "seat" as const, seatLabel: "1B" },
    ],
  };

  beforeAll(async () => {
    const ctx = await getTestContext();
    tenantId = ctx.tenantId;
    ownerAccountId = ctx.ownerAccountId;
  });

  afterAll(async () => {
    await tracker.cleanup(db);
  });

  // =========================================================================
  // CHALLENGE 1: fleet:createVehicle / insertVehicle Atomic Media Linking
  // =========================================================================
  describe("CHALLENGE 1: fleet:insertVehicle & fleet:createVehicle Atomic Media Linking", () => {
    test("1.1 fleetRepo.insertVehicle: failure during linkUploadedFilesOnItemSave rolls back vehicle record completely", async () => {
      // 1. Prepare vehicle type and pending file
      const vehicleTypeId = tracker.trackVehicleType(randomUUID());
      await db.insert(schema.vehicleTypes).values({
        id: vehicleTypeId,
        tenantId,
        categoryLookupCode: "CAT_VAN",
        nameAr: "حافلة فحص 1",
        nameEn: "Challenge Van 1",
        seatCount: 14,
        seatLayout: dummyLayout,
        scope: "organization",
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      const fileId = tracker.trackFile(randomUUID());
      const testPhotoUrl = `https://storage.trips-enjoy.com/uploads/media/fleet/car-${fileId}.jpg`;
      await db.insert(schema.uploadedFiles).values({
        id: fileId,
        tenantId,
        uploaderAccountId: ownerAccountId,
        purpose: "vehicle_photo",
        status: "pending",
        originalFilename: "car.jpg",
        storageKey: `fleet/car-${fileId}.jpg`,
        publicUrl: testPhotoUrl,
        mimeType: "image/jpeg",
        fileSizeBytes: 2048,
        checksumSha256: `sha256-${fileId}`,
      });

      const plateNumber = `CHG-${Math.floor(1000 + Math.random() * 9000)}`;
      const plateNumberNormalized = normalizePlateNumber(plateNumber);

      // 2. Intercept DB with failure on uploaded_files update
      const failingDb = createInterceptingDb(db, {
        failOnUploadedFilesUpdate: true,
      });
      const failingFleetRepo = createFleetRepository(failingDb);

      // 3. Attempt insertVehicle with media linking
      let errorThrown: Error | null = null;
      try {
        await failingFleetRepo.insertVehicle({
          tenantId,
          vehicleTypeId,
          plateNumber,
          plateNumberNormalized,
          model: "Toyota HiAce 2022",
          manufacturingYear: 2022,
          seatCount: 14,
          registrationStatus: "valid",
          registrationExpiry: new Date("2028-01-01"),
          registrationDocumentUrl: null,
          photoUrls: [testPhotoUrl],
          amenityCodes: ["AC", "WIFI"],
          status: "active",
          notes: "Transactional rollback test",
          createdByAccountId: ownerAccountId,
          fileIds: [fileId],
        });
      } catch (err: any) {
        errorThrown = err;
      }

      // 4. Verify transaction aborted with simulated error
      expect(errorThrown).not.toBeNull();
      expect(errorThrown?.message).toContain("SIMULATED_MEDIA_LINK_FAILURE");

      // 5. Empirical verification: vehicle record must NOT exist in the database
      const [vehicleInDb] = await db
        .select()
        .from(schema.vehicles)
        .where(
          and(
            eq(schema.vehicles.tenantId, tenantId),
            eq(schema.vehicles.plateNumberNormalized, plateNumberNormalized),
          ),
        );
      expect(vehicleInDb).toBeUndefined();

      // 6. Empirical verification: uploaded file must remain unlinked (pending)
      const [fileInDb] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, fileId));
      expect(fileInDb?.status).toBe("pending");
      expect(fileInDb?.linkedEntityId).toBeNull();
    });

    test("1.2 fleetService.createVehicle: failure in linkUploadedFilesOnItemSave rolls back vehicle AND audit log", async () => {
      const vehicleTypeId = tracker.trackVehicleType(randomUUID());
      await db.insert(schema.vehicleTypes).values({
        id: vehicleTypeId,
        tenantId,
        categoryLookupCode: "CAT_BUS",
        nameAr: "حافلة فحص 2",
        nameEn: "Challenge Bus 2",
        seatCount: 14,
        seatLayout: dummyLayout,
        scope: "organization",
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      const fileId = tracker.trackFile(randomUUID());
      const testDocUrl = `https://storage.trips-enjoy.com/uploads/documents/fleet/reg-${fileId}.pdf`;
      await db.insert(schema.uploadedFiles).values({
        id: fileId,
        tenantId,
        uploaderAccountId: ownerAccountId,
        purpose: "vehicle_registration",
        status: "pending",
        originalFilename: "reg.pdf",
        storageKey: `fleet/reg-${fileId}.pdf`,
        publicUrl: testDocUrl,
        mimeType: "application/pdf",
        fileSizeBytes: 4096,
        checksumSha256: `sha256-${fileId}`,
      });

      const plateNumber = `SRV-${Math.floor(1000 + Math.random() * 9000)}`;
      const plateNumberNormalized = normalizePlateNumber(plateNumber);

      const failingDb = createInterceptingDb(db, {
        failOnUploadedFilesUpdate: true,
      });
      const failingFleetService = createFleetService(failingDb);

      const actor: FleetTenantActorContext = {
        accountId: ownerAccountId,
        activeTenantId: tenantId,
        role: "org_owner",
        permissions: ["manage_fleet"],
        actorType: "tenant",
        ipAddress: "127.0.0.1",
        requestId: `req-fleet-${randomUUID()}`,
      };

      let errorThrown: Error | null = null;
      try {
        await failingFleetService.createVehicle(actor, {
          vehicleTypeId,
          plateNumber,
          model: "Mercedes Sprinter",
          manufacturingYear: 2023,
          seatCount: 14,
          registrationDocumentUrl: testDocUrl,
          fileIds: [fileId],
        });
      } catch (err: any) {
        errorThrown = err;
      }

      expect(errorThrown).not.toBeNull();
      expect(errorThrown?.message).toContain("SIMULATED_MEDIA_LINK_FAILURE");

      // Verify vehicle record rolled back
      const [vehicleInDb] = await db
        .select()
        .from(schema.vehicles)
        .where(
          and(
            eq(schema.vehicles.tenantId, tenantId),
            eq(schema.vehicles.plateNumberNormalized, plateNumberNormalized),
          ),
        );
      expect(vehicleInDb).toBeUndefined();

      // Verify audit log write rolled back
      const auditLogs = await db
        .select()
        .from(schema.auditLogs)
        .where(
          and(
            eq(schema.auditLogs.tenantId, tenantId),
            eq(schema.auditLogs.action, "fleet.vehicle.created"),
            eq(schema.auditLogs.requestId, actor.requestId!),
          ),
        );
      expect(auditLogs).toHaveLength(0);
    });
  });

  // =========================================================================
  // CHALLENGE 2: trips:replaceTripVehicles Step-2 Failure & Delete Rollback
  // =========================================================================
  describe("CHALLENGE 2: trips:replaceTripVehicles Step 2 Failure Rollback", () => {
    test("2.1 tripsRepo.replaceTripVehicles: failure during step 2 (insert) preserves existing vehicle assignments", async () => {
      // 1. Setup trip
      const tripId = tracker.trackTrip(randomUUID());
      await db.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: "رحلة فحص المركبات",
        titleEn: "Vehicle Replacement Test Trip",
        descriptionAr: "وصف",
        descriptionEn: "Description",
        categoryLookupCode: "CAT_TRIP",
        language: "ar",
        timezone: "Africa/Cairo",
        currencyCode: "EGP",
        totalCapacity: 14,
        state: "draft",
        publishMode: "draft",
        createdByAccountId: ownerAccountId,
      });

      // 2. Setup initial vehicle V1 and assign to trip
      const initialVehicleId = tracker.trackVehicle(randomUUID());
      const initialVehicleTypeId = tracker.trackVehicleType(randomUUID());
      await db.insert(schema.vehicleTypes).values({
        id: initialVehicleTypeId,
        tenantId,
        categoryLookupCode: "CAT_VAN",
        nameAr: "نوع 1",
        nameEn: "Type 1",
        seatCount: 14,
        seatLayout: dummyLayout,
        scope: "organization",
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      await db.insert(schema.vehicles).values({
        id: initialVehicleId,
        tenantId,
        vehicleTypeId: initialVehicleTypeId,
        plateNumber: "INIT-001",
        plateNumberNormalized: "INIT-001",
        model: "Initial Model",
        manufacturingYear: 2020,
        seatCount: 14,
        status: "active",
        registrationStatus: "valid",
        createdByAccountId: ownerAccountId,
      });

      // Assign initialVehicleId to trip
      await db.insert(schema.tripVehicles).values({
        tenantId,
        tripId,
        vehicleId: initialVehicleId,
        seatCountSnapshot: 14,
        seatLayoutSnapshot: dummyLayout,
        driverSource: "unassigned",
        moderatorSource: "unassigned",
        photographerSource: "unassigned",
      });

      // Verify V1 is assigned
      const preAssigned = await db
        .select()
        .from(schema.tripVehicles)
        .where(
          and(eq(schema.tripVehicles.tenantId, tenantId), eq(schema.tripVehicles.tripId, tripId)),
        );
      expect(preAssigned).toHaveLength(1);
      expect(preAssigned[0]?.vehicleId).toBe(initialVehicleId);

      // 3. Setup replacement vehicle V2
      const replacementVehicleId = tracker.trackVehicle(randomUUID());
      await db.insert(schema.vehicles).values({
        id: replacementVehicleId,
        tenantId,
        vehicleTypeId: initialVehicleTypeId,
        plateNumber: "REPL-002",
        plateNumberNormalized: "REPL-002",
        model: "Replacement Model",
        manufacturingYear: 2021,
        seatCount: 14,
        status: "active",
        registrationStatus: "valid",
        createdByAccountId: ownerAccountId,
      });

      // 4. Intercept DB with failure on trip_vehicles INSERT (step 2 of replaceTripVehicles)
      const failingDb = createInterceptingDb(db, {
        failOnTripVehiclesInsert: true,
      });
      const failingTripsRepo = createTripsRepository(failingDb);

      let errorThrown: Error | null = null;
      try {
        await failingTripsRepo.replaceTripVehicles(tenantId, tripId, [
          {
            vehicleId: replacementVehicleId,
            seatCountSnapshot: 14,
            seatLayoutSnapshot: dummyLayout,
          },
        ]);
      } catch (err: any) {
        errorThrown = err;
      }

      // Step 2 failed
      expect(errorThrown).not.toBeNull();
      expect(errorThrown?.message).toContain("SIMULATED_TRIP_VEHICLES_INSERT_FAILURE");

      // 5. Empirical verification: Step 1 (delete) MUST HAVE ROLLED BACK!
      // The original vehicle V1 must still be assigned to the trip!
      const postAssigned = await db
        .select()
        .from(schema.tripVehicles)
        .where(
          and(eq(schema.tripVehicles.tenantId, tenantId), eq(schema.tripVehicles.tripId, tripId)),
        );
      expect(postAssigned).toHaveLength(1);
      expect(postAssigned[0]?.vehicleId).toBe(initialVehicleId);
      expect(postAssigned.some((v) => v.vehicleId === replacementVehicleId)).toBe(false);
    });

    test("2.2 tripsService.saveWizardStep(vehicles): rollback preserves existing vehicles & leaves wizard step uncorrupted", async () => {
      const tripId = tracker.trackTrip(randomUUID());
      await db.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: "رحلة المعالج",
        titleEn: "Wizard Step Test Trip",
        descriptionAr: "وصف",
        descriptionEn: "Description",
        categoryLookupCode: "CAT_TRIP",
        language: "ar",
        timezone: "Africa/Cairo",
        currencyCode: "EGP",
        totalCapacity: 14,
        state: "draft",
        publishMode: "draft",
        wizardSteps: {
          basics: true,
          schedule: true,
          vehicles: false,
          staffing: false,
          programs: false,
          seating: false,
          pricing: false,
          publish: false,
        },
        createdByAccountId: ownerAccountId,
      });

      const initialVehicleId = tracker.trackVehicle(randomUUID());
      const vtypeId = tracker.trackVehicleType(randomUUID());
      await db.insert(schema.vehicleTypes).values({
        id: vtypeId,
        tenantId,
        categoryLookupCode: "CAT_VAN",
        nameAr: "نوع",
        nameEn: "Type",
        seatCount: 14,
        seatLayout: dummyLayout,
        scope: "organization",
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      await db.insert(schema.vehicles).values({
        id: initialVehicleId,
        tenantId,
        vehicleTypeId: vtypeId,
        plateNumber: "WIZ-001",
        plateNumberNormalized: "WIZ-001",
        model: "Initial Van",
        manufacturingYear: 2020,
        seatCount: 14,
        status: "active",
        registrationStatus: "valid",
        createdByAccountId: ownerAccountId,
      });

      await db.insert(schema.tripVehicles).values({
        tenantId,
        tripId,
        vehicleId: initialVehicleId,
        seatCountSnapshot: 14,
        seatLayoutSnapshot: dummyLayout,
        driverSource: "unassigned",
        moderatorSource: "unassigned",
        photographerSource: "unassigned",
      });

      const nextVehicleId = tracker.trackVehicle(randomUUID());
      await db.insert(schema.vehicles).values({
        id: nextVehicleId,
        tenantId,
        vehicleTypeId: vtypeId,
        plateNumber: "WIZ-002",
        plateNumberNormalized: "WIZ-002",
        model: "Next Van",
        manufacturingYear: 2021,
        seatCount: 14,
        status: "active",
        registrationStatus: "valid",
        createdByAccountId: ownerAccountId,
      });

      const failingDb = createInterceptingDb(db, {
        failOnTripVehiclesInsert: true,
      });
      const failingTripsService = createTripsService(failingDb);

      const actor: TripsTenantActorContext = {
        accountId: ownerAccountId,
        activeTenantId: tenantId,
        role: "org_owner",
        permissions: ["manage_trips"],
        actorType: "tenant",
        ipAddress: "127.0.0.1",
        requestId: `req-trip-${randomUUID()}`,
      };

      let errorThrown: Error | null = null;
      try {
        await failingTripsService.saveWizardStep(actor, {
          tripId,
          step: "vehicles",
          vehicleIds: [nextVehicleId],
        });
      } catch (err: any) {
        errorThrown = err;
      }

      expect(errorThrown).not.toBeNull();
      expect(errorThrown?.message).toContain("SIMULATED_TRIP_VEHICLES_INSERT_FAILURE");

      // 1. Initial vehicle must still be assigned
      const assigned = await db
        .select()
        .from(schema.tripVehicles)
        .where(
          and(eq(schema.tripVehicles.tenantId, tenantId), eq(schema.tripVehicles.tripId, tripId)),
        );
      expect(assigned).toHaveLength(1);
      expect(assigned[0]?.vehicleId).toBe(initialVehicleId);

      // 2. Wizard step "vehicles" must NOT have been marked completed (must remain false)
      const [trip] = await db.select().from(schema.trips).where(eq(schema.trips.id, tripId));
      expect(trip?.wizardSteps?.vehicles).toBe(false);
      expect(trip?.totalCapacity).toBe(14);
    });
  });

  // =========================================================================
  // CHALLENGE 3: programs:insertProgram Atomic Linking & Wizard Step Rollback
  // =========================================================================
  describe("CHALLENGE 3: programs:insertProgram Atomic Linking & Wizard Step Rollback", () => {
    test("3.1 programsRepo.insertProgram: failure in linkUploadedFilesOnItemSave rolls back program AND trip wizard step", async () => {
      // 1. Create draft trip with wizardSteps.programs = false
      const tripId = tracker.trackTrip(randomUUID());
      await db.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: "رحلة برنامج فحص",
        titleEn: "Program Rollback Trip",
        descriptionAr: "وصف",
        descriptionEn: "Description",
        categoryLookupCode: "CAT_TRIP",
        language: "ar",
        timezone: "Africa/Cairo",
        currencyCode: "EGP",
        totalCapacity: 20,
        state: "draft",
        publishMode: "draft",
        wizardSteps: {
          basics: true,
          schedule: true,
          vehicles: true,
          staffing: false,
          programs: false,
          seating: false,
          pricing: false,
          publish: false,
        },
        createdByAccountId: ownerAccountId,
      });

      // 2. Create pending uploaded file
      const fileId = tracker.trackFile(randomUUID());
      const testAttachmentUrl = `https://storage.trips-enjoy.com/uploads/media/programs/prog-${fileId}.pdf`;
      await db.insert(schema.uploadedFiles).values({
        id: fileId,
        tenantId,
        uploaderAccountId: ownerAccountId,
        purpose: "trip_gallery",
        status: "pending",
        originalFilename: "program.pdf",
        storageKey: `programs/prog-${fileId}.pdf`,
        publicUrl: testAttachmentUrl,
        mimeType: "application/pdf",
        fileSizeBytes: 1024,
        checksumSha256: `sha256-${fileId}`,
      });

      // 3. Intercept DB with failure during uploaded_files update
      const failingDb = createInterceptingDb(db, {
        failOnUploadedFilesUpdate: true,
      });
      const failingProgramsRepo = createProgramsRepository(failingDb);

      let errorThrown: Error | null = null;
      try {
        await failingProgramsRepo.insertProgram({
          tenantId,
          tripId,
          titleAr: "برنامج التجربة",
          titleEn: "Challenge Program",
          descriptionAr: "وصف تجريبي",
          descriptionEn: "Challenge Description",
          dayNumber: 1,
          startsAt: null,
          endsAt: null,
          locationNameAr: null,
          locationNameEn: null,
          priceMinor: 2500,
          currencyCode: "EGP",
          isIncludedInBase: true,
          capacity: null,
          sortOrder: 0,
          attachmentUrls: [testAttachmentUrl],
          createdByAccountId: ownerAccountId,
          fileIds: [fileId],
        });
      } catch (err: any) {
        errorThrown = err;
      }

      // 4. Assert failure occurred during media linking
      expect(errorThrown).not.toBeNull();
      expect(errorThrown?.message).toContain("SIMULATED_MEDIA_LINK_FAILURE");

      // 5. Empirical verification: program record MUST NOT exist
      const programs = await db
        .select()
        .from(schema.tripPrograms)
        .where(
          and(
            eq(schema.tripPrograms.tenantId, tenantId),
            eq(schema.tripPrograms.tripId, tripId),
          ),
        );
      expect(programs).toHaveLength(0);

      // 6. Empirical verification: trip wizardSteps.programs MUST NOT be true
      const [trip] = await db.select().from(schema.trips).where(eq(schema.trips.id, tripId));
      expect(trip?.wizardSteps?.programs).toBe(false);

      // 7. Empirical verification: file status remains pending
      const [fileInDb] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, fileId));
      expect(fileInDb?.status).toBe("pending");
      expect(fileInDb?.linkedEntityId).toBeNull();
    });

    test("3.2 programsService.createProgram: transactional failure leaves database completely clean", async () => {
      const tripId = tracker.trackTrip(randomUUID());
      await db.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: "رحلة خدمة البرامج",
        titleEn: "Service Program Rollback Trip",
        descriptionAr: "وصف",
        descriptionEn: "Description",
        categoryLookupCode: "CAT_TRIP",
        language: "ar",
        timezone: "Africa/Cairo",
        currencyCode: "EGP",
        totalCapacity: 20,
        state: "draft",
        publishMode: "draft",
        wizardSteps: {
          basics: true,
          schedule: true,
          vehicles: true,
          staffing: false,
          programs: false,
          seating: false,
          pricing: false,
          publish: false,
        },
        createdByAccountId: ownerAccountId,
      });

      const fileId = tracker.trackFile(randomUUID());
      const testAttachmentUrl = `https://storage.trips-enjoy.com/uploads/media/programs/prog2-${fileId}.pdf`;
      await db.insert(schema.uploadedFiles).values({
        id: fileId,
        tenantId,
        uploaderAccountId: ownerAccountId,
        purpose: "trip_gallery",
        status: "pending",
        originalFilename: "program2.pdf",
        storageKey: `programs/prog2-${fileId}.pdf`,
        publicUrl: testAttachmentUrl,
        mimeType: "application/pdf",
        fileSizeBytes: 1024,
        checksumSha256: `sha256-${fileId}`,
      });

      const failingDb = createInterceptingDb(db, {
        failOnUploadedFilesUpdate: true,
      });
      const failingProgramsService = createProgramsService(failingDb);

      const actor: ProgramsTenantActorContext = {
        accountId: ownerAccountId,
        activeTenantId: tenantId,
        role: "org_owner",
        permissions: ["manage_trips"],
        actorType: "tenant",
        ipAddress: "127.0.0.1",
        requestId: `req-prog-${randomUUID()}`,
      };

      let errorThrown: Error | null = null;
      try {
        await failingProgramsService.createProgram(actor, {
          tripId,
          titleAr: "برنامج خدمة",
          titleEn: "Service Program",
          attachmentUrls: [testAttachmentUrl],
          fileIds: [fileId],
        });
      } catch (err: any) {
        errorThrown = err;
      }

      expect(errorThrown).not.toBeNull();
      expect(errorThrown?.message).toContain("SIMULATED_MEDIA_LINK_FAILURE");

      const programs = await db
        .select()
        .from(schema.tripPrograms)
        .where(
          and(
            eq(schema.tripPrograms.tenantId, tenantId),
            eq(schema.tripPrograms.tripId, tripId),
          ),
        );
      expect(programs).toHaveLength(0);

      const [trip] = await db.select().from(schema.trips).where(eq(schema.trips.id, tripId));
      expect(trip?.wizardSteps?.programs).toBe(false);
    });
  });

  // =========================================================================
  // CHALLENGE 4: seedDefaultData Stage 4 Failure Clean Rollback of Stages 1-3
  // =========================================================================
  describe("CHALLENGE 4: seedDefaultData Transaction Boundary & Rollback", () => {
    test("4.1 seedDefaultData: failure in stage 4 rolls back stages 1-3 cleanly", async () => {
      // 1. Capture timestamps before running test
      const [preSystemSettings] = await db.select().from(schema.systemSettings);
      const [preAuthSettings] = await db.select().from(schema.authSettings);
      const preRoleDefinitions = await db.select().from(schema.roleDefinitions);

      // Distinct future timestamp that would only be set if the transaction commits
      const testNow = new Date("2099-12-31T23:59:59.000Z");

      const stagesInvoked: string[] = [];

      // 2. Intercept DB: capture executed stages, throw at stage 4 (permission_catalog)
      const failingDb = createInterceptingDb(db, {
        failOnPermissionCatalogInsert: true,
        onInsertTable: (tableName) => {
          stagesInvoked.push(tableName);
        },
      });

      // 3. Run seedDefaultData with the failing DB
      let errorThrown: Error | null = null;
      try {
        await seedDefaultData(failingDb, { now: testNow });
      } catch (err: any) {
        errorThrown = err;
      }

      // 4. Verify stage 4 error was thrown
      expect(errorThrown).not.toBeNull();
      expect(errorThrown?.message).toContain("SIMULATED_STAGE_4_PERMISSION_CATALOG_FAILURE");

      // 5. Verify execution progression before failure:
      // Stage 1 (system_settings), Stage 2 (auth_settings), and Stage 3 (role_definitions) were reached on tx
      expect(stagesInvoked).toContain("system_settings");
      expect(stagesInvoked).toContain("auth_settings");
      expect(stagesInvoked).toContain("role_definitions");
      expect(stagesInvoked).toContain("permission_catalog");

      // Stages 5-7 (plan_catalog, accounts, account_roles, etc.) were never reached
      expect(stagesInvoked).not.toContain("plan_catalog");
      expect(stagesInvoked).not.toContain("accounts");

      // 6. Empirical verification: Stages 1-3 were rolled back by PostgreSQL!
      // The testNow timestamp (2099-12-31) must NOT be present on any table!
      const [postSystemSettings] = await db.select().from(schema.systemSettings);
      if (postSystemSettings && preSystemSettings) {
        expect(postSystemSettings.updatedAt.toISOString()).not.toBe(testNow.toISOString());
        expect(postSystemSettings.updatedAt.getTime()).toBe(preSystemSettings.updatedAt.getTime());
      }

      const [postAuthSettings] = await db.select().from(schema.authSettings);
      if (postAuthSettings && preAuthSettings) {
        expect(postAuthSettings.updatedAt.toISOString()).not.toBe(testNow.toISOString());
        expect(postAuthSettings.updatedAt.getTime()).toBe(preAuthSettings.updatedAt.getTime());
      }

      const postRoleDefinitions = await db.select().from(schema.roleDefinitions);
      for (const roleDef of postRoleDefinitions) {
        expect(roleDef.updatedAt.toISOString()).not.toBe(testNow.toISOString());
        const pre = preRoleDefinitions.find((r) => r.role === roleDef.role);
        if (pre) {
          expect(roleDef.updatedAt.getTime()).toBe(pre.updatedAt.getTime());
        }
      }
    });

    test("4.2 seedDefaultData: baseline execution without failure succeeds atomically", async () => {
      // Normal run to verify seedDefaultData completes atomically without simulated errors
      const summary = await seedDefaultData(db);
      expect(summary.mode).toBe("default");
      expect(summary.systemSettingsSeeded).toBe(true);
      expect(summary.authSettingsSeeded).toBe(true);
      expect(summary.rolesSeeded).toBeGreaterThan(0);
      expect(summary.plansSeeded).toBeGreaterThan(0);
      expect(summary.lookupsSeeded).toBeGreaterThan(0);
    });
  });
});
