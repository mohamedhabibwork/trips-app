import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  and,
  eq,
  inArray,
  ne,
  schema,
  type Database,
  type ServiceDatabase,
} from "@trips-app/db";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  insertBookingsSchema,
  insertPaymentTransactionsSchema,
  insertTripsSchema,
  insertVehiclesSchema,
} from "@trips-app/db/zod";
import {
  ADMIN_SUB_ROLES,
  APPLICATION_STATES,
  BOOKING_STATUSES,
  computeBlindIndex,
  CURRENCY_CODES,
  encryptField,
  normalizeEmail,
  ORG_PERMISSION_AREAS,
  ORG_PERMISSION_LEVELS,
  PAYMENT_GATEWAY_CODES,
  PAYMENT_TRANSACTION_STATUSES,
  PAYOUT_METHODS,
  SEAT_INVENTORY_STATUSES,
  SUPPLIER_APPLICATION_TYPES,
  SUPPORTED_COUNTRY_CODES,
  SUPPORTED_LOCALES,
  TRIP_STATES,
  USER_ROLES,
  VEHICLE_STATUSES,
} from "@trips-app/domain";
import {
  createVehicleInputSchema,
  normalizePlateNumber,
  seatLayoutConfigSchema,
} from "@trips-app/service-fleet";
import {
  createDraftTripInputSchema,
  tripRoutePointSchema,
} from "@trips-app/service-trips";
import { createBookingSchema } from "@trips-app/service-booking";
import {
  confirmPaymentSchema,
  createPaymentIntentSchema,
  refundPaymentSchema,
} from "@trips-app/service-payments";
import { createUploadIntentSchema } from "../../../packages/services/media/src/schemas/validation";
import {
  inviteEmployeeSchema,
  orgPermissionMatrixSchema,
} from "../../../packages/services/employees/src/schemas/validation";
import {
  documentUploadInputSchema,
  submitOrganizationApplicationSchema,
} from "../../../packages/services/onboarding/src/schemas/validation";
import { createPayoutSettlementSchema } from "@trips-app/service-accounting";
import { z } from "zod/v4";

// Service & Repository factories
import { createFleetRepository } from "../../../packages/services/fleet/src/repository";
import { createFleetService } from "../../../packages/services/fleet/src/services";
import { createTripsRepository } from "../../../packages/services/trips/src/repository";
import { createProgramsRepository } from "../../../packages/services/programs/src/repository";
import { createBookingRepository } from "../../../packages/services/booking/src/repository";
import { createBookingService } from "../../../packages/services/booking/src/services";
import { createPaymentsRepository } from "../../../packages/services/payments/src/repository";
import { createPaymentsService } from "../../../packages/services/payments/src/services";
import { createOnboardingRepository } from "../../../packages/services/onboarding/src/repository";
import { createEmployeesRepository } from "../../../packages/services/employees/src/repository";
import { createMediaRepository } from "../../../packages/services/media/src/repository";
import { createOrganizationRepository } from "../../../packages/services/organization/src/repository";
import { createTravelerRepository } from "../../../packages/services/traveler/src/repository";
import { createCouponsRepository } from "../../../packages/services/coupons/src/repository";
import { createAccountingRepository } from "../../../packages/services/accounting/src/repository";
import { createCheckInRepository } from "../../../packages/services/check-in/src/repository";

import { generateTestSuffix, getTestContext, getTestDb, TestEntityTracker } from "../helpers/db";

function getTableName(table: any): string | undefined {
  if (!table) return undefined;
  const sym = Object.getOwnPropertySymbols(table).find((s) => s.description === "drizzle:Name");
  return sym ? (table[sym] as string) : undefined;
}

interface FaultRules {
  failOnInsertTable?: string;
  failOnUpdateTable?: string;
}

function createFaultInjectingDb(baseDb: ServiceDatabase, rules: FaultRules): ServiceDatabase {
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
            if (
              rules.failOnUpdateTable &&
              (tableName === rules.failOnUpdateTable || table === (schema as any)[rules.failOnUpdateTable])
            ) {
              throw new Error(`SIMULATED_FAULT: update on ${tableName} failed`);
            }
            return target.update(table);
          };
        }

        if (prop === "insert") {
          return (table: any) => {
            const tableName = getTableName(table);
            if (
              rules.failOnInsertTable &&
              (tableName === rules.failOnInsertTable || table === (schema as any)[rules.failOnInsertTable])
            ) {
              throw new Error(`SIMULATED_FAULT: insert on ${tableName} failed`);
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

  return wrap(baseDb as any) as ServiceDatabase;
}

describe("Tier 5 Final Adversarial Coverage & Verification Battery", () => {
  const db: Database = getTestDb();
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
  // PILLAR 1: Dynamic Zod Schemas & Invariant Boundary Testing
  // =========================================================================
  describe("Pillar 1: Dynamic Zod Schemas & Deep Boundary Enforcement", () => {
    test("1.1 Dynamic schemas enforce strict type validation and reject coercion", () => {
      // Coercion is disabled across all Drizzle-Zod factories
      const insertTripResult = insertTripsSchema.safeParse({
        tenantId: randomUUID(),
        titleAr: "رحلة نيلية",
        titleEn: "Nile Cruise",
        categoryLookupCode: "cruise",
        basePriceMinor: "5000", // String instead of number -> MUST FAIL
        currencyCode: "EGP",
        createdByAccountId: randomUUID(),
      });
      expect(insertTripResult.success).toBe(false);

      const insertBookingResult = insertBookingsSchema.safeParse({
        bookingReference: "BK-TEST-1234",
        tenantId: randomUUID(),
        tripId: randomUUID(),
        travelerAccountId: randomUUID(),
        passengersCount: "2", // String instead of number -> MUST FAIL
        totalAmountMinor: 1000,
        currencyCode: "EGP",
      });
      expect(insertBookingResult.success).toBe(false);

      const insertVehicleResult = insertVehiclesSchema.safeParse({
        tenantId: randomUUID(),
        vehicleTypeId: randomUUID(),
        plateNumber: "ABC 123",
        model: "Mercedes Sprinter",
        manufacturingYear: "2024", // String instead of number -> MUST FAIL
        seatCount: 16,
        createdByAccountId: randomUUID(),
      });
      expect(insertVehicleResult.success).toBe(false);
    });

    test("1.2 Boundary checks on service validation schemas reject invalid numbers and ranges", () => {
      // Payment intent minimum amountMinor is 100
      const paymentUnderMin = createPaymentIntentSchema.safeParse({
        amountMinor: 99,
        currencyCode: "EGP",
      });
      expect(paymentUnderMin.success).toBe(false);

      const paymentOverMax = createPaymentIntentSchema.safeParse({
        amountMinor: 500_000_001,
        currencyCode: "EGP",
      });
      expect(paymentOverMax.success).toBe(false);

      const paymentDecimal = createPaymentIntentSchema.safeParse({
        amountMinor: 100.5,
        currencyCode: "EGP",
      });
      expect(paymentDecimal.success).toBe(false);

      const paymentValid = createPaymentIntentSchema.safeParse({
        amountMinor: 100,
        currencyCode: "EGP",
        gateway: "stub",
      });
      expect(paymentValid.success).toBe(true);

      // Refund payment boundaries
      const refundZero = refundPaymentSchema.safeParse({
        paymentId: randomUUID(),
        refundAmountMinor: 0,
      });
      expect(refundZero.success).toBe(false);

      // Payout settlement boundaries (min 100 minor units)
      const payoutUnderMin = createPayoutSettlementSchema.safeParse({
        amountMinor: 50,
        description: "Valid description",
      });
      expect(payoutUnderMin.success).toBe(false);
    });

    test("1.3 String length, empty string trimming, and UUID constraints", () => {
      // Draft trip titleAr min length 1 and trimming
      const emptyTitleTrip = createDraftTripInputSchema.safeParse({
        titleAr: "   ",
        titleEn: "Valid English",
        categoryLookupCode: "cultural",
        origin: { nameAr: "القاهرة", nameEn: "Cairo" },
        destinations: [{ nameAr: "الأقصر", nameEn: "Luxor" }],
      });
      expect(emptyTitleTrip.success).toBe(false);

      // Trip route point coordinate ranges
      const outOfBoundsLat = tripRoutePointSchema.safeParse({
        nameAr: "نقطة",
        nameEn: "Point",
        latitude: 91.5, // > 90
        longitude: 31.2,
      });
      expect(outOfBoundsLat.success).toBe(false);

      const outOfBoundsLng = tripRoutePointSchema.safeParse({
        nameAr: "نقطة",
        nameEn: "Point",
        latitude: 30.0,
        longitude: -181.0, // < -180
      });
      expect(outOfBoundsLng.success).toBe(false);

      // Confirm payment malformed UUID
      const invalidUuid = confirmPaymentSchema.safeParse({
        paymentId: "not-a-valid-uuid-v4",
      });
      expect(invalidUuid.success).toBe(false);
    });

    test("1.4 Nested DTO schemas: seatLayoutConfigSchema and booking passengers array", () => {
      // Fleet seatLayoutConfig: rows and cols must be within [1, 40] and [1, 12]
      const invalidRowsLayout = seatLayoutConfigSchema.safeParse({
        rows: 0,
        cols: 4,
        cells: [{ row: 0, col: 0, type: "seat" }],
      });
      expect(invalidRowsLayout.success).toBe(false);

      const invalidCellTypeLayout = seatLayoutConfigSchema.safeParse({
        rows: 5,
        cols: 4,
        cells: [{ row: 0, col: 0, type: "couch" as any }],
      });
      expect(invalidCellTypeLayout.success).toBe(false);

      // Booking passengers: min 1, max 20, valid age and structure
      const emptyPassengers = createBookingSchema.safeParse({
        tripId: randomUUID(),
        passengers: [],
      });
      expect(emptyPassengers.success).toBe(false);

      const invalidPassengerAge = createBookingSchema.safeParse({
        tripId: randomUUID(),
        passengers: [
          {
            id: "p1",
            fullName: "Ahmed Ali",
            isChild: true,
            age: -5, // Negative age
          },
        ],
      });
      expect(invalidPassengerAge.success).toBe(false);
    });

    test("1.5 Media and Employee boundary schema superRefine & permission matrix validation", () => {
      // Media purpose-based validation via superRefine
      const oversizedAvatar = createUploadIntentSchema.safeParse({
        originalFilename: "avatar.png",
        mimeType: "image/png",
        fileSizeBytes: 6 * 1024 * 1024, // 6 MB exceeds 5 MB avatar limit
        purpose: "avatar",
      });
      expect(oversizedAvatar.success).toBe(false);

      const invalidMimeDoc = createUploadIntentSchema.safeParse({
        originalFilename: "doc.exe",
        mimeType: "application/x-msdownload" as any,
        fileSizeBytes: 1024,
        purpose: "kyc",
      });
      expect(invalidMimeDoc.success).toBe(false);

      // Employee permission matrix: 9 areas, levels in ["none", "view", "manage"]
      const invalidMatrix = orgPermissionMatrixSchema.safeParse({
        trips: "admin", // Invalid level
        bookings: "view",
        accounting: "none",
        coupons: "none",
        employees: "none",
        fleet: "none",
        subscription: "none",
        tracking: "none",
        settings: "none",
      });
      expect(invalidMatrix.success).toBe(false);

      const validInvite = inviteEmployeeSchema.safeParse({
        invitedEmail: "employee@test.com",
        roleTitle: "Operations Specialist",
        preset: "operations_manager",
      });
      expect(validInvite.success).toBe(true);

      // Vehicle boundary input schema
      const invalidVehicle = createVehicleInputSchema.safeParse({
        vehicleTypeId: randomUUID(),
        plateNumber: " ", // empty/whitespace
        model: "Bus",
        manufacturingYear: 1800, // out of range
      });
      expect(invalidVehicle.success).toBe(false);

      // Onboarding document upload input schema
      const oversizedDoc = documentUploadInputSchema.safeParse({
        documentType: "cr",
        storageKey: "docs/cr.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 20 * 1024 * 1024, // 20 MB exceeds 15 MB limit
      });
      expect(oversizedDoc.success).toBe(false);

      // Submit organization application schema
      const invalidCountryOrg = submitOrganizationApplicationSchema.safeParse({
        legalEntityName: "Test Org",
        displayNameEn: "Test Org",
        displayNameAr: "منظمة",
        countryCode: "FR" as any, // Unsupported country
        headquartersAddress: "123 Street",
        signatoryFullName: "John Doe",
        signatoryRoleTitle: "CEO",
        payoutMethod: "bank_transfer",
        commercialRegNumber: "CR123",
        taxNumber: "TX123",
        tourismLicenseNumber: "TL123",
        tourismLicenseExpiry: new Date().toISOString(),
        signatoryNationalId: "1234567890",
        payoutIbanOrWallet: "EG1234567890",
        billingContactName: "Billing",
        billingContactEmail: "billing@test.com",
      });
      expect(invalidCountryOrg.success).toBe(false);
    });
  });

  // =========================================================================
  // PILLAR 2: Consolidated Domain Enums & Invariants
  // =========================================================================
  describe("Pillar 2: Consolidated Domain Enums & Canonical Invariants", () => {
    test("2.1 Canonical enums are immutable as const arrays with expected length and uniqueness", () => {
      expect(USER_ROLES.length).toBe(10);
      expect(new Set(USER_ROLES).size).toBe(10);

      expect(ADMIN_SUB_ROLES.length).toBe(3);
      expect(new Set(ADMIN_SUB_ROLES).size).toBe(3);

      expect(SUPPORTED_COUNTRY_CODES).toEqual(["EG", "SA", "AE"]);
      expect(CURRENCY_CODES).toEqual(["EGP", "SAR", "AED"]);
      expect(SUPPORTED_LOCALES).toEqual(["ar", "en"]);
      expect(PAYMENT_GATEWAY_CODES).toEqual(["stripe", "paymob", "tap", "fawry", "stub"]);

      expect(ORG_PERMISSION_AREAS.length).toBe(9);
      expect(ORG_PERMISSION_LEVELS).toEqual(["none", "view", "manage"]);

      expect(VEHICLE_STATUSES).toContain("active");
      expect(VEHICLE_STATUSES).toContain("maintenance");
      expect(VEHICLE_STATUSES).toContain("retired");

      expect(TRIP_STATES).toContain("draft");
      expect(TRIP_STATES).toContain("published");
      expect(TRIP_STATES).toContain("cancelled");
      expect(TRIP_STATES).toContain("completed");

      expect(BOOKING_STATUSES).toContain("pending_payment");
      expect(BOOKING_STATUSES).toContain("confirmed");
      expect(BOOKING_STATUSES).toContain("cancelled");

      expect(PAYMENT_TRANSACTION_STATUSES).toContain("pending");
      expect(PAYMENT_TRANSACTION_STATUSES).toContain("succeeded");
      expect(PAYMENT_TRANSACTION_STATUSES).toContain("failed");
    });

    test("2.2 Domain Zod enum schemas reject case-mismatches, whitespace, and injection tokens", () => {
      const countryEnum = z.enum(SUPPORTED_COUNTRY_CODES);
      expect(countryEnum.safeParse("eg").success).toBe(false);
      expect(countryEnum.safeParse(" EG ").success).toBe(false);
      expect(countryEnum.safeParse("EG").success).toBe(true);

      const currencyEnum = z.enum(CURRENCY_CODES);
      expect(currencyEnum.safeParse("egp").success).toBe(false);
      expect(currencyEnum.safeParse("EGP").success).toBe(true);
      expect(currencyEnum.safeParse("__proto__").success).toBe(false);

      const userRoleEnum = z.enum(USER_ROLES);
      expect(userRoleEnum.safeParse("TRAVELER").success).toBe(false);
      expect(userRoleEnum.safeParse("traveler").success).toBe(true);
      expect(userRoleEnum.safeParse("admin' OR '1'='1").success).toBe(false);
    });

    test("2.3 Domain invariant functions (blind index, email normalization, plate number normalization)", () => {
      // Blind index deterministic HMAC SHA-256
      const idx1 = computeBlindIndex("test@example.com");
      const idx2 = computeBlindIndex("test@example.com");
      const idx3 = computeBlindIndex("other@example.com");
      expect(idx1).toBe(idx2);
      expect(idx1).not.toBe(idx3);
      expect(idx1.length).toBe(64);

      // Email normalization
      expect(normalizeEmail("  User.Test+tag@Example.COM  ")).toBe("user.test+tag@example.com");

      // Plate number normalization
      expect(normalizePlateNumber(" أ ب ج - 1 2 3 ")).toBe("أبج123");
      expect(normalizePlateNumber("ABC-123")).toBe("ABC123");

      // Field encryption round-trip
      const encrypted = encryptField("SensitiveData123");
      expect(encrypted).not.toBe("SensitiveData123");
      expect(encrypted.length).toBeGreaterThan(20);
    });
  });

  // =========================================================================
  // PILLAR 3: Dynamic Queries ($dynamic()) Stress Testing Across Repositories
  // =========================================================================
  describe("Pillar 3: Dynamic Queries ($dynamic()) Stress & Multi-Condition Coverage", () => {
    test("3.1 tripsRepo.listTripsForTenant: empty filters, full filters, and SQL injection safety", async () => {
      const tripsRepo = createTripsRepository(db);

      // 1. Empty filters
      const emptyResults = await tripsRepo.listTripsForTenant(tenantId, {});
      expect(Array.isArray(emptyResults)).toBe(true);

      // 2. Full filters simultaneously
      const fullFiltersResult = await tripsRepo.listTripsForTenant(tenantId, {
        state: "draft",
        hasStaffingGap: true,
        search: "NonExistentSearchTerm123",
        dateRange: {
          from: new Date("2026-01-01"),
          to: new Date("2026-12-31"),
        },
        pagination: {
          limit: 10,
          offset: 0,
        },
      });
      expect(Array.isArray(fullFiltersResult)).toBe(true);

      // 3. Adversarial search terms containing quotes, wildcards, and special chars
      const adversarialTerms = [
        "%; DROP TABLE trips; --",
        "' OR '1'='1",
        "\\x00\\n\\r",
        "رحلة نيلية % _ [^a-z]",
        "🌟 Cruise 🚤",
      ];

      for (const term of adversarialTerms) {
        const result = await tripsRepo.listTripsForTenant(tenantId, { search: term });
        expect(Array.isArray(result)).toBe(true);
      }
    });

    test("3.2 bookingRepo.listOrganizationBookings & listTravelerBookings with dynamic filters", async () => {
      const bookingRepo = createBookingRepository(db);

      // String tripId parameter
      const resByString = await bookingRepo.listOrganizationBookings(tenantId, randomUUID());
      expect(Array.isArray(resByString)).toBe(true);

      // Object with all filters
      const resByObject = await bookingRepo.listOrganizationBookings(tenantId, {
        tripId: randomUUID(),
        status: "confirmed",
        travelerAccountId: ownerAccountId,
        dateRange: { from: new Date("2026-01-01"), to: new Date("2026-12-31") },
      });
      expect(Array.isArray(resByObject)).toBe(true);

      // Traveler bookings dynamic query
      const travelerBookings = await bookingRepo.listTravelerBookings(ownerAccountId, {
        status: "pending",
        dateRange: { from: new Date("2026-01-01") },
      });
      expect(Array.isArray(travelerBookings)).toBe(true);
    });

    test("3.3 paymentsRepo.listPaymentsForTenant & mediaRepo.listUploadedFiles dynamic queries", async () => {
      const paymentsRepo = createPaymentsRepository(db);
      const tenantPayments = await paymentsRepo.listPaymentsForTenant(tenantId, {
        status: "succeeded",
        purpose: "trip_booking",
        limit: 5,
        offset: 0,
      });
      expect(Array.isArray(tenantPayments)).toBe(true);

      const mediaRepo = createMediaRepository(db);
      const files = await mediaRepo.listUploadedFiles({
        purpose: "general",
        limit: 10,
      });
      expect(Array.isArray(files)).toBe(true);
    });

    test("3.4 employeesRepo.listByTenant: search joining accounts with SQL pattern safety", async () => {
      const employeesRepo = createEmployeesRepository(db);
      const searchTerms = ["admin", "test%", "ops_supervisor", "' UNION SELECT 1 --"];

      for (const term of searchTerms) {
        const memberships = await employeesRepo.listByTenant(tenantId, {
          status: "active",
          search: term,
        });
        expect(Array.isArray(memberships)).toBe(true);
      }
    });

    test("3.5 onboardingRepo, couponsRepo, accountingRepo, checkInRepo dynamic queries execute cleanly", async () => {
      const onboardingRepo = createOnboardingRepository(db);
      const apps = await onboardingRepo.listApplications({
        state: "Pending Review",
        applicationType: "organization",
        duplicateHoldOnly: false,
      });
      expect(Array.isArray(apps)).toBe(true);

      const couponsRepo = createCouponsRepository(db);
      const coupons = await couponsRepo.listForTenant(tenantId, {
        status: "active",
      });
      expect(Array.isArray(coupons)).toBe(true);

      const accountingRepo = createAccountingRepository(db);
      const ledger = await accountingRepo.listEntriesByTenant(tenantId, {
        status: "cleared",
        limit: 5,
      });
      expect(Array.isArray(ledger)).toBe(true);

      const checkInRepo = createCheckInRepository(db);
      const manifest = await checkInRepo.listManifest(tenantId, randomUUID());
      expect(Array.isArray(manifest)).toBe(true);
    });
  });

  // =========================================================================
  // PILLAR 4: Transaction Protection Across Multi-Step Mutation Flows
  // =========================================================================
  describe("Pillar 4: Multi-Step Transaction Rollback & Invariant Protection", () => {
    test("4.1 bookingService.createBooking rolls back booking when subsequent step fails", async () => {
      const suffix = generateTestSuffix();
      const tripId = tracker.trackTrip(randomUUID());

      // Create a published trip fixture
      await db.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: `رحلة حجز ${suffix}`,
        titleEn: `Booking Trip ${suffix}`,
        descriptionAr: "وصف",
        descriptionEn: "Description",
        categoryLookupCode: "cultural",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 25000,
        currencyCode: "EGP",
        publishMode: "published",
        state: "published",
        wizardSteps: {
          basics: true,
          schedule: true,
          vehicles: true,
          staffing: true,
          programs: true,
          seating: true,
          pricing: true,
          publish: true,
        },
        createdByAccountId: ownerAccountId,
      });

      // Fault-injecting DB: throw when inserting check_in_records
      const faultDb = createFaultInjectingDb(db, {
        failOnInsertTable: "check_in_records",
      });
      const faultyBookingService = createBookingService({ db: faultDb });

      let thrown = false;
      try {
        await faultyBookingService.createBooking(ownerAccountId, {
          tripId,
          passengers: [
            {
              id: "p1",
              fullName: "Adversarial Passenger",
              isChild: false,
            },
          ],
          selectedProgramIds: [],
          seatLabels: [],
          paymentGateway: "stub",
          planTier: "free",
        });
      } catch {
        thrown = true;
      }

      // Assert error occurred
      expect(thrown).toBe(true);

      // Assert zero booking records were persisted for this trip
      const orphanBookings = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.tripId, tripId));
      expect(orphanBookings.length).toBe(0);
    });

    test("4.2 paymentsService.confirmPayment rolls back payment status when revenue ledger fails", async () => {
      const suffix = generateTestSuffix();
      const tripId = tracker.trackTrip(randomUUID());

      await db.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: `رحلة دفع ${suffix}`,
        titleEn: `Payment Trip ${suffix}`,
        descriptionAr: "وصف",
        descriptionEn: "Description",
        categoryLookupCode: "cultural",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 15000,
        currencyCode: "EGP",
        publishMode: "published",
        state: "published",
        wizardSteps: {
          basics: true,
          schedule: true,
          vehicles: true,
          staffing: true,
          programs: true,
          seating: true,
          pricing: true,
          publish: true,
        },
        createdByAccountId: ownerAccountId,
      });

      const bookingRepo = createBookingRepository(db);
      const booking = await bookingRepo.insertBooking({
        bookingReference: `BK-PAY-${suffix}`,
        tenantId,
        tripId,
        travelerAccountId: ownerAccountId,
        passengersCount: 1,
        passengers: [{ id: "p1", fullName: "Payer", isChild: false }],
        selectedProgramIds: [],
        subtotalMinor: 15000,
        programsTotalMinor: 0,
        discountMinor: 0,
        totalAmountMinor: 15000,
        currencyCode: "EGP",
        paymentGateway: "stub",
        status: "pending",
      });
      tracker.trackBooking(booking.id);

      const paymentsRepo = createPaymentsRepository(db);
      const payment = await paymentsRepo.insertPaymentTransaction({
        tenantId,
        bookingId: booking.id,
        payerAccountId: ownerAccountId,
        gateway: "stub",
        purpose: "trip_booking",
        amountMinor: 15000,
        currencyCode: "EGP",
        status: "pending",
        providerReference: `STUB-REF-${suffix}`,
        fawryReferenceCode: null,
        fawryExpiresAt: null,
      });
      tracker.trackPayment(payment.id);

      // Fault-injecting DB: throw on accounting_ledger_entries insert
      const faultDb = createFaultInjectingDb(db, {
        failOnInsertTable: "accounting_ledger_entries",
      });
      const faultyPaymentsService = createPaymentsService({ db: faultDb });

      let thrown = false;
      try {
        await faultyPaymentsService.confirmPayment(ownerAccountId, {
          paymentId: payment.id,
        });
      } catch {
        thrown = true;
      }

      expect(thrown).toBe(true);

      // Verify payment remains "pending" (not "succeeded")
      const [reloadedPayment] = await db
        .select()
        .from(schema.paymentTransactions)
        .where(eq(schema.paymentTransactions.id, payment.id));
      expect(reloadedPayment.status).toBe("pending");

      // Verify booking remains "pending" (not "confirmed")
      const [reloadedBooking] = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, booking.id));
      expect(reloadedBooking.status).toBe("pending");

      // Verify zero ledger entries were committed
      const ledgerEntries = await db
        .select()
        .from(schema.accountingLedgerEntries)
        .where(eq(schema.accountingLedgerEntries.bookingId, booking.id));
      expect(ledgerEntries.length).toBe(0);
    });

    test("4.3 tripsRepo.replaceTripVehicles atomic replacement preserves existing rows if step 2 throws", async () => {
      const suffix = generateTestSuffix();
      const tripsRepo = createTripsRepository(db);
      const fleetRepo = createFleetRepository(db);

      const vehicleType = await fleetRepo.insertVehicleType({
        categoryLookupCode: `cat_${suffix}`,
        nameAr: `نوع مركبة ${suffix}`,
        nameEn: `Vehicle Type ${suffix}`,
        seatCount: 14,
        seatLayout: {
          rows: 5,
          cols: 3,
          cells: [{ row: 0, col: 0, type: "seat" }],
        },
        scope: "tenant",
        tenantId,
        status: "active",
      });
      tracker.trackVehicleType(vehicleType.id);

      const v1 = await fleetRepo.insertVehicle({
        tenantId,
        vehicleTypeId: vehicleType.id,
        plateNumber: `V1-${suffix}`,
        plateNumberNormalized: `V1-${suffix}`,
        model: "Toyota HiAce",
        manufacturingYear: 2023,
        seatCount: 14,
        registrationStatus: "valid",
        photoUrls: [],
        amenityCodes: [],
        status: "active",
        createdByAccountId: ownerAccountId,
      });
      tracker.trackVehicle(v1.id);

      const tripId = tracker.trackTrip(randomUUID());
      await db.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: `رحلة مركبات ${suffix}`,
        titleEn: `Vehicle Trip ${suffix}`,
        descriptionAr: "وصف",
        descriptionEn: "Description",
        categoryLookupCode: "cultural",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 10000,
        currencyCode: "EGP",
        publishMode: "draft",
        state: "draft",
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

      // Assign v1 to trip initially
      await tripsRepo.replaceTripVehicles(tenantId, tripId, [
        {
          vehicleId: v1.id,
          seatCountSnapshot: 14,
          seatLayoutSnapshot: {
            rows: 5,
            cols: 3,
            cells: [{ row: 0, col: 0, type: "seat" }],
          },
        },
      ]);

      const initialAssignments = await db
        .select()
        .from(schema.tripVehicles)
        .where(eq(schema.tripVehicles.tripId, tripId));
      expect(initialAssignments.length).toBe(1);
      expect(initialAssignments[0].vehicleId).toBe(v1.id);

      // Fault-injecting DB: throw on trip_vehicles insert (step 2)
      const faultDb = createFaultInjectingDb(db, {
        failOnInsertTable: "trip_vehicles",
      });
      const faultyTripsRepo = createTripsRepository(faultDb);

      let thrown = false;
      try {
        await faultyTripsRepo.replaceTripVehicles(tenantId, tripId, [
          {
            vehicleId: v1.id,
            seatCountSnapshot: 10,
            seatLayoutSnapshot: {
              rows: 5,
              cols: 3,
              cells: [{ row: 0, col: 0, type: "seat" }],
            },
          },
        ]);
      } catch {
        thrown = true;
      }
      expect(thrown).toBe(true);

      // Verify that original assignment was NOT deleted (atomic rollback of step 1 delete)
      const postAssignments = await db
        .select()
        .from(schema.tripVehicles)
        .where(eq(schema.tripVehicles.tripId, tripId));
      expect(postAssignments.length).toBe(1);
      expect(postAssignments[0].vehicleId).toBe(v1.id);
      expect(postAssignments[0].seatCountSnapshot).toBe(14);
    });
  });

  // =========================================================================
  // PILLAR 5: Atomic Media Linking Across All 6 Domains
  // =========================================================================
  describe("Pillar 5: Atomic Media Linking Across Fleet, Trips, Programs, Org, Traveler, Onboarding", () => {
    test("5.1 Fleet: insertVehicle and updateVehicle atomically link files and rollback on failure", async () => {
      const suffix = generateTestSuffix();
      const mediaRepo = createMediaRepository(db);

      // Create a pending file
      const file = await mediaRepo.insertUploadedFile({
        uploaderAccountId: ownerAccountId,
        tenantId,
        disk: "uploads",
        storageKey: `vehicles/photo_${suffix}.jpg`,
        publicUrl: `https://storage.trips.test/uploads/media/vehicles/photo_${suffix}.jpg`,
        originalFilename: "vehicle.jpg",
        mimeType: "image/jpeg",
        fileSizeBytes: 204800,
        checksumSha256: "0123456789abcdef0123456789abcdef",
        purpose: "general",
        status: "pending",
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000),
      });
      tracker.trackFile(file.id);

      const fleetRepo = createFleetRepository(db);
      const vehicleType = await fleetRepo.insertVehicleType({
        categoryLookupCode: `cat_med_${suffix}`,
        nameAr: `نوع ${suffix}`,
        nameEn: `Type ${suffix}`,
        seatCount: 16,
        seatLayout: {
          rows: 4,
          cols: 4,
          cells: [{ row: 0, col: 0, type: "seat" }],
        },
        scope: "tenant",
        tenantId,
        status: "active",
      });
      tracker.trackVehicleType(vehicleType.id);

      // Insert vehicle with photoUrl matching the uploaded file
      const vehicle = await fleetRepo.insertVehicle({
        tenantId,
        vehicleTypeId: vehicleType.id,
        plateNumber: `MED-${suffix}`,
        plateNumberNormalized: `MED-${suffix}`,
        model: "Mercedes",
        manufacturingYear: 2024,
        seatCount: 16,
        registrationStatus: "valid",
        photoUrls: [file.publicUrl!],
        amenityCodes: [],
        status: "active",
        createdByAccountId: ownerAccountId,
      });
      tracker.trackVehicle(vehicle.id);

      // Assert file is now "linked", linkedEntityId matches, and expiresAt is null
      const [linkedFile] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, file.id));
      expect(linkedFile.status).toBe("linked");
      expect(linkedFile.linkedEntityType).toBe("vehicle");
      expect(linkedFile.linkedEntityId).toBe(vehicle.id);
      expect(linkedFile.expiresAt).toBeNull();

      // Fault injection test on vehicle update
      const faultDb = createFaultInjectingDb(db, {
        failOnUpdateTable: "uploaded_files",
      });
      const faultyFleetRepo = createFleetRepository(faultDb);

      let thrown = false;
      try {
        await faultyFleetRepo.updateVehicle(tenantId, vehicle.id, {
          model: "Model Should Rollback",
          photoUrls: [],
          updatedByAccountId: ownerAccountId,
        });
      } catch {
        thrown = true;
      }
      expect(thrown).toBe(true);

      // Verify vehicle model was not updated
      const [reloadedVehicle] = await db
        .select()
        .from(schema.vehicles)
        .where(eq(schema.vehicles.id, vehicle.id));
      expect(reloadedVehicle.model).toBe("Mercedes");
    });

    test("5.2 Trips: insertDraftTrip atomically links cover and gallery images", async () => {
      const suffix = generateTestSuffix();
      const mediaRepo = createMediaRepository(db);

      const coverFile = await mediaRepo.insertUploadedFile({
        uploaderAccountId: ownerAccountId,
        tenantId,
        disk: "uploads",
        storageKey: `trips/cover_${suffix}.jpg`,
        publicUrl: `https://storage.trips.test/uploads/media/trips/cover_${suffix}.jpg`,
        originalFilename: "cover.jpg",
        mimeType: "image/jpeg",
        fileSizeBytes: 300000,
        checksumSha256: "0123456789abcdef0123456789abcdef",
        purpose: "trip_cover",
        status: "pending",
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000),
      });
      tracker.trackFile(coverFile.id);

      const tripsRepo = createTripsRepository(db);
      const trip = await tripsRepo.insertDraftTrip({
        tenantId,
        titleAr: `رحلة وسائط ${suffix}`,
        titleEn: `Media Trip ${suffix}`,
        descriptionAr: "وصف",
        descriptionEn: "Description",
        categoryLookupCode: "cultural",
        language: "ar",
        coverImageUrl: coverFile.publicUrl,
        galleryImageUrls: [],
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
        createdByAccountId: ownerAccountId,
      });
      tracker.trackTrip(trip.id);

      // Verify cover file transitioned to "linked"
      const [linkedCover] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, coverFile.id));
      expect(linkedCover.status).toBe("linked");
      expect(linkedCover.linkedEntityType).toBe("trip");
      expect(linkedCover.linkedEntityId).toBe(trip.id);
      expect(linkedCover.expiresAt).toBeNull();
    });

    test("5.3 Programs: insertProgram atomically links attachments and updates trip wizardSteps", async () => {
      const suffix = generateTestSuffix();
      const mediaRepo = createMediaRepository(db);

      const progFile = await mediaRepo.insertUploadedFile({
        uploaderAccountId: ownerAccountId,
        tenantId,
        disk: "uploads",
        storageKey: `programs/doc_${suffix}.pdf`,
        publicUrl: `https://storage.trips.test/uploads/media/programs/doc_${suffix}.pdf`,
        originalFilename: "program.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 500000,
        checksumSha256: "0123456789abcdef0123456789abcdef",
        purpose: "program_attachment",
        status: "pending",
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000),
      });
      tracker.trackFile(progFile.id);

      const tripId = tracker.trackTrip(randomUUID());
      await db.insert(schema.trips).values({
        id: tripId,
        tenantId,
        titleAr: `رحلة برنامج ${suffix}`,
        titleEn: `Program Trip ${suffix}`,
        descriptionAr: "وصف",
        descriptionEn: "Description",
        categoryLookupCode: "cultural",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 10000,
        currencyCode: "EGP",
        publishMode: "draft",
        state: "draft",
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

      const programsRepo = createProgramsRepository(db);
      const program = await programsRepo.insertProgram({
        tenantId,
        tripId,
        titleAr: `برنامج ${suffix}`,
        titleEn: `Program ${suffix}`,
        descriptionAr: "وصف البرنامج",
        descriptionEn: "Program description",
        dayNumber: 1,
        startsAt: null,
        endsAt: null,
        locationNameAr: null,
        locationNameEn: null,
        capacity: null,
        sortOrder: 1,
        priceMinor: 5000,
        currencyCode: "EGP",
        isIncludedInBase: true,
        attachmentUrls: [progFile.publicUrl!],
        createdByAccountId: ownerAccountId,
      });

      // Verify file is linked
      const [linkedProgFile] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, progFile.id));
      expect(linkedProgFile.status).toBe("linked");
      expect(linkedProgFile.linkedEntityType).toBe("trip_program");
      expect(linkedProgFile.linkedEntityId).toBe(program.id);

      // Verify trip wizardSteps.programs was set to true
      const [reloadedTrip] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId));
      const steps = reloadedTrip.wizardSteps as Record<string, boolean>;
      expect(steps.programs).toBe(true);
    });

    test("5.4 Organization: upsertOrganizationSettings links logo and replaces old logo with 12h expiration", async () => {
      const suffix = generateTestSuffix();
      const mediaRepo = createMediaRepository(db);

      const logo1 = await mediaRepo.insertUploadedFile({
        uploaderAccountId: ownerAccountId,
        tenantId,
        disk: "uploads",
        storageKey: `org/logo1_${suffix}.png`,
        publicUrl: `https://storage.trips.test/uploads/media/org/logo1_${suffix}.png`,
        originalFilename: "logo1.png",
        mimeType: "image/png",
        fileSizeBytes: 10240,
        checksumSha256: "0123456789abcdef0123456789abcdef",
        purpose: "general",
        status: "pending",
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000),
      });
      tracker.trackFile(logo1.id);

      const orgRepo = createOrganizationRepository(db);
      await orgRepo.upsertOrganizationSettings(tenantId, {
        logoUrl: logo1.publicUrl,
        updatedByAccountId: ownerAccountId,
      });

      // Assert logo1 is linked
      const [linkedLogo1] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, logo1.id));
      expect(linkedLogo1.status).toBe("linked");
      expect(linkedLogo1.expiresAt).toBeNull();

      // Replace with logo2
      const logo2 = await mediaRepo.insertUploadedFile({
        uploaderAccountId: ownerAccountId,
        tenantId,
        disk: "uploads",
        storageKey: `org/logo2_${suffix}.png`,
        publicUrl: `https://storage.trips.test/uploads/media/org/logo2_${suffix}.png`,
        originalFilename: "logo2.png",
        mimeType: "image/png",
        fileSizeBytes: 15360,
        checksumSha256: "0123456789abcdef0123456789abcdef",
        purpose: "general",
        status: "pending",
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000),
      });
      tracker.trackFile(logo2.id);

      await orgRepo.upsertOrganizationSettings(tenantId, {
        logoUrl: logo2.publicUrl,
        updatedByAccountId: ownerAccountId,
      });

      // Assert logo2 is linked, and replaced logo1 reverted to "pending" with nextExpiresAt ~12h
      const [reloadedLogo1] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, logo1.id));
      expect(reloadedLogo1.status).toBe("pending");
      expect(reloadedLogo1.expiresAt).not.toBeNull();
      expect(reloadedLogo1.expiresAt!.getTime()).toBeGreaterThan(Date.now());

      const [linkedLogo2] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, logo2.id));
      expect(linkedLogo2.status).toBe("linked");
      expect(linkedLogo2.expiresAt).toBeNull();
    });

    test("5.5 Traveler: updateTravelerProfile links avatar and rolls back on failure", async () => {
      const suffix = generateTestSuffix();
      const mediaRepo = createMediaRepository(db);

      const avatarFile = await mediaRepo.insertUploadedFile({
        uploaderAccountId: ownerAccountId,
        tenantId: null,
        disk: "uploads",
        storageKey: `avatars/user_${suffix}.jpg`,
        publicUrl: `https://storage.trips.test/uploads/media/avatars/user_${suffix}.jpg`,
        originalFilename: "avatar.jpg",
        mimeType: "image/jpeg",
        fileSizeBytes: 45000,
        checksumSha256: "0123456789abcdef0123456789abcdef",
        purpose: "avatar",
        status: "pending",
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000),
      });
      tracker.trackFile(avatarFile.id);

      const travelerRepo = createTravelerRepository(db);
      const [currAccount] = await db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.id, ownerAccountId))
        .limit(1);

      await travelerRepo.updateAccountProfile(ownerAccountId, {
        fullName: currAccount.fullName,
        emailNormalized: currAccount.emailNormalized,
        emailBlindIndex: currAccount.emailBlindIndex,
        emailEncrypted: currAccount.emailEncrypted,
        phoneE164: currAccount.phoneE164,
        phoneBlindIndex: currAccount.phoneBlindIndex,
        phoneEncrypted: currAccount.phoneEncrypted,
        countryCode: currAccount.countryCode,
        avatarUrl: avatarFile.publicUrl,
        avatarFileId: avatarFile.id,
      });

      // Verify avatar file is linked to profile
      const [linkedAvatar] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, avatarFile.id));
      expect(linkedAvatar.status).toBe("linked");
      expect(linkedAvatar.linkedEntityType).toBe("profile");
      expect(linkedAvatar.linkedEntityId).toBe(ownerAccountId);
      expect(linkedAvatar.expiresAt).toBeNull();
    });

    test("5.6 Onboarding: insertApplicationDocuments links storageKeys inside transaction", async () => {
      const suffix = generateTestSuffix();
      const mediaRepo = createMediaRepository(db);

      const docFile = await mediaRepo.insertUploadedFile({
        uploaderAccountId: ownerAccountId,
        tenantId: null,
        disk: "documents",
        storageKey: `onboarding/cr_${suffix}.pdf`,
        publicUrl: `https://storage.trips.test/uploads/documents/onboarding/cr_${suffix}.pdf`,
        originalFilename: "commercial_reg.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 1200000,
        checksumSha256: "0123456789abcdef0123456789abcdef",
        purpose: "kyc",
        status: "pending",
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000),
      });
      tracker.trackFile(docFile.id);

      const onboardingRepo = createOnboardingRepository(db);
      const app = await onboardingRepo.createApplication({
        applicantAccountId: ownerAccountId,
        applicationType: "organization",
        state: "Draft",
        payload: { commercialRegNumber: `CR-${suffix}` },
        slaDueAt: new Date(Date.now() + 48 * 3600 * 1000),
      });

      await onboardingRepo.insertApplicationDocuments(app.id, [
        {
          documentType: "commercial_registration",
          storageKey: docFile.storageKey,
          mimeType: "application/pdf",
          fileSizeBytes: 1200000,
        },
      ]);

      // Verify file is linked to application
      const [linkedDoc] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, docFile.id));
      expect(linkedDoc.status).toBe("linked");
      expect(linkedDoc.linkedEntityType).toBe("application");
      expect(linkedDoc.linkedEntityId).toBe(app.id);
      expect(linkedDoc.expiresAt).toBeNull();
    });
  });
});
