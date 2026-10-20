import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  and,
  eq,
  inArray,
  schema,
  sql,
} from "@trips-app/db";
import { createBookingService } from "@trips-app/service-booking";
import { createPaymentsService } from "@trips-app/service-payments";
import { createOnboardingService } from "@trips-app/service-onboarding";
import { createProgramsRepository } from "../../../packages/services/programs/src/repository";
import { createStaffingRepository } from "../../../packages/services/staffing/src/repository";
import {
  computeBlindIndex,
  normalizeEmail,
  normalizePhoneE164,
} from "@trips-app/domain";
import { getTestContext, getTestDb, TestEntityTracker } from "../helpers/db";

describe("Tier 5 - Empirical Challenge: Final Concurrency & Business Invariant Hardening", () => {
  const db = getTestDb();
  const tracker = new TestEntityTracker();
  let defaultTenantId: string;
  let ownerAccountId: string;

  // Custom entity tracking for cleanup
  const extraTripIds: string[] = [];
  const extraBookingIds: string[] = [];
  const extraPaymentIds: string[] = [];
  const extraCouponIds: string[] = [];
  const extraVehicleIds: string[] = [];
  const extraVehicleTypeIds: string[] = [];
  const extraAppIds: string[] = [];
  const extraOrgIds: string[] = [];
  const extraAccountIds: string[] = [];
  const extraLedgerIds: string[] = [];

  beforeAll(async () => {
    const ctx = await getTestContext();
    defaultTenantId = ctx.tenantId;
    ownerAccountId = ctx.ownerAccountId;
  });

  afterAll(async () => {
    // Clean up all test entities in reverse dependency order
    if (extraLedgerIds.length > 0) {
      await db
        .delete(schema.accountingLedgerEntries)
        .where(inArray(schema.accountingLedgerEntries.id, extraLedgerIds));
    }
    if (extraPaymentIds.length > 0) {
      await db
        .delete(schema.paymentTransactions)
        .where(inArray(schema.paymentTransactions.id, extraPaymentIds));
    }
    if (extraBookingIds.length > 0) {
      await db
        .delete(schema.checkInRecords)
        .where(inArray(schema.checkInRecords.bookingId, extraBookingIds));
      await db
        .delete(schema.parentChildLinks)
        .where(inArray(schema.parentChildLinks.bookingId, extraBookingIds));
      await db
        .delete(schema.tripSeatInventory)
        .where(inArray(schema.tripSeatInventory.bookingId, extraBookingIds));
      await db
        .delete(schema.bookings)
        .where(inArray(schema.bookings.id, extraBookingIds));
    }
    if (extraTripIds.length > 0) {
      await db
        .delete(schema.tripPrograms)
        .where(inArray(schema.tripPrograms.tripId, extraTripIds));
      await db
        .delete(schema.tripVehicles)
        .where(inArray(schema.tripVehicles.tripId, extraTripIds));
      await db
        .delete(schema.tripSeatInventory)
        .where(inArray(schema.tripSeatInventory.tripId, extraTripIds));
      await db
        .delete(schema.trips)
        .where(inArray(schema.trips.id, extraTripIds));
    }
    if (extraAppIds.length > 0) {
      await db
        .delete(schema.auditLogs)
        .where(
          and(
            eq(schema.auditLogs.targetEntityType, "application"),
            inArray(schema.auditLogs.targetEntityId, extraAppIds),
          ),
        );
      await db
        .delete(schema.applicationDocuments)
        .where(inArray(schema.applicationDocuments.applicationId, extraAppIds));
      await db
        .delete(schema.applications)
        .where(inArray(schema.applications.id, extraAppIds));
    }
    if (extraCouponIds.length > 0) {
      await db
        .delete(schema.coupons)
        .where(inArray(schema.coupons.id, extraCouponIds));
    }
    if (extraVehicleIds.length > 0) {
      await db
        .delete(schema.vehicles)
        .where(inArray(schema.vehicles.id, extraVehicleIds));
    }
    if (extraVehicleTypeIds.length > 0) {
      await db
        .delete(schema.vehicleTypes)
        .where(inArray(schema.vehicleTypes.id, extraVehicleTypeIds));
    }
    if (extraOrgIds.length > 0) {
      await db
        .delete(schema.organizationSettings)
        .where(inArray(schema.organizationSettings.tenantId, extraOrgIds));
      await db
        .delete(schema.accountRoles)
        .where(inArray(schema.accountRoles.tenantId, extraOrgIds));
      await db
        .delete(schema.organizations)
        .where(inArray(schema.organizations.id, extraOrgIds));
    }
    if (extraAccountIds.length > 0) {
      await db
        .delete(schema.accountRoles)
        .where(inArray(schema.accountRoles.accountId, extraAccountIds));
      await db
        .delete(schema.accounts)
        .where(inArray(schema.accounts.id, extraAccountIds));
    }
    await tracker.cleanup(db);
  });

  // Helper to create test traveler account
  async function createTestTravelerAccount(suffix: string) {
    const accountId = randomUUID();
    extraAccountIds.push(accountId);
    const email = `traveler_${suffix}_${randomUUID().slice(0, 6)}@example.com`;
    const phone = `+2010${Math.floor(10000000 + Math.random() * 90000000)}`;
    await db.insert(schema.accounts).values({
      id: accountId,
      emailNormalized: normalizeEmail(email),
      emailBlindIndex: computeBlindIndex(normalizeEmail(email)),
      phoneE164: normalizePhoneE164(phone),
      phoneBlindIndex: computeBlindIndex(normalizePhoneE164(phone)),
      fullName: `Traveler ${suffix}`,
      countryCode: "EG",
      preferredLanguage: "ar",
      status: "active",
      travelerPlanTier: "free",
    });
    return accountId;
  }

  // =========================================================================
  // 1. BOOKING SEAT RESERVATION & INVENTORY LIMITS UNDER CONCURRENCY
  // =========================================================================
  describe("1. Booking Seat Reservation & Inventory Invariants Under Concurrency", () => {
    test("1.1 Thundering herd on identical seat label: Exactly ONE booking secures seat, others fail", async () => {
      const tripId = randomUUID();
      const vehicleTypeId = randomUUID();
      const vehicleId = randomUUID();
      extraTripIds.push(tripId);
      extraVehicleTypeIds.push(vehicleTypeId);
      extraVehicleIds.push(vehicleId);

      await db.insert(schema.vehicleTypes).values({
        id: vehicleTypeId,
        tenantId: defaultTenantId,
        categoryLookupCode: "CAT_BUS",
        nameAr: "حافلة",
        nameEn: "Bus",
        seatCount: 20,
        seatLayout: { rows: 4, cols: 5, cells: [] },
        scope: "organization",
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      await db.insert(schema.vehicles).values({
        id: vehicleId,
        tenantId: defaultTenantId,
        vehicleTypeId,
        plateNumber: `TH-${randomUUID().slice(0, 4)}`,
        plateNumberNormalized: `TH${randomUUID().slice(0, 4)}`,
        model: "Mercedes",
        manufacturingYear: 2024,
        seatCount: 20,
        status: "active",
      });

      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة مقعد مشترك",
        titleEn: "Seat Contention Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 20000,
        totalCapacity: 10,
        confirmedSeatsCount: 0,
        heldSeatsCount: 0,
        state: "published",
        publishMode: "published",
        createdByAccountId: ownerAccountId,
      });

      const contestedSeat = "A1";
      const concurrentAttempts = 8;
      const travelers: string[] = [];

      for (let i = 0; i < concurrentAttempts; i++) {
        travelers.push(await createTestTravelerAccount(`c1_${i}_${randomUUID().slice(0, 4)}`));
      }

      const bookingService = createBookingService({ db });

      // Execute 8 concurrent booking requests for the exact same seat "A1"
      const results = await Promise.allSettled(
        travelers.map((travelerId, idx) =>
          bookingService.createBooking(travelerId, {
            tripId,
            vehicleId,
            passengers: [
              {
                id: randomUUID(),
                fullName: `Passenger ${idx}`,
                nationalId: `1234567890123${idx}`,
                age: 25,
                gender: "male",
                seatLabel: contestedSeat,
                isChild: false,
              },
            ],
            seatLabels: [contestedSeat],
            selectedProgramIds: [],
            paymentGateway: "paymob",
          }),
        ),
      );

      const successful = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      // Track created bookings for cleanup
      for (const res of successful) {
        if (res.status === "fulfilled") {
          extraBookingIds.push(res.value.booking.id);
        }
      }

      // Invariant: Exactly ONE booking can succeed in claiming seat "A1"
      expect(successful.length).toBe(1);
      expect(rejected.length).toBe(concurrentAttempts - 1);

      // Verify rejected reasons are SEAT_UNAVAILABLE or serialization error
      for (const rej of rejected) {
        if (rej.status === "rejected") {
          expect((rej.reason as Error).message).toMatch(/unavailable|conflict|failed|could not serialize/i);
        }
      }

      // Check DB inventory: Exactly 1 row for seat A1 in tripSeatInventory
      const seatRows = await db
        .select()
        .from(schema.tripSeatInventory)
        .where(
          and(
            eq(schema.tripSeatInventory.tripId, tripId),
            eq(schema.tripSeatInventory.seatLabel, contestedSeat),
          ),
        );

      expect(seatRows.length).toBe(1);
      expect(seatRows[0]?.status).toBe("reserved");
    });

    test("1.2 Total capacity limit under concurrent booking flood (Zero Overbooking Invariant)", async () => {
      const tripId = randomUUID();
      extraTripIds.push(tripId);
      const capacity = 3;

      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة محدودة السعة",
        titleEn: "Capacity Constrained Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 15000,
        totalCapacity: capacity,
        confirmedSeatsCount: 0,
        heldSeatsCount: 0,
        state: "published",
        publishMode: "published",
        createdByAccountId: ownerAccountId,
      });

      const concurrentAttempts = 9;
      const travelers: string[] = [];

      for (let i = 0; i < concurrentAttempts; i++) {
        travelers.push(await createTestTravelerAccount(`cap_${i}_${randomUUID().slice(0, 4)}`));
      }

      const bookingService = createBookingService({ db });

      // 9 concurrent booking attempts, each requesting 1 passenger without assigned vehicle seats
      const results = await Promise.allSettled(
        travelers.map((travelerId, idx) =>
          bookingService.createBooking(travelerId, {
            tripId,
            vehicleId: null,
            passengers: [
              {
                id: randomUUID(),
                fullName: `Flooder ${idx}`,
                nationalId: `2990101123456${idx}`,
                age: 30,
                gender: "female",
                isChild: false,
              },
            ],
            seatLabels: [],
            selectedProgramIds: [],
            paymentGateway: "fawry",
          }),
        ),
      );

      const successful = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      for (const res of successful) {
        if (res.status === "fulfilled") {
          extraBookingIds.push(res.value.booking.id);
        }
      }

      // Invariant: Exactly `capacity` (3) bookings succeed, and `concurrentAttempts - capacity` (6) fail
      expect(successful.length).toBe(capacity);
      expect(rejected.length).toBe(concurrentAttempts - capacity);

      // Verify rejected reasons are INSUFFICIENT_CAPACITY
      for (const rej of rejected) {
        if (rej.status === "rejected") {
          expect((rej.reason as Error).message).toMatch(/not enough available seats|capacity/i);
        }
      }

      // Verify actual booked bookings count in database
      const dbBookings = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.tripId, tripId));

      expect(dbBookings.length).toBe(capacity);
    });

    test("1.3 Multi-seat overlapping contention rolls back the losing transaction completely", async () => {
      const tripId = randomUUID();
      const vehicleTypeId = randomUUID();
      const vehicleId = randomUUID();
      extraTripIds.push(tripId);
      extraVehicleTypeIds.push(vehicleTypeId);
      extraVehicleIds.push(vehicleId);

      await db.insert(schema.vehicleTypes).values({
        id: vehicleTypeId,
        tenantId: defaultTenantId,
        categoryLookupCode: "CAT_BUS",
        nameAr: "حافلة",
        nameEn: "Bus",
        seatCount: 10,
        seatLayout: { rows: 2, cols: 5, cells: [] },
        scope: "organization",
        status: "active",
        createdByAccountId: ownerAccountId,
      });

      await db.insert(schema.vehicles).values({
        id: vehicleId,
        tenantId: defaultTenantId,
        vehicleTypeId,
        plateNumber: `OV-${randomUUID().slice(0, 4)}`,
        plateNumberNormalized: `OV${randomUUID().slice(0, 4)}`,
        model: "Coaster",
        manufacturingYear: 2024,
        seatCount: 10,
        status: "active",
      });

      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة تداخل المقاعد",
        titleEn: "Overlap Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 25000,
        totalCapacity: 10,
        confirmedSeatsCount: 0,
        heldSeatsCount: 0,
        state: "published",
        publishMode: "published",
        createdByAccountId: ownerAccountId,
      });

      const travelerA = await createTestTravelerAccount(`ov_a_${randomUUID().slice(0, 4)}`);
      const travelerB = await createTestTravelerAccount(`ov_b_${randomUUID().slice(0, 4)}`);

      // Traveler A requests [S1, S2, S3]
      // Traveler B requests [S3, S4, S5] (contesting S3)
      const bookingService = createBookingService({ db });

      const [resA, resB] = await Promise.allSettled([
        bookingService.createBooking(travelerA, {
          tripId,
          vehicleId,
          passengers: [
            { id: randomUUID(), fullName: "A1", nationalId: "10000000000001", age: 20, gender: "male", seatLabel: "S1", isChild: false },
            { id: randomUUID(), fullName: "A2", nationalId: "10000000000002", age: 20, gender: "male", seatLabel: "S2", isChild: false },
            { id: randomUUID(), fullName: "A3", nationalId: "10000000000003", age: 20, gender: "male", seatLabel: "S3", isChild: false },
          ],
          seatLabels: ["S1", "S2", "S3"],
          selectedProgramIds: [],
          paymentGateway: "paymob",
        }),
        bookingService.createBooking(travelerB, {
          tripId,
          vehicleId,
          passengers: [
            { id: randomUUID(), fullName: "B1", nationalId: "20000000000001", age: 22, gender: "female", seatLabel: "S3", isChild: false },
            { id: randomUUID(), fullName: "B2", nationalId: "20000000000002", age: 22, gender: "female", seatLabel: "S4", isChild: false },
            { id: randomUUID(), fullName: "B3", nationalId: "20000000000003", age: 22, gender: "female", seatLabel: "S5", isChild: false },
          ],
          seatLabels: ["S3", "S4", "S5"],
          selectedProgramIds: [],
          paymentGateway: "paymob",
        }),
      ]);

      const oneFulfilled = (resA.status === "fulfilled" && resB.status === "rejected") ||
                           (resA.status === "rejected" && resB.status === "fulfilled");
      expect(oneFulfilled).toBe(true);

      const winningBooking = resA.status === "fulfilled" ? resA.value.booking : (resB as any).value.booking;
      extraBookingIds.push(winningBooking.id);

      // Verify that the loser's non-contested seats were NOT leaked into inventory
      const reservedSeats = await db
        .select()
        .from(schema.tripSeatInventory)
        .where(eq(schema.tripSeatInventory.tripId, tripId));

      expect(reservedSeats.length).toBe(3);
      if (resA.status === "fulfilled") {
        const labels = reservedSeats.map((s) => s.seatLabel).sort();
        expect(labels).toEqual(["S1", "S2", "S3"]);
      } else {
        const labels = reservedSeats.map((s) => s.seatLabel).sort();
        expect(labels).toEqual(["S3", "S4", "S5"]);
      }
    });
  });

  // =========================================================================
  // 2. COUPON REDEMPTION POOL LIMITS & RACE CONDITION RESILIENCE
  // =========================================================================
  describe("2. Coupon Redemption Pool Limits & Race Condition Resilience", () => {
    test("2.1 Strict redemption limit (maxRedemptions = 1): Exactly 1 concurrent booking gets discount", async () => {
      const tripId = randomUUID();
      const couponId = randomUUID();
      extraTripIds.push(tripId);
      extraCouponIds.push(couponId);

      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة الكوبون الفردي",
        titleEn: "Single Coupon Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 10000,
        totalCapacity: 20,
        confirmedSeatsCount: 0,
        heldSeatsCount: 0,
        state: "published",
        publishMode: "published",
        createdByAccountId: ownerAccountId,
      });

      const couponCode = `STRICT1_${randomUUID().slice(0, 6).toUpperCase()}`;
      await db.insert(schema.coupons).values({
        id: couponId,
        tenantId: defaultTenantId,
        code: couponCode,
        titleAr: "خصم حصري واحد",
        titleEn: "Strict Single Coupon",
        discountType: "percentage",
        discountValue: 20,
        maxRedemptions: 1,
        redemptionsCount: 0,
        status: "active",
        scope: "organization",
        startsAt: new Date(Date.now() - 3600000),
        expiresAt: new Date(Date.now() + 86400000),
      });

      const concurrentAttempts = 6;
      const travelers: string[] = [];

      for (let i = 0; i < concurrentAttempts; i++) {
        travelers.push(await createTestTravelerAccount(`cpn1_${i}_${randomUUID().slice(0, 4)}`));
      }

      const bookingService = createBookingService({ db });

      // 6 concurrent bookings all presenting couponCode
      const results = await Promise.allSettled(
        travelers.map((travelerId, idx) =>
          bookingService.createBooking(travelerId, {
            tripId,
            vehicleId: null,
            couponCode,
            passengers: [
              {
                id: randomUUID(),
                fullName: `Coupon Buyer ${idx}`,
                nationalId: `2980101123456${idx}`,
                age: 28,
                gender: "male",
                isChild: false,
              },
            ],
            seatLabels: [],
            selectedProgramIds: [],
            paymentGateway: "paymob",
          }),
        ),
      );

      const successful = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      for (const res of successful) {
        if (res.status === "fulfilled") {
          extraBookingIds.push(res.value.booking.id);
        }
      }

      // Exactly 1 booking should succeed with the coupon applied
      expect(successful.length).toBe(1);
      expect(rejected.length).toBe(concurrentAttempts - 1);

      // Verify rejection reasons indicate coupon invalid or limit reached
      for (const rej of rejected) {
        if (rej.status === "rejected") {
          expect((rej.reason as Error).message).toMatch(/coupon/i);
        }
      }

      // Check DB coupon redemptionsCount: MUST be exactly 1, NEVER 2 or more
      const [updatedCoupon] = await db
        .select()
        .from(schema.coupons)
        .where(eq(schema.coupons.id, couponId));

      expect(updatedCoupon.redemptionsCount).toBe(1);
    });

    test("2.2 Coupon pool exhaustion (maxRedemptions = 3) under 10 concurrent booking attempts", async () => {
      const tripId = randomUUID();
      const couponId = randomUUID();
      extraTripIds.push(tripId);
      extraCouponIds.push(couponId);

      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة مجمع الكوبونات",
        titleEn: "Coupon Pool Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 10000,
        totalCapacity: 30,
        confirmedSeatsCount: 0,
        heldSeatsCount: 0,
        state: "published",
        publishMode: "published",
        createdByAccountId: ownerAccountId,
      });

      const couponCode = `POOL3_${randomUUID().slice(0, 6).toUpperCase()}`;
      await db.insert(schema.coupons).values({
        id: couponId,
        tenantId: defaultTenantId,
        code: couponCode,
        titleAr: "خصم مجمع 3",
        titleEn: "Pool 3 Coupon",
        discountType: "fixed",
        discountValue: 2000,
        maxRedemptions: 3,
        redemptionsCount: 0,
        status: "active",
        scope: "organization",
        startsAt: new Date(Date.now() - 3600000),
        expiresAt: new Date(Date.now() + 86400000),
      });

      const concurrentAttempts = 8;
      const travelers: string[] = [];

      for (let i = 0; i < concurrentAttempts; i++) {
        travelers.push(await createTestTravelerAccount(`cpn3_${i}_${randomUUID().slice(0, 4)}`));
      }

      const bookingService = createBookingService({ db });

      const results = await Promise.allSettled(
        travelers.map((travelerId, idx) =>
          bookingService.createBooking(travelerId, {
            tripId,
            vehicleId: null,
            couponCode,
            passengers: [
              {
                id: randomUUID(),
                fullName: `Pool Buyer ${idx}`,
                nationalId: `2970101123456${idx}`,
                age: 26,
                gender: "female",
                isChild: false,
              },
            ],
            seatLabels: [],
            selectedProgramIds: [],
            paymentGateway: "fawry",
          }),
        ),
      );

      const successful = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      for (const res of successful) {
        if (res.status === "fulfilled") {
          extraBookingIds.push(res.value.booking.id);
        }
      }

      // Exactly 3 succeed, remaining 5 fail due to coupon pool exhaustion
      expect(successful.length).toBe(3);
      expect(rejected.length).toBe(concurrentAttempts - 3);

      const [updatedCoupon] = await db
        .select()
        .from(schema.coupons)
        .where(eq(schema.coupons.id, couponId));

      expect(updatedCoupon.redemptionsCount).toBe(3);
    });
  });

  // =========================================================================
  // 3. PAYMENT SETTLEMENT & REVENUE LEDGER CONSISTENCY (CON-07)
  // =========================================================================
  describe("3. Payment Settlement & Revenue Ledger Balance Consistency (CON-07)", () => {
    test("3.1 Concurrent double-confirmation / webhook replay: Invariant CON-07 & ledger idempotency", async () => {
      const tripId = randomUUID();
      const bookingId = randomUUID();
      const paymentId = randomUUID();
      extraTripIds.push(tripId);
      extraBookingIds.push(bookingId);
      extraPaymentIds.push(paymentId);

      const travelerId = await createTestTravelerAccount(`pay_${randomUUID().slice(0, 4)}`);

      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة الدفع المالي",
        titleEn: "Payment Ledger Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 50000,
        totalCapacity: 20,
        confirmedSeatsCount: 0,
        heldSeatsCount: 0,
        state: "published",
        publishMode: "published",
        createdByAccountId: ownerAccountId,
      });

      const bookingReference = `BK-${randomUUID().slice(0, 8).toUpperCase()}`;
      await db.insert(schema.bookings).values({
        id: bookingId,
        tenantId: defaultTenantId,
        bookingReference,
        tripId,
        travelerAccountId: travelerId,
        status: "pending_payment",
        passengersCount: 2,
        subtotalMinor: 50000,
        programsTotalMinor: 0,
        discountMinor: 0,
        totalAmountMinor: 50000,
        currencyCode: "EGP",
        paymentGateway: "paymob",
      });

      const providerRef = `PROV-${randomUUID()}`;
      await db.insert(schema.paymentTransactions).values({
        id: paymentId,
        tenantId: defaultTenantId,
        bookingId,
        payerAccountId: travelerId,
        gateway: "paymob",
        providerReference: providerRef,
        amountMinor: 50000,
        currencyCode: "EGP",
        status: "pending",
      });

      const paymentsService = createPaymentsService({ db });

      // Simulate 6 concurrent settlement requests (e.g. parallel webhook retries + user redirect confirmation)
      const results = await Promise.allSettled(
        Array.from({ length: 6 }).map(() =>
          paymentsService.processGatewayCallback({
            gateway: "paymob",
            providerReference: providerRef,
            outcome: "succeeded",
          }),
        ),
      );

      // Verify all requests finished cleanly
      for (const res of results) {
        expect(res.status).toBe("fulfilled");
      }

      // Check ledger entries in DB
      const ledgerEntries = await db
        .select()
        .from(schema.accountingLedgerEntries)
        .where(eq(schema.accountingLedgerEntries.bookingId, bookingId));

      for (const entry of ledgerEntries) {
        extraLedgerIds.push(entry.id);
      }

      // CON-07 Invariant 1: Double entry / financial balance integrity
      // For every entry, gross = net + commission
      for (const entry of ledgerEntries) {
        expect(entry.grossAmountMinor).toBe(entry.netAmountMinor + entry.commissionAmountMinor);
        expect(entry.currencyCode).toBe("EGP");
        expect(entry.status).toBe("posted");
      }

      // Check trip confirmedSeatsCount
      const [updatedTrip] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId));

      // Check payment status
      const [updatedPayment] = await db
        .select()
        .from(schema.paymentTransactions)
        .where(eq(schema.paymentTransactions.id, paymentId));

      expect(updatedPayment.status).toBe("succeeded");

      // Check booking status
      const [updatedBooking] = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, bookingId));

      expect(updatedBooking.status).toBe("confirmed");

      // Empirical Check: Ledger idempotency
      // The total ledger entries must match exactly 1 single settlement, NOT duplicate 6 times
      expect(ledgerEntries.length).toBe(1);
      expect(updatedTrip.confirmedSeatsCount).toBe(2);
    });
  });

  // =========================================================================
  // 4. ONBOARDING APPLICATION STATE TRANSITIONS & DUPLICATE REGISTRATION
  // =========================================================================
  describe("4. Onboarding Application State Transitions & Duplicate Registration", () => {
    test("4.1 Concurrent double-approval of organization application: Single organization provisioned", async () => {
      const applicantId = await createTestTravelerAccount(`onb_app_${randomUUID().slice(0, 4)}`);
      const adminAccountId = ownerAccountId;

      const onboardingService = createOnboardingService({ db });

      // Submit valid application
      const app = await onboardingService.submitOrganizationApplication(
        { accountId: applicantId },
        {
          legalEntityName: "شركة الرحلات الماسية الموازية",
          commercialRegNumber: `CR-${randomUUID().slice(0, 8)}`,
          taxNumber: `TX-${randomUUID().slice(0, 8)}`,
          tourismLicenseNumber: `TL-${randomUUID().slice(0, 8)}`,
          tourismLicenseExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          countryCode: "EG",
          headquartersAddress: "شارع التحرير، القاهرة",
          signatoryFullName: "أحمد عبد الله",
          signatoryNationalId: "28801011234567",
          signatoryRoleTitle: "المدير العام",
          payoutMethod: "bank_transfer",
          payoutIbanOrWallet: "EG123456789012345678901234",
          childSafetyProgramOptIn: false,
          documents: [
            {
              documentType: "commercial_registry",
              storageKey: `onboarding/doc-${randomUUID()}`,
              mimeType: "application/pdf",
              fileSizeBytes: 2048,
            },
            {
              documentType: "tax_card",
              storageKey: `onboarding/doc-${randomUUID()}`,
              mimeType: "application/pdf",
              fileSizeBytes: 2048,
            },
            {
              documentType: "tourism_license",
              storageKey: `onboarding/doc-${randomUUID()}`,
              mimeType: "application/pdf",
              fileSizeBytes: 2048,
            },
          ],
        },
      );
      extraAppIds.push(app.id);

      // Verify initial state
      expect(app.state).toBe("Pending Review");

      // 4 concurrent admin approval calls for the same application
      const results = await Promise.allSettled(
        Array.from({ length: 4 }).map(() =>
          onboardingService.approveApplication(
            { accountId: adminAccountId, activeRole: "admin", adminSubRole: "compliance" },
            {
              applicationId: app.id,
              decisionReasonCode: "APPROVE_ALL_DOCS_VERIFIED",
              decisionNotes: "Approved under concurrency challenge",
            },
          ),
        ),
      );

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      expect(fulfilled.length).toBeGreaterThanOrEqual(1);

      // Read final application
      const [finalApp] = await db
        .select()
        .from(schema.applications)
        .where(eq(schema.applications.id, app.id));

      expect(finalApp.state).toBe("Approved");
      expect(finalApp.provisionedOrganizationId).toBeDefined();

      if (finalApp.provisionedOrganizationId) {
        extraOrgIds.push(finalApp.provisionedOrganizationId);
      }

      // Invariant: An applicant should NOT have multiple organizations created from this single application
      const createdOrgs = await db
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.ownerAccountId, applicantId));

      for (const org of createdOrgs) {
        if (!extraOrgIds.includes(org.id)) extraOrgIds.push(org.id);
      }

      expect(createdOrgs.length).toBe(1);
    });

    test("4.2 Concurrent conflicting state transitions (Approve vs Reject): State integrity", async () => {
      const applicantId = await createTestTravelerAccount(`onb_conf_${randomUUID().slice(0, 4)}`);
      const adminAccountId = ownerAccountId;

      const onboardingService = createOnboardingService({ db });

      const app = await onboardingService.submitOrganizationApplication(
        { accountId: applicantId },
        {
          legalEntityName: "شركة تنازع الحالات",
          commercialRegNumber: `CR-${randomUUID().slice(0, 8)}`,
          taxNumber: `TX-${randomUUID().slice(0, 8)}`,
          tourismLicenseNumber: `TL-${randomUUID().slice(0, 8)}`,
          tourismLicenseExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          countryCode: "EG",
          headquartersAddress: "الإسكندرية",
          signatoryFullName: "محمود حسن",
          signatoryNationalId: "28801011234568",
          signatoryRoleTitle: "رئيس مجلس الإدارة",
          payoutMethod: "bank_transfer",
          payoutIbanOrWallet: "EG123456789012345678909999",
          childSafetyProgramOptIn: false,
          documents: [
            { documentType: "commercial_registry", storageKey: `onboarding/doc-${randomUUID()}`, mimeType: "application/pdf", fileSizeBytes: 1024 },
            { documentType: "tax_card", storageKey: `onboarding/doc-${randomUUID()}`, mimeType: "application/pdf", fileSizeBytes: 1024 },
            { documentType: "tourism_license", storageKey: `onboarding/doc-${randomUUID()}`, mimeType: "application/pdf", fileSizeBytes: 1024 },
          ],
        },
      );
      extraAppIds.push(app.id);

      // Concurrently execute approve and reject
      const [_resApprove, _resReject] = await Promise.allSettled([
        onboardingService.approveApplication(
          { accountId: adminAccountId, activeRole: "admin", adminSubRole: "compliance" },
          { applicationId: app.id, decisionReasonCode: "APPROVE_CONCURRENT" },
        ),
        onboardingService.rejectApplication(
          { accountId: adminAccountId, activeRole: "admin" },
          { applicationId: app.id, decisionReasonCode: "REJECT_CONCURRENT", decisionNotes: "Test reject" },
        ),
      ]);

      const [finalApp] = await db
        .select()
        .from(schema.applications)
        .where(eq(schema.applications.id, app.id));

      if (finalApp.provisionedOrganizationId) {
        extraOrgIds.push(finalApp.provisionedOrganizationId);
      }

      // The final state must be a valid terminal state ("Approved" or "Rejected")
      expect(["Approved", "Rejected"]).toContain(finalApp.state);

      // Invariant: If state is "Rejected", no active organization roles should be granted
      if (finalApp.state === "Rejected") {
        const roles = await db
          .select()
          .from(schema.accountRoles)
          .where(
            and(
              eq(schema.accountRoles.accountId, applicantId),
              eq(schema.accountRoles.status, "active"),
            ),
          );
        expect(roles.length).toBe(0);
      }
    });

    test("4.3 Duplicate registration detection (T-ONB-14) under parallel submissions with identical CR", async () => {
      const applicant1 = await createTestTravelerAccount(`dup1_${randomUUID().slice(0, 4)}`);
      const applicant2 = await createTestTravelerAccount(`dup2_${randomUUID().slice(0, 4)}`);

      const sharedCR = `CR-SHARED-${randomUUID().slice(0, 6)}`;
      const sharedTax = `TX-SHARED-${randomUUID().slice(0, 6)}`;

      const onboardingService = createOnboardingService({ db });

      // Submit two applications in parallel with identical CR & Tax numbers
      const [app1, app2] = await Promise.all([
        onboardingService.submitOrganizationApplication(
          { accountId: applicant1 },
          {
            legalEntityName: "منظمة أولى مشتركة السجل",
            commercialRegNumber: sharedCR,
            taxNumber: sharedTax,
            tourismLicenseNumber: `TL-${randomUUID().slice(0, 6)}`,
            tourismLicenseExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            countryCode: "EG",
            headquartersAddress: "الجيزة",
            signatoryFullName: "شريك أول",
            signatoryNationalId: "28801011234561",
            signatoryRoleTitle: "شريك",
            payoutMethod: "bank_transfer",
            payoutIbanOrWallet: "EG123456789012345678901111",
            childSafetyProgramOptIn: false,
            documents: [
              { documentType: "commercial_registry", storageKey: `onboarding/doc-${randomUUID()}`, mimeType: "application/pdf", fileSizeBytes: 1024 },
              { documentType: "tax_card", storageKey: `onboarding/doc-${randomUUID()}`, mimeType: "application/pdf", fileSizeBytes: 1024 },
              { documentType: "tourism_license", storageKey: `onboarding/doc-${randomUUID()}`, mimeType: "application/pdf", fileSizeBytes: 1024 },
            ],
          },
        ),
        onboardingService.submitOrganizationApplication(
          { accountId: applicant2 },
          {
            legalEntityName: "منظمة ثانية مشتركة السجل",
            commercialRegNumber: sharedCR,
            taxNumber: sharedTax,
            tourismLicenseNumber: `TL-${randomUUID().slice(0, 6)}`,
            tourismLicenseExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            countryCode: "EG",
            headquartersAddress: "الجيزة",
            signatoryFullName: "شريك ثان",
            signatoryNationalId: "28801011234562",
            signatoryRoleTitle: "شريك",
            payoutMethod: "bank_transfer",
            payoutIbanOrWallet: "EG123456789012345678902222",
            childSafetyProgramOptIn: false,
            documents: [
              { documentType: "commercial_registry", storageKey: `onboarding/doc-${randomUUID()}`, mimeType: "application/pdf", fileSizeBytes: 1024 },
              { documentType: "tax_card", storageKey: `onboarding/doc-${randomUUID()}`, mimeType: "application/pdf", fileSizeBytes: 1024 },
              { documentType: "tourism_license", storageKey: `onboarding/doc-${randomUUID()}`, mimeType: "application/pdf", fileSizeBytes: 1024 },
            ],
          },
        ),
      ]);

      extraAppIds.push(app1.id, app2.id);

      // Verify both exist and are in Pending Review
      expect(app1.state).toBe("Pending Review");
      expect(app2.state).toBe("Pending Review");

      // Verify audit logs exist for both
      const auditLogs = await db
        .select()
        .from(schema.auditLogs)
        .where(
          and(
            eq(schema.auditLogs.targetEntityType, "application"),
            inArray(schema.auditLogs.targetEntityId, [app1.id, app2.id]),
          ),
        );

      expect(auditLogs.length).toBeGreaterThanOrEqual(2);
    });
  });

  // =========================================================================
  // 5. SQL JSONB ATOMIC CONCATENATION (`wizardSteps`) UNDER PARALLEL UPDATES
  // =========================================================================
  describe("5. SQL JSONB Atomic Concatenation (wizardSteps) Under Parallel Updates", () => {
    test("5.1 20 parallel updates modifying distinct step keys: Zero lost updates", async () => {
      const tripId = randomUUID();
      extraTripIds.push(tripId);

      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة تحديثات خطوات المعالج",
        titleEn: "Wizard Steps Parallel Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 10000,
        totalCapacity: 20,
        confirmedSeatsCount: 0,
        heldSeatsCount: 0,
        state: "draft",
        publishMode: "published",
        wizardSteps: { initial_base: true } as any,
        createdByAccountId: ownerAccountId,
      });

      const stepCount = 20;
      const stepKeys = Array.from({ length: stepCount }, (_, i) => `parallel_step_${i}`);

      // Fire 20 parallel atomic JSONB concatenation updates
      const updatePromises = stepKeys.map((stepKey) =>
        db
          .update(schema.trips)
          .set({
            wizardSteps: sql`coalesce(${schema.trips.wizardSteps}, '{}'::jsonb) || ${JSON.stringify({ [stepKey]: true })}::jsonb`,
          })
          .where(eq(schema.trips.id, tripId)),
      );

      const results = await Promise.allSettled(updatePromises);
      for (const res of results) {
        expect(res.status).toBe("fulfilled");
      }

      // Read back final wizardSteps
      const [finalTrip] = await db
        .select({ wizardSteps: schema.trips.wizardSteps })
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId));

      const steps = finalTrip.wizardSteps as Record<string, unknown>;

      // Invariant: Initial step must be preserved
      expect(steps.initial_base).toBe(true);

      // Invariant: ALL 20 parallel steps MUST be present and true (zero lost updates!)
      for (const stepKey of stepKeys) {
        expect(steps[stepKey]).toBe(true);
      }
    });

    test("5.2 Concurrent insertProgram and assignStaff repository updates preserve both wizard steps", async () => {
      const tripId = randomUUID();
      extraTripIds.push(tripId);

      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة دمج البرامج والموظفين",
        titleEn: "Programs and Staffing Concurrency Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 10000,
        totalCapacity: 20,
        confirmedSeatsCount: 0,
        heldSeatsCount: 0,
        state: "draft",
        publishMode: "published",
        wizardSteps: { basics: true } as any,
        createdByAccountId: ownerAccountId,
      });

      const programsRepo = createProgramsRepository(db);
      const staffingRepo = createStaffingRepository(db);

      // Concurrently insert program and staffing assignment
      const [resProg, resStaff] = await Promise.allSettled([
        programsRepo.insertProgram({
          tenantId: defaultTenantId,
          tripId,
          titleAr: "برنامج اختباري متزامن",
          titleEn: "Concurrent Test Program",
          dayNumber: 1,
          currencyCode: "EGP",
          priceMinor: 0,
          isIncludedInBase: true,
          attachmentUrls: [],
          createdByAccountId: ownerAccountId,
        }),
        staffingRepo.updateTripStaffingGap(defaultTenantId, tripId, false),
      ]);

      expect(resProg.status).toBe("fulfilled");
      expect(resStaff.status).toBe("fulfilled");

      // Read back final wizardSteps
      const [finalTrip] = await db
        .select({ wizardSteps: schema.trips.wizardSteps })
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId));

      const steps = finalTrip.wizardSteps as Record<string, unknown>;

      expect(steps.basics).toBe(true);
      expect(steps.programs).toBe(true);
      expect(steps.staffing).toBe(true);
    });
  });

  // =========================================================================
  // 6. DATABASE CONNECTION POOL BEHAVIOR UNDER HEAVY CONCURRENT TRANSACTIONS
  // =========================================================================
  describe("6. Database Connection Pool Behavior Under Heavy Concurrent Transactions", () => {
    test("6.1 50 parallel transactions with mixed commit and rollback release all connections (0 idle in transaction)", async () => {
      const tripId = randomUUID();
      extraTripIds.push(tripId);

      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة فحص حمولة الاتصالات",
        titleEn: "Pool Stress Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 10000,
        totalCapacity: 100,
        confirmedSeatsCount: 0,
        heldSeatsCount: 0,
        state: "published",
        publishMode: "published",
        createdByAccountId: ownerAccountId,
      });

      const totalWorkers = 50;
      const workerPromises = Array.from({ length: totalWorkers }, (_, i) => {
        const shouldRollback = i % 2 === 1;
        return db.transaction(async (tx) => {
          // Perform a real query inside the transaction
          const [row] = await tx
            .select({ id: schema.trips.id })
            .from(schema.trips)
            .where(eq(schema.trips.id, tripId));

          if (shouldRollback) {
            throw new Error(`Simulated Worker Rollback #${i}`);
          }
          return row?.id;
        });
      });

      const results = await Promise.allSettled(workerPromises);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      expect(fulfilled.length).toBe(25);
      expect(rejected.length).toBe(25);

      // Invariant: Pool leak verification via pg_stat_activity
      // Zero connections left in 'idle in transaction' state
      const idleInTx = await db.execute(sql`
        SELECT count(*)::int as count
        FROM pg_stat_activity
        WHERE state = 'idle in transaction'
          AND datname = current_database();
      `);

      const idleCount = (idleInTx.rows?.[0] as any)?.count ?? 0;
      expect(idleCount).toBe(0);
    });

    test("6.2 High-contention row-level lock serialization (FOR UPDATE) executes without deadlocks (40P01)", async () => {
      const tripId = randomUUID();
      extraTripIds.push(tripId);

      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة تسلسل الأقفال",
        titleEn: "Row Lock Serialization Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 10000,
        totalCapacity: 100,
        confirmedSeatsCount: 0,
        heldSeatsCount: 0,
        state: "published",
        publishMode: "published",
        createdByAccountId: ownerAccountId,
      });

      const workerCount = 20;

      // 20 workers concurrently acquire row lock FOR UPDATE on the same trip and increment confirmedSeatsCount
      const workerPromises = Array.from({ length: workerCount }, () =>
        db.transaction(async (tx) => {
          const [trip] = await tx
            .select()
            .from(schema.trips)
            .where(eq(schema.trips.id, tripId))
            .for("update");

          if (!trip) throw new Error("Trip not found");

          await tx
            .update(schema.trips)
            .set({
              confirmedSeatsCount: sql`${schema.trips.confirmedSeatsCount} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(schema.trips.id, tripId));

          return true;
        }),
      );

      const results = await Promise.allSettled(workerPromises);

      // Verify no deadlocks occurred (error code 40P01)
      for (const res of results) {
        if (res.status === "rejected") {
          const errMsg = (res.reason as Error).message;
          expect(errMsg).not.toMatch(/40P01|deadlock detected/i);
        }
        expect(res.status).toBe("fulfilled");
      }

      // Check final counter in DB
      const [finalTrip] = await db
        .select({ confirmedSeatsCount: schema.trips.confirmedSeatsCount })
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId));

      expect(finalTrip.confirmedSeatsCount).toBe(workerCount);
    });
  });
});
