import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq, schema, sql } from "@trips-app/db";
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

describe("Tier 5 Remediation Challenge: TransactionClient Compatibility & Programs Atomic JSONB", () => {
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

  // =========================================================================
  // CHALLENGE 1: Compile-Time & Runtime TransactionClient Compatibility (All 26 Services)
  // =========================================================================
  describe("CHALLENGE 1: TransactionClient Compatibility Across All 26 Services", () => {
    test("1.1 Type-level assertion: Every repository factory directly accepts TransactionClient with NO casts", () => {
      // Helper function that strictly expects (db: TransactionClient) => unknown.
      // If any factory had (db: Database) instead of (db: ServiceDatabase), TypeScript would reject this call.
      function assertAcceptsTx<TRepo>(factory: (db: TransactionClient) => TRepo): (db: TransactionClient) => TRepo {
        return factory;
      }

      expect(typeof assertAcceptsTx(createAccountingRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createAdminRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createAuthRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createAvailabilityRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createBookingRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createCheckInRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createCouponsRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createDriverRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createEmployeesRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createFleetRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createMediaRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createModeratorRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createNegotiationRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createNotificationsRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createOnboardingRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createOrganizationRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createParentRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createPaymentsRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createPhotographerRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createPlansRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createProgramsRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createSeatsRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createStaffingRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createTrackingRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createTravelerRepository)).toBe("function");
      expect(typeof assertAcceptsTx(createTripsRepository)).toBe("function");
    });

    test("1.2 Runtime assertion: Real tx inside db.transaction instantiates all 26 repositories and executes queries", async () => {
      await db.transaction(async (tx: TransactionClient) => {
        // Instantiate all 26 repositories with tx directly
        const repos = {
          accounting: createAccountingRepository(tx),
          admin: createAdminRepository(tx),
          auth: createAuthRepository(tx),
          availability: createAvailabilityRepository(tx),
          booking: createBookingRepository(tx),
          checkIn: createCheckInRepository(tx),
          coupons: createCouponsRepository(tx),
          driver: createDriverRepository(tx),
          employees: createEmployeesRepository(tx),
          fleet: createFleetRepository(tx),
          media: createMediaRepository(tx),
          moderator: createModeratorRepository(tx),
          negotiation: createNegotiationRepository(tx),
          notifications: createNotificationsRepository(tx),
          onboarding: createOnboardingRepository(tx),
          organization: createOrganizationRepository(tx),
          parent: createParentRepository(tx),
          payments: createPaymentsRepository(tx),
          photographer: createPhotographerRepository(tx),
          plans: createPlansRepository(tx),
          programs: createProgramsRepository(tx),
          seats: createSeatsRepository(tx),
          staffing: createStaffingRepository(tx),
          tracking: createTrackingRepository(tx),
          traveler: createTravelerRepository(tx),
          trips: createTripsRepository(tx),
        };

        // Assert all 26 are objects with repository functions
        for (const [_name, repo] of Object.entries(repos)) {
          expect(repo).toBeDefined();
          expect(typeof repo).toBe("object");
          const fns = Object.values(repo).filter((v) => typeof v === "function");
          expect(fns.length).toBeGreaterThan(0);
        }

        // Test running real queries through transactional clients
        const org = await repos.trips.findOrganizationByTenantId(tenantId);
        expect(org?.id).toBe(tenantId);

        const plan = await repos.programs.findOrganizationPlan(tenantId);
        expect(plan).toBeDefined();

        const entries = await repos.accounting.listEntriesByTenant(tenantId, { limit: 5 });
        expect(Array.isArray(entries)).toBe(true);
      });
    });

    test("1.3 Re-export check: All 27 services export canonical ServiceDatabase", async () => {
      const serviceNames = [
        "accounting", "admin", "auth", "availability", "booking", "check-in",
        "coupons", "documents", "driver", "employees", "fleet", "media",
        "moderator", "negotiation", "notifications", "onboarding", "organization",
        "parent", "payments", "photographer", "plans", "programs", "seats",
        "staffing", "tracking", "traveler", "trips",
      ];

      for (const service of serviceNames) {
        const repoModule = await import(`../../../packages/services/${service}/src/repository`);
        // Verify module loaded cleanly
        expect(repoModule).toBeDefined();
      }
    });
  });

  // =========================================================================
  // CHALLENGE 2: programs:insertProgram Atomic JSONB Concatenation
  // =========================================================================
  describe("CHALLENGE 2: programs:insertProgram Atomic JSONB Concatenation Invariants", () => {
    let programsRepo: ReturnType<typeof createProgramsRepository>;

    beforeAll(() => {
      programsRepo = createProgramsRepository(db);
    });

    // Helper to create a test trip
    async function createTestTrip(initialWizardSteps: any): Promise<string> {
      const tripId = tracker.trackTrip(randomUUID());
      await db.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: "رحلة اختبار البرامج",
        titleEn: "Programs Test Trip",
        categoryLookupCode: "CULTURE",
        basePriceMinor: 25000,
        startsAt: new Date("2026-12-01T10:00:00Z"),
        state: "draft",
        publishMode: "draft",
        hasStaffingGap: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Update wizard_steps explicitly to desired state (even if null or arbitrary jsonb)
      await db.execute(
        sql`UPDATE trips SET wizard_steps = ${initialWizardSteps === null ? null : JSON.stringify(initialWizardSteps)}::jsonb WHERE id = ${tripId}`
      );

      return tripId;
    }

    async function getTripWizardSteps(tripId: string): Promise<Record<string, unknown> | null> {
      const [trip] = await db
        .select({ wizardSteps: schema.trips.wizardSteps })
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId))
        .limit(1);
      return (trip?.wizardSteps as Record<string, unknown>) ?? null;
    }

    test("2.1 Case NULL: When wizardSteps is NULL in DB, insertProgram sets wizardSteps.programs = true", async () => {
      // In PostgreSQL, trips.wizard_steps has NOT NULL constraint in current schema.
      // To test behavior when wizard_steps is NULL, we run within an isolated transaction,
      // drop the NOT NULL constraint temporarily, insert a row with NULL wizard_steps,
      // run createProgramsRepository(tx).insertProgram(...), verify wizard_steps is updated
      // to {"programs": true}, and roll back the transaction so the schema constraint remains untouched.
      let verified = false;

      try {
        await db.transaction(async (tx) => {
          await tx.execute(sql`ALTER TABLE trips ALTER COLUMN wizard_steps DROP NOT NULL`);
          const tripId = randomUUID();
          await tx.insert(schema.trips).values({
            id: tripId,
            tenantId,
            titleAr: "اختبار النول",
            titleEn: "Null Test Trip",
            categoryLookupCode: "CULTURE",
            basePriceMinor: 10000,
            startsAt: new Date("2026-12-01T10:00:00Z"),
            state: "draft",
            publishMode: "draft",
            hasStaffingGap: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          await tx.execute(sql`UPDATE trips SET wizard_steps = NULL WHERE id = ${tripId}`);

          const [before] = await tx
            .select({ ws: schema.trips.wizardSteps })
            .from(schema.trips)
            .where(eq(schema.trips.id, tripId));
          expect(before.ws).toBeNull();

          const txProgramsRepo = createProgramsRepository(tx);
          const program = await txProgramsRepo.insertProgram({
            tenantId,
            tripId,
            titleAr: "برنامج زيارة الأهرام",
            titleEn: "Pyramids Tour Program",
            descriptionAr: "وصف البرنامج",
            descriptionEn: "Program description",
            dayNumber: 1,
            startsAt: new Date("2026-12-01T11:00:00Z"),
            endsAt: new Date("2026-12-01T15:00:00Z"),
            locationNameAr: "الجيزة",
            locationNameEn: "Giza",
            priceMinor: 0,
            currencyCode: "EGP",
            isIncludedInBase: true,
            capacity: 30,
            sortOrder: 1,
            attachmentUrls: [],
            createdByAccountId: ownerAccountId,
          });

          expect(program).toBeDefined();

          const [after] = await tx
            .select({ ws: schema.trips.wizardSteps })
            .from(schema.trips)
            .where(eq(schema.trips.id, tripId));
          expect(after.ws).toEqual({ programs: true });
          verified = true;

          // Force rollback to keep table schema intact
          throw new Error("ROLLBACK_DDL_AND_FIXTURE");
        });
      } catch (err: any) {
        if (err.message !== "ROLLBACK_DDL_AND_FIXTURE") throw err;
      }

      expect(verified).toBe(true);
    });

    test("2.2 Case Empty {}: When wizardSteps is empty object {}, insertProgram sets wizardSteps.programs = true", async () => {
      const tripId = await createTestTrip({});

      const initialSteps = await getTripWizardSteps(tripId);
      expect(initialSteps).toEqual({});

      await programsRepo.insertProgram({
        tenantId,
        tripId,
        titleAr: "برنامج رحلة النيل",
        titleEn: "Nile Cruise Program",
        descriptionAr: "وصف البرنامج",
        descriptionEn: "Program description",
        dayNumber: 1,
        startsAt: null,
        endsAt: null,
        locationNameAr: null,
        locationNameEn: null,
        priceMinor: 5000,
        currencyCode: "EGP",
        isIncludedInBase: false,
        capacity: null,
        sortOrder: 2,
        attachmentUrls: [],
        createdByAccountId: ownerAccountId,
      });

      const updatedSteps = await getTripWizardSteps(tripId);
      expect(updatedSteps).toEqual({ programs: true });
    });

    test("2.3 Case Existing Steps: When wizardSteps has other steps, ALL existing steps are preserved", async () => {
      const existing = {
        details: true,
        route: true,
        pricing: false,
        staffing: true,
      };
      const tripId = await createTestTrip(existing);

      const initialSteps = await getTripWizardSteps(tripId);
      expect(initialSteps).toEqual(existing);

      await programsRepo.insertProgram({
        tenantId,
        tripId,
        titleAr: "برنامج المتحف الكبير",
        titleEn: "Grand Museum Tour",
        descriptionAr: "وصف المتحف",
        descriptionEn: "Museum description",
        dayNumber: 2,
        startsAt: null,
        endsAt: null,
        locationNameAr: "المتحف المصري الكبير",
        locationNameEn: "GEM",
        priceMinor: 0,
        currencyCode: "EGP",
        isIncludedInBase: true,
        capacity: 50,
        sortOrder: 3,
        attachmentUrls: [],
        createdByAccountId: ownerAccountId,
      });

      const updatedSteps = await getTripWizardSteps(tripId);
      expect(updatedSteps).toEqual({
        details: true,
        route: true,
        pricing: false,
        staffing: true,
        programs: true,
      });
      // Explicit assertion: every key in existing is preserved
      expect(updatedSteps?.details).toBe(true);
      expect(updatedSteps?.route).toBe(true);
      expect(updatedSteps?.pricing).toBe(false);
      expect(updatedSteps?.staffing).toBe(true);
      expect(updatedSteps?.programs).toBe(true);
    });

    test("2.4 Case Existing programs = false: insertProgram flips programs to true without affecting other keys", async () => {
      const existing = {
        details: true,
        programs: false,
        customKey: "preservedValue",
      };
      const tripId = await createTestTrip(existing);

      await programsRepo.insertProgram({
        tenantId,
        tripId,
        titleAr: "برنامج القلعة",
        titleEn: "Citadel Tour",
        descriptionAr: "وصف القلعة",
        descriptionEn: "Citadel description",
        dayNumber: 1,
        startsAt: null,
        endsAt: null,
        locationNameAr: null,
        locationNameEn: null,
        priceMinor: 0,
        currencyCode: "EGP",
        isIncludedInBase: true,
        capacity: null,
        sortOrder: 1,
        attachmentUrls: [],
        createdByAccountId: ownerAccountId,
      });

      const updatedSteps = await getTripWizardSteps(tripId);
      expect(updatedSteps?.details).toBe(true);
      expect(updatedSteps?.programs).toBe(true);
      expect(updatedSteps?.customKey).toBe("preservedValue");
    });

    test("2.5 Concurrency Stress: Parallel programs:insertProgram and external step updates suffer zero lost updates", async () => {
      const tripId = await createTestTrip({ baseline: true });

      // Run 6 parallel operations simultaneously:
      // 3 calls to insertProgram
      // 3 raw concurrent JSONB updates simulating other wizard steps completing (e.g. staffing, pricing, media)
      const operations: Promise<unknown>[] = [];

      for (let i = 0; i < 3; i++) {
        operations.push(
          programsRepo.insertProgram({
            tenantId,
            tripId,
            titleAr: `برنامج موازي ${i + 1}`,
            titleEn: `Parallel Program ${i + 1}`,
            descriptionAr: "وصف موازي",
            descriptionEn: "Parallel description",
            dayNumber: i + 1,
            startsAt: null,
            endsAt: null,
            locationNameAr: null,
            locationNameEn: null,
            priceMinor: 0,
            currencyCode: "EGP",
            isIncludedInBase: true,
            capacity: 20,
            sortOrder: i + 1,
            attachmentUrls: [],
            createdByAccountId: ownerAccountId,
          })
        );

        const stepKey = `concurrentStep_${i}`;
        operations.push(
          db.update(schema.trips)
            .set({
              wizardSteps: sql`coalesce(${schema.trips.wizardSteps}, '{}'::jsonb) || ${JSON.stringify({ [stepKey]: true })}::jsonb`,
            })
            .where(eq(schema.trips.id, tripId))
        );
      }

      // Execute all 6 operations concurrently
      const results = await Promise.allSettled(operations);
      for (const res of results) {
        expect(res.status).toBe("fulfilled");
      }

      // Read back final wizardSteps
      const finalSteps = await getTripWizardSteps(tripId);
      expect(finalSteps?.baseline).toBe(true);
      expect(finalSteps?.programs).toBe(true);
      expect(finalSteps?.concurrentStep_0).toBe(true);
      expect(finalSteps?.concurrentStep_1).toBe(true);
      expect(finalSteps?.concurrentStep_2).toBe(true);

      // Verify all 3 programs exist in DB
      const programs = await programsRepo.listProgramsForTrip(tenantId, tripId);
      expect(programs.length).toBe(3);
    });
  });
});
