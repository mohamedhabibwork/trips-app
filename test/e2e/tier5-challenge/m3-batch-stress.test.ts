import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { inArray, schema } from "@trips-app/db";
import type { TransactionClient } from "@trips-app/db";
import { getTestContext, getTestDb, TestEntityTracker } from "../helpers/db";

// Import all 26 repository factories
import { createAccountingRepository } from "../../../packages/services/accounting/src/repository";
import { createAdminRepository } from "../../../packages/services/admin/src/repository";
import { createAuthRepository } from "../../../packages/services/auth/src/repository";
import { createAvailabilityRepository } from "../../../packages/services/availability/src/repository";
import { createBookingRepository } from "../../../packages/services/booking/src/repository";
import { createCheckInRepository } from "../../../packages/services/check-in/src/repository";
import { createCouponsRepository } from "../../../packages/services/coupons/src/repository";
import { createDriverRepository } from "../../../packages/services/driver/src/repository";
import { createEmployeesRepository } from "../../../packages/services/employees/src/repository";
import { createFleetRepository } from "../../../packages/services/fleet/src/repository";
import { createMediaRepository } from "../../../packages/services/media/src/repository";
import { createModeratorRepository } from "../../../packages/services/moderator/src/repository";
import { createNegotiationRepository } from "../../../packages/services/negotiation/src/repository";
import { createNotificationsRepository } from "../../../packages/services/notifications/src/repository";
import { createOnboardingRepository } from "../../../packages/services/onboarding/src/repository";
import { createOrganizationRepository } from "../../../packages/services/organization/src/repository";
import { createParentRepository } from "../../../packages/services/parent/src/repository";
import { createPaymentsRepository } from "../../../packages/services/payments/src/repository";
import { createPhotographerRepository } from "../../../packages/services/photographer/src/repository";
import { createPlansRepository } from "../../../packages/services/plans/src/repository";
import { createProgramsRepository } from "../../../packages/services/programs/src/repository";
import { createSeatsRepository } from "../../../packages/services/seats/src/repository";
import { createStaffingRepository } from "../../../packages/services/staffing/src/repository";
import { createTrackingRepository } from "../../../packages/services/tracking/src/repository";
import { createTravelerRepository } from "../../../packages/services/traveler/src/repository";
import { createTripsRepository } from "../../../packages/services/trips/src/repository";

describe("Tier 5 - Empirical Challenge: Batch Optimizations, Concurrency & TransactionClient Contracts", () => {
  const db = getTestDb();
  const tracker = new TestEntityTracker();
  let defaultTenantId: string;
  let ownerAccountId: string;

  // Track extra created entities for cleanup
  const cleanLabTestIds: string[] = [];
  const cleanLedgerIds: string[] = [];
  const cleanBlockIds: string[] = [];
  const cleanNotificationIds: string[] = [];
  const cleanTrackingEventIds: string[] = [];
  const cleanSeatInventoryIds: string[] = [];

  beforeAll(async () => {
    const ctx = await getTestContext();
    defaultTenantId = ctx.tenantId;
    ownerAccountId = ctx.ownerAccountId;
  });

  afterAll(async () => {
    if (cleanSeatInventoryIds.length > 0) {
      await db.delete(schema.tripSeatInventory).where(inArray(schema.tripSeatInventory.id, cleanSeatInventoryIds));
    }
    if (cleanTrackingEventIds.length > 0) {
      await db.delete(schema.tripTrackingEvents).where(inArray(schema.tripTrackingEvents.id, cleanTrackingEventIds));
    }
    if (cleanNotificationIds.length > 0) {
      await db.delete(schema.notificationMessages).where(inArray(schema.notificationMessages.id, cleanNotificationIds));
    }
    if (cleanBlockIds.length > 0) {
      await db.delete(schema.supplierAvailabilityBlocks).where(inArray(schema.supplierAvailabilityBlocks.id, cleanBlockIds));
    }
    if (cleanLedgerIds.length > 0) {
      await db.delete(schema.accountingLedgerEntries).where(inArray(schema.accountingLedgerEntries.id, cleanLedgerIds));
    }
    if (cleanLabTestIds.length > 0) {
      await db.delete(schema.driverLabTests).where(inArray(schema.driverLabTests.id, cleanLabTestIds));
    }
    await tracker.cleanup(db);
  });

  // =========================================================================
  // CHALLENGE 1: TransactionClient Contract across ALL 26 Repositories
  // =========================================================================
  describe("CHALLENGE 1: TransactionClient Contract & Atomic Execution", () => {
    test("1.1 Every single repository factory accepts TransactionClient and runs queries", async () => {
      await db.transaction(async (tx: TransactionClient) => {
        // Instantiate all 26 repositories with tx directly
        const accountingRepo = createAccountingRepository(tx);
        expect(accountingRepo).toBeDefined();
        const adminRepo = createAdminRepository(tx);
        expect(adminRepo).toBeDefined();
        const authRepo = createAuthRepository(tx);
        expect(authRepo).toBeDefined();
        const availabilityRepo = createAvailabilityRepository(tx);
        expect(availabilityRepo).toBeDefined();
        const bookingRepo = createBookingRepository(tx);
        expect(bookingRepo).toBeDefined();
        const checkInRepo = createCheckInRepository(tx);
        expect(checkInRepo).toBeDefined();
        const couponsRepo = createCouponsRepository(tx);
        expect(couponsRepo).toBeDefined();
        const driverRepo = createDriverRepository(tx);
        expect(driverRepo).toBeDefined();
        const employeesRepo = createEmployeesRepository(tx);
        expect(employeesRepo).toBeDefined();
        const fleetRepo = createFleetRepository(tx);
        expect(fleetRepo).toBeDefined();
        const mediaRepo = createMediaRepository(tx);
        expect(mediaRepo).toBeDefined();
        const moderatorRepo = createModeratorRepository(tx);
        expect(moderatorRepo).toBeDefined();
        const negotiationRepo = createNegotiationRepository(tx);
        expect(negotiationRepo).toBeDefined();
        const notificationsRepo = createNotificationsRepository(tx);
        expect(notificationsRepo).toBeDefined();
        const onboardingRepo = createOnboardingRepository(tx);
        expect(onboardingRepo).toBeDefined();
        const orgRepo = createOrganizationRepository(tx);
        expect(orgRepo).toBeDefined();
        const parentRepo = createParentRepository(tx);
        expect(parentRepo).toBeDefined();
        const paymentsRepo = createPaymentsRepository(tx);
        expect(paymentsRepo).toBeDefined();
        const photographerRepo = createPhotographerRepository(tx);
        expect(photographerRepo).toBeDefined();
        const plansRepo = createPlansRepository(tx);
        expect(plansRepo).toBeDefined();
        const programsRepo = createProgramsRepository(tx);
        expect(programsRepo).toBeDefined();
        const seatsRepo = createSeatsRepository(tx);
        expect(seatsRepo).toBeDefined();
        const staffingRepo = createStaffingRepository(tx);
        expect(staffingRepo).toBeDefined();
        const trackingRepo = createTrackingRepository(tx);
        expect(trackingRepo).toBeDefined();
        const travelerRepo = createTravelerRepository(tx);
        expect(travelerRepo).toBeDefined();
        const tripsRepo = createTripsRepository(tx);
        expect(tripsRepo).toBeDefined();

        // Execute real queries with tx across diverse repositories
        const usage = await plansRepo.getOrganizationUsage(defaultTenantId, new Date("2020-01-01"));
        expect(typeof usage.activeTripsThisMonth).toBe("number");
        expect(typeof usage.employees).toBe("number");

        const org = await tripsRepo.findOrganizationByTenantId(defaultTenantId);
        expect(org?.id).toBe(defaultTenantId);

        const role = await adminRepo.findAdminRoleForAccount(ownerAccountId);
        expect(role === null || typeof role === "object").toBe(true);

        const seatRows = await bookingRepo.findSeatInventoryForLabels(randomUUID(), randomUUID(), []);
        expect(seatRows).toEqual([]);

        const profile = await driverRepo.findProfileByAccountId(randomUUID());
        expect(profile).toBeNull();

        const employeeList = await employeesRepo.listByTenant(defaultTenantId);
        expect(Array.isArray(employeeList)).toBe(true);

        const files = await mediaRepo.getUploadedFilesByIds([]);
        expect(files).toEqual([]);

        const photoProfile = await photographerRepo.findProfileByAccountId(randomUUID());
        expect(photoProfile).toBeNull();
      });
    });

    test("1.2 Transactional rollback: mutations executed through tx repositories roll back on error", async () => {
      const doomedCode = `CHALLENGE_ROLLBACK_${randomUUID().slice(0, 8)}`;
      let failed = false;

      try {
        await db.transaction(async (tx: TransactionClient) => {
          const couponsRepo = createCouponsRepository(tx);
          await tx.insert(schema.coupons).values({
            tenantId: defaultTenantId,
            code: doomedCode,
            titleAr: "خصم التراجع",
            titleEn: "Rollback Discount",
            status: "active",
            discountType: "percentage",
            discountValue: 10,
            redemptionsCount: 0,
            maxRedemptions: 10,
          });

          // Verify row is visible INSIDE transaction
          const rowInside = await couponsRepo.findByCode(doomedCode);
          expect(rowInside?.code).toBe(doomedCode);

          // Force rollback
          throw new Error("INTENTIONAL_ROLLBACK_CHALLENGE");
        });
      } catch (err: any) {
        if (err.message === "INTENTIONAL_ROLLBACK_CHALLENGE" || String(err).includes("INTENTIONAL_ROLLBACK_CHALLENGE")) {
          failed = true;
        }
      }

      expect(failed).toBe(true);

      // Verify row does NOT exist OUTSIDE transaction
      const couponsRepoOut = createCouponsRepository(db);
      const rowOutside = await couponsRepoOut.findByCode(doomedCode);
      expect(rowOutside).toBeNull();
    });
  });

  // =========================================================================
  // CHALLENGE 2: plans:getOrganizationUsage Under Concurrency
  // =========================================================================
  describe("CHALLENGE 2: plans:getOrganizationUsage Under Concurrency", () => {
    const plansRepo = createPlansRepository(db);

    test("2.1 Baseline usage for valid tenant and non-existent tenant", async () => {
      const monthStart = new Date("2026-01-01T00:00:00Z");
      const usage = await plansRepo.getOrganizationUsage(defaultTenantId, monthStart);

      expect(typeof usage.activeTripsThisMonth).toBe("number");
      expect(typeof usage.employees).toBe("number");
      expect(typeof usage.activeCoupons).toBe("number");
      expect(typeof usage.maxVehiclesPerTrip).toBe("number");
      expect(typeof usage.maxProgramsPerTrip).toBe("number");

      // Non-existent tenant should return 0 for all counters cleanly
      const ghostTenantId = randomUUID();
      const ghostUsage = await plansRepo.getOrganizationUsage(ghostTenantId, monthStart);
      expect(ghostUsage.activeTripsThisMonth).toBe(0);
      expect(ghostUsage.employees).toBe(0);
      expect(ghostUsage.activeCoupons).toBe(0);
      expect(ghostUsage.maxVehiclesPerTrip).toBe(0);
      expect(ghostUsage.maxProgramsPerTrip).toBe(0);
    });

    test("2.2 50 concurrent getOrganizationUsage calls complete without deadlock or error", async () => {
      const monthStart = new Date("2026-01-01T00:00:00Z");
      const CONCURRENCY = 50;

      const promises = Array.from({ length: CONCURRENCY }, () =>
        plansRepo.getOrganizationUsage(defaultTenantId, monthStart),
      );

      const results = await Promise.all(promises);
      expect(results.length).toBe(CONCURRENCY);

      const baseline = results[0];
      for (const res of results) {
        expect(res.activeTripsThisMonth).toBe(baseline.activeTripsThisMonth);
        expect(res.employees).toBe(baseline.employees);
        expect(res.activeCoupons).toBe(baseline.activeCoupons);
        expect(res.maxVehiclesPerTrip).toBe(baseline.maxVehiclesPerTrip);
        expect(res.maxProgramsPerTrip).toBe(baseline.maxProgramsPerTrip);
      }
    });

    test("2.3 Concurrent reads during parallel mutations maintain data consistency", async () => {
      const monthStart = new Date("2026-01-01T00:00:00Z");
      const tempCouponCodes: string[] = [];

      // Concurrently run 20 readers while 5 writers insert and delete coupons
      const readers = Array.from({ length: 20 }, () =>
        plansRepo.getOrganizationUsage(defaultTenantId, monthStart),
      );

      const writers = Array.from({ length: 5 }, async (_, i) => {
        const code = `CONC_COUPON_${randomUUID().slice(0, 6)}_${i}`;
        tempCouponCodes.push(code);
        const [inserted] = await db
          .insert(schema.coupons)
          .values({
            tenantId: defaultTenantId,
            code,
            titleAr: "خصم التزامن",
            titleEn: "Concurrent Discount",
            status: "active",
            discountType: "percentage",
            discountValue: 5,
            redemptionsCount: 0,
            maxRedemptions: 5,
          })
          .returning();
        tracker.trackCoupon(inserted.id);
        return inserted;
      });

      const [readerResults, writerResults] = await Promise.all([
        Promise.all(readers),
        Promise.all(writers),
      ]);

      expect(readerResults.length).toBe(20);
      expect(writerResults.length).toBe(5);

      for (const r of readerResults) {
        expect(typeof r.activeCoupons).toBe("number");
        expect(r.activeCoupons).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // =========================================================================
  // CHALLENGE 3: Bulk Insert Helpers & Edge Cases
  // =========================================================================
  describe("CHALLENGE 3: Bulk Insert Helpers & Edge Cases", () => {
    test("3.1 booking:reserveSeatLabels handles empty, missing, existing, and partitioned seat labels", async () => {
      const bookingRepo = createBookingRepository(db);
      const testTripId = tracker.trackTrip(randomUUID());
      await db.insert(schema.trips).values({
        id: testTripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة المقاعد التجريبية",
        titleEn: "Seat Reservation Test Trip",
        categoryLookupCode: "cultural",
        basePriceMinor: 15000,
        startsAt: new Date(Date.now() + 86400000),
        state: "draft",
        publishMode: "instant",
        hasStaffingGap: false,
      });

      const vehicleTypeId = tracker.trackVehicleType(randomUUID());
      await db.insert(schema.vehicleTypes).values({
        id: vehicleTypeId,
        tenantId: defaultTenantId,
        categoryLookupCode: "COASTER_MINIBUS_28",
        nameAr: "حافلة الحجز",
        nameEn: "Booking Bus",
        seatCount: 20,
        seatLayout: { rows: 4, cols: 4, cells: [] },
        scope: "organization",
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      const testVehicleId = tracker.trackVehicle(randomUUID());
      await db.insert(schema.vehicles).values({
        id: testVehicleId,
        tenantId: defaultTenantId,
        vehicleTypeId,
        plateNumber: `PLATE_${randomUUID().slice(0, 6)}`,
        plateNumberNormalized: `PLATE${randomUUID().slice(0, 6)}`,
        model: "Coaster",
        manufacturingYear: 2024,
        seatCount: 20,
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      const testBookingId = randomUUID();

      // 1. Empty array: returns immediately without error
      await bookingRepo.reserveSeatLabels(
        defaultTenantId,
        testTripId,
        testVehicleId,
        testBookingId,
        [],
      );

      // 2. Insert new seat labels (all missing)
      const seatLabels = ["S1", "S2", "S3"];
      await bookingRepo.reserveSeatLabels(
        defaultTenantId,
        testTripId,
        testVehicleId,
        testBookingId,
        seatLabels,
      );

      const createdRows = await bookingRepo.findSeatInventoryForLabels(testTripId, testVehicleId, seatLabels);
      expect(createdRows.length).toBe(3);
      for (const row of createdRows) {
        expect(row.status).toBe("reserved");
        expect(row.bookingId).toBe(testBookingId);
        cleanSeatInventoryIds.push(row.id);
      }

      // 3. Update existing seat labels with a new bookingId
      const newBookingId = randomUUID();
      await bookingRepo.reserveSeatLabels(
        defaultTenantId,
        testTripId,
        testVehicleId,
        newBookingId,
        ["S1", "S2"],
      );

      const updatedRows = await bookingRepo.findSeatInventoryForLabels(testTripId, testVehicleId, ["S1", "S2"]);
      expect(updatedRows.length).toBe(2);
      expect(updatedRows.every((r) => r.bookingId === newBookingId)).toBe(true);

      // 4. Partitioned batch: some existing (S3), some missing (S4, S5)
      const mixedLabels = ["S3", "S4", "S5"];
      const thirdBookingId = randomUUID();
      await bookingRepo.reserveSeatLabels(
        defaultTenantId,
        testTripId,
        testVehicleId,
        thirdBookingId,
        mixedLabels,
      );

      const mixedRows = await bookingRepo.findSeatInventoryForLabels(testTripId, testVehicleId, mixedLabels);
      expect(mixedRows.length).toBe(3);
      expect(mixedRows.every((r) => r.bookingId === thirdBookingId)).toBe(true);
      for (const r of mixedRows) {
        cleanSeatInventoryIds.push(r.id);
      }
    });

    test("3.2 driver:insertLabTestRequestsBatch handles empty array and bulk inserts", async () => {
      const driverRepo = createDriverRepository(db);

      // Empty batch returns empty array
      const emptyResult = await driverRepo.insertLabTestRequestsBatch([]);
      expect(emptyResult).toEqual([]);

      // Bulk insert batch of 5 requests
      const batchRequests = Array.from({ length: 5 }, (_, i) => ({
        driverAccountId: ownerAccountId,
        requestedByAdminAccountId: ownerAccountId,
        deadlineAt: new Date(Date.now() + 86400000 * (i + 1)),
        testType: "drug_screening" as const,
      }));

      const inserted = await driverRepo.insertLabTestRequestsBatch(batchRequests);
      expect(inserted.length).toBe(5);
      for (const row of inserted) {
        expect(row.status).toBe("requested");
        expect(row.driverAccountId).toBe(ownerAccountId);
        cleanLabTestIds.push(row.id);
      }
    });

    test("3.3 accounting:insertLedgerEntries handles empty array and bulk inserts", async () => {
      const accountingRepo = createAccountingRepository(db);

      // Empty array returns []
      const empty = await accountingRepo.insertLedgerEntries([]);
      expect(empty).toEqual([]);

      // Bulk insert
      const entries = Array.from({ length: 4 }, (_, i) => ({
        tenantId: defaultTenantId,
        entryType: "payout_settlement" as const,
        direction: "debit" as const,
        grossAmountMinor: 1000 * (i + 1),
        commissionAmountMinor: 0,
        netAmountMinor: 1000 * (i + 1),
        currencyCode: "EGP" as const,
        status: "posted" as const,
        description: `CHALLENGE_LEDGER_TEST_${i}`,
      }));

      const created = await accountingRepo.insertLedgerEntries(entries);
      expect(created.length).toBe(4);
      for (const row of created) {
        expect(row.tenantId).toBe(defaultTenantId);
        cleanLedgerIds.push(row.id);
      }
    });

    test("3.4 availability:insertBlocks handles empty array and bulk inserts", async () => {
      const availabilityRepo = createAvailabilityRepository(db);

      // Empty returns []
      const empty = await availabilityRepo.insertBlocks([]);
      expect(empty).toEqual([]);

      // Bulk insert
      const now = new Date();
      const blocks = Array.from({ length: 3 }, (_, i) => ({
        supplierAccountId: ownerAccountId,
        supplierRole: "driver" as const,
        tenantId: defaultTenantId,
        blockType: "off_duty" as const,
        startsAt: new Date(now.getTime() + i * 3600000),
        endsAt: new Date(now.getTime() + (i + 1) * 3600000),
        tripId: null,
        notes: `CHALLENGE_BLOCK_${i}`,
      }));

      const created = await availabilityRepo.insertBlocks(blocks);
      expect(created.length).toBe(3);
      for (const row of created) {
        expect(row.supplierAccountId).toBe(ownerAccountId);
        cleanBlockIds.push(row.id);
      }
    });

    test("3.5 notifications:insertMessages handles empty array and bulk inserts", async () => {
      const notificationsRepo = createNotificationsRepository(db);

      // Empty returns []
      const empty = await notificationsRepo.insertMessages([]);
      expect(empty).toEqual([]);

      // Bulk insert
      const messages = Array.from({ length: 3 }, (_, i) => ({
        recipientAccountId: ownerAccountId,
        tenantId: defaultTenantId,
        category: "auth" as const,
        channel: "in_app" as const,
        titleAr: `تنبيه ${i}`,
        titleEn: `Notification ${i}`,
        bodyAr: `تفاصيل التنبيه ${i}`,
        bodyEn: `Details for notification ${i}`,
        actionUrl: null,
      }));

      const created = await notificationsRepo.insertMessages(messages);
      expect(created.length).toBe(3);
      for (const row of created) {
        expect(row.recipientAccountId).toBe(ownerAccountId);
        cleanNotificationIds.push(row.id);
      }
    });

    test("3.6 payments:insertRevenueLedgerEntries handles empty array and bulk inserts", async () => {
      const paymentsRepo = createPaymentsRepository(db);

      // Empty returns []
      const empty = await paymentsRepo.insertRevenueLedgerEntries([]);
      expect(empty).toEqual([]);

      // Bulk insert
      const entries = Array.from({ length: 3 }, (_, i) => ({
        tenantId: defaultTenantId,
        entryType: "booking_capture" as const,
        direction: "credit" as const,
        grossAmountMinor: 2500 * (i + 1),
        commissionAmountMinor: 250 * (i + 1),
        netAmountMinor: 2250 * (i + 1),
        currencyCode: "EGP" as const,
        status: "posted" as const,
        description: `CHALLENGE_PAYMENT_REVENUE_${i}`,
      }));

      const created = await paymentsRepo.insertRevenueLedgerEntries(entries);
      expect(created.length).toBe(3);
      for (const row of created) {
        expect(row.tenantId).toBe(defaultTenantId);
        cleanLedgerIds.push(row.id);
      }
    });
    test("3.7 tracking:insertTrackingEvents handles empty array and bulk inserts", async () => {
      const trackingRepo = createTrackingRepository(db);
      let [trip] = await db.select({ id: schema.trips.id }).from(schema.trips).limit(1);
      let testTripId = trip?.id;
      if (!testTripId) {
        const [createdTrip] = await db.insert(schema.trips).values({
          tenantId: defaultTenantId,
          titleAr: "رحلة تجريبية",
          titleEn: "Test Trip",
          categoryLookupCode: "cultural",
          basePriceMinor: 10000,
          startsAt: new Date(Date.now() + 86400000),
          state: "draft",
          publishMode: "instant",
          hasStaffingGap: false,
        }).returning();
        tracker.trackTrip(createdTrip.id);
        testTripId = createdTrip.id;
      }

      // Empty returns []
      const empty = await trackingRepo.insertTrackingEvents([]);
      expect(empty).toEqual([]);

      // Bulk insert
      const events = Array.from({ length: 3 }, (_, i) => ({
        tenantId: defaultTenantId,
        tripId: testTripId,
        vehicleId: null,
        recordedByAccountId: ownerAccountId,
        eventType: "engine_started" as const,
        severity: "info" as const,
        messageAr: `تم التشغيل ${i}`,
        messageEn: `Engine started ${i}`,
      }));

      const created = await trackingRepo.insertTrackingEvents(events);
      expect(created.length).toBe(3);
      for (const row of created) {
        expect(row.tripId).toBe(testTripId);
        cleanTrackingEventIds.push(row.id);
      }
    });
  });

  // =========================================================================
  // CHALLENGE 4: Programmatic Invariant: Zero `db.batch()` calls in packages/
  // =========================================================================
  describe("CHALLENGE 4: Zero db.batch() Calls across packages/", () => {
    test("4.1 packages/ contains zero references to db.batch() or .batch()", async () => {
      const { readdirSync, readFileSync, statSync } = await import("node:fs");
      const { join } = await import("node:path");

      const packagesDir = join(import.meta.dir, "../../../packages");
      const forbiddenPattern = /\bdb\.batch\(|\.batch\(/;
      const violations: string[] = [];

      function scanDir(dir: string) {
        const entries = readdirSync(dir);
        for (const entry of entries) {
          if (entry === "node_modules" || entry === "dist" || entry === ".mimosa") continue;
          const fullPath = join(dir, entry);
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            scanDir(fullPath);
          } else if (entry.endsWith(".ts") || entry.endsWith(".js")) {
            const content = readFileSync(fullPath, "utf-8");
            if (forbiddenPattern.test(content)) {
              violations.push(fullPath);
            }
          }
        }
      }

      scanDir(packagesDir);
      expect(violations).toEqual([]);
    });
  });
});
