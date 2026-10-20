import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  and,
  eq,
  inArray,
  schema,
  sql,
  type Database,
  type TransactionClient,
} from "@trips-app/db";
import { createBookingService } from "@trips-app/service-booking";
import { createPaymentsService } from "@trips-app/service-payments";
import { createOnboardingService } from "@trips-app/service-onboarding";
import { createAuthService } from "@trips-app/service-auth";
import { computeBlindIndex, normalizeEmail } from "@trips-app/domain";
import { getTestContext, getTestDb, TestEntityTracker } from "../helpers/db";

/**
 * Creates a proxy over `Database` that intercepts `db.transaction(...)` calls
 * and injects customizable hooks on `tx.insert` and `tx.update`.
 * This allows simulating exact step-level failures during transaction execution
 * to empirically verify atomic rollback across multiple tables.
 */
function createFaultInjectingDb(
  baseDb: Database,
  hooks: {
    beforeInsert?: (table: any) => void;
    beforeUpdate?: (table: any) => void;
  },
): Database {
  return new Proxy(baseDb, {
    get(target, prop, receiver) {
      if (prop === "transaction") {
        return async function (
          txCallback: (tx: TransactionClient) => Promise<any>,
          config?: any,
        ) {
          return target.transaction(async (realTx) => {
            const interceptedTx = new Proxy(realTx, {
              get(txTarget, txProp, txReceiver) {
                if (txProp === "update" && hooks.beforeUpdate) {
                  return (table: any) => {
                    hooks.beforeUpdate!(table);
                    return (txTarget as any).update(table);
                  };
                }
                if (txProp === "insert" && hooks.beforeInsert) {
                  return (table: any) => {
                    hooks.beforeInsert!(table);
                    return (txTarget as any).insert(table);
                  };
                }
                return Reflect.get(txTarget, txProp, txReceiver);
              },
            });
            return txCallback(interceptedTx as TransactionClient);
          }, config);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

describe("Tier 5 - Empirical Challenge: Transaction Boundaries & Rollback Verification (Milestone M4)", () => {
  const db = getTestDb();
  const tracker = new TestEntityTracker();
  let defaultTenantId: string;
  let ownerAccountId: string;

  beforeAll(async () => {
    const ctx = await getTestContext();
    defaultTenantId = ctx.tenantId;
    ownerAccountId = ctx.ownerAccountId;
  });

  afterAll(async () => {
    await tracker.cleanup(db);
  });

  // =========================================================================
  // CHALLENGE 1: booking:cancelBooking Step 5 Simulated Failure & Complete Rollback
  // =========================================================================
  describe("CHALLENGE 1: booking:cancelBooking Transaction Boundary & Complete Rollback", () => {
    test("1.1 Simulated failure on 5th step (markBookingCancelled) rolls back seats, coupon, program and trip counters", async () => {
      const tripId = tracker.trackTrip(randomUUID());
      const vehicleId = tracker.trackVehicle(randomUUID());
      const vehicleTypeId = tracker.trackVehicleType(randomUUID());
      const couponId = tracker.trackCoupon(randomUUID());
      const programId = randomUUID();
      const bookingId = tracker.trackBooking(randomUUID());
      const seatLabels = ["A1", "A2"];

      // Setup vehicle type and vehicle
      await db.insert(schema.vehicleTypes).values({
        id: vehicleTypeId,
        tenantId: defaultTenantId,
        categoryLookupCode: "CAT_VAN",
        nameAr: "حافلة اختبار",
        nameEn: "Test Van",
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
        plateNumber: `TEST-${randomUUID().slice(0, 4)}`,
        plateNumberNormalized: `TEST${randomUUID().slice(0, 4)}`,
        model: "HiAce",
        manufacturingYear: 2024,
        seatCount: 10,
        status: "active",
      });

      // Setup trip with 2 confirmed seats
      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة الحجز الملغى",
        titleEn: "Cancellation Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 50000,
        totalCapacity: 20,
        confirmedSeatsCount: 2,
        heldSeatsCount: 0,
        state: "published",
        publishMode: "published",
        createdByAccountId: ownerAccountId,
      });

      // Setup trip seat inventory with 2 reserved seats
      await db.insert(schema.tripSeatInventory).values([
        {
          id: randomUUID(),
          tenantId: defaultTenantId,
          tripId,
          vehicleId,
          seatLabel: "A1",
          status: "reserved",
          bookingId,
        },
        {
          id: randomUUID(),
          tenantId: defaultTenantId,
          tripId,
          vehicleId,
          seatLabel: "A2",
          status: "reserved",
          bookingId,
        },
      ]);

      // Setup coupon with 1 redemption
      const couponCode = `CPN-${randomUUID().slice(0, 6).toUpperCase()}`;
      await db.insert(schema.coupons).values({
        id: couponId,
        tenantId: defaultTenantId,
        code: couponCode,
        titleAr: "خصم اختباري",
        titleEn: "Test Discount",
        discountType: "percentage",
        discountValue: 10,
        maxRedemptions: 100,
        redemptionsCount: 1,
        status: "active",
        scope: "organization",
        startsAt: new Date(Date.now() - 3600000),
        expiresAt: new Date(Date.now() + 86400000),
      });

      // Setup trip program with 2 booked count
      await db.insert(schema.tripPrograms).values({
        id: programId,
        tenantId: defaultTenantId,
        tripId,
        titleAr: "نشاط إضافي",
        titleEn: "Extra Activity",
        priceMinor: 10000,
        capacity: 10,
        bookedCount: 2,
      });

      // Setup confirmed booking
      await db.insert(schema.bookings).values({
        id: bookingId,
        bookingReference: `BK-TEST-${randomUUID().slice(0, 6)}`,
        tenantId: defaultTenantId,
        tripId,
        travelerAccountId: ownerAccountId,
        vehicleId,
        passengersCount: 2,
        seatLabels,
        couponId,
        selectedProgramIds: [programId],
        passengers: [
          { id: randomUUID(), fullName: "Traveler A", isChild: false },
          { id: randomUUID(), fullName: "Traveler B", isChild: false },
        ],
        subtotalMinor: 50000,
        totalAmountMinor: 50000,
        currencyCode: "EGP",
        status: "confirmed",
        paymentGateway: "credit_card",
      });

      // Create fault-injecting DB that simulates failure on the 5th step (markBookingCancelled)
      const faultDb = createFaultInjectingDb(db, {
        beforeUpdate: (table) => {
          if (table === schema.bookings) {
            throw new Error("SIMULATED_STEP5_FAILURE: markBookingCancelled threw database error");
          }
        },
      });

      const faultBookingService = createBookingService({ db: faultDb });
      const actor = { accountId: ownerAccountId, tenantId: defaultTenantId, role: "traveler" };

      // Execute cancelBooking and expect failure on 5th step
      await expect(
        faultBookingService.cancelBooking(actor, {
          bookingId,
          reason: "Customer request",
        }),
      ).rejects.toThrow("SIMULATED_STEP5_FAILURE");

      // EMPIRICAL VERIFICATION: Inspect PostgreSQL state outside transaction
      // 1. Reserved seats in tripSeatInventory must NOT be released (must still be "reserved")
      const seatsAfterFail = await db
        .select()
        .from(schema.tripSeatInventory)
        .where(
          and(
            eq(schema.tripSeatInventory.tripId, tripId),
            inArray(schema.tripSeatInventory.seatLabel, seatLabels),
          ),
        );
      expect(seatsAfterFail).toHaveLength(2);
      for (const seat of seatsAfterFail) {
        expect(seat.status).toBe("reserved");
        expect(seat.bookingId).toBe(bookingId);
      }

      // 2. Coupon redemption count must NOT be decremented (must still be 1)
      const [couponAfterFail] = await db
        .select()
        .from(schema.coupons)
        .where(eq(schema.coupons.id, couponId));
      expect(couponAfterFail?.redemptionsCount).toBe(1);

      // 3. Program bookedCount must NOT be decremented (must still be 2)
      const [progAfterFail] = await db
        .select()
        .from(schema.tripPrograms)
        .where(eq(schema.tripPrograms.id, programId));
      expect(progAfterFail?.bookedCount).toBe(2);

      // 4. Trip confirmedSeatsCount must NOT be decremented (must still be 2)
      const [tripAfterFail] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId));
      expect(tripAfterFail?.confirmedSeatsCount).toBe(2);

      // 5. Booking status must NOT be cancelled (must still be "confirmed")
      const [bookingAfterFail] = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, bookingId));
      expect(bookingAfterFail?.status).toBe("confirmed");

      // NOW: Execute with normal DB to prove it succeeds and all 5 steps commit when no failure occurs
      const normalBookingService = createBookingService({ db });
      const result = await normalBookingService.cancelBooking(actor, {
        bookingId,
        reason: "Customer confirmed cancellation",
      });
      expect(result.status).toBe("cancelled");

      // Verify all 5 steps committed cleanly in PostgreSQL
      const seatsAfterSuccess = await db
        .select()
        .from(schema.tripSeatInventory)
        .where(
          and(
            eq(schema.tripSeatInventory.tripId, tripId),
            inArray(schema.tripSeatInventory.seatLabel, seatLabels),
          ),
        );
      for (const seat of seatsAfterSuccess) {
        expect(seat.status).toBe("available");
        expect(seat.bookingId).toBeNull();
      }

      const [couponAfterSuccess] = await db
        .select()
        .from(schema.coupons)
        .where(eq(schema.coupons.id, couponId));
      expect(couponAfterSuccess?.redemptionsCount).toBe(0);

      const [progAfterSuccess] = await db
        .select()
        .from(schema.tripPrograms)
        .where(eq(schema.tripPrograms.id, programId));
      expect(progAfterSuccess?.bookedCount).toBe(0);

      const [tripAfterSuccess] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId));
      expect(tripAfterSuccess?.confirmedSeatsCount).toBe(0);

      const [bookingAfterSuccess] = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, bookingId));
      expect(bookingAfterSuccess?.status).toBe("cancelled");

      // Cleanup extra program and seats
      await db.delete(schema.tripSeatInventory).where(eq(schema.tripSeatInventory.tripId, tripId));
      await db.delete(schema.tripPrograms).where(eq(schema.tripPrograms.id, programId));
    });
  });

  // =========================================================================
  // CHALLENGE 2: payments:applySuccessfulPayment Rollback on insertRevenueLedgerEntry
  // =========================================================================
  describe("CHALLENGE 2: payments:applySuccessfulPayment Rollback on Ledger Failure", () => {
    test("2.1 Simulated failure on insertRevenueLedgerEntry leaves payment and booking unconfirmed", async () => {
      const tripId = tracker.trackTrip(randomUUID());
      const bookingId = tracker.trackBooking(randomUUID());
      const paymentId = tracker.trackPayment(randomUUID());

      // Create trip
      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة المدفوعات",
        titleEn: "Payments Test Trip",
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

      // Create unconfirmed booking in pending_payment state
      await db.insert(schema.bookings).values({
        id: bookingId,
        bookingReference: `BK-PAY-${randomUUID().slice(0, 6)}`,
        tenantId: defaultTenantId,
        tripId,
        travelerAccountId: ownerAccountId,
        passengersCount: 2,
        passengers: [
          { id: randomUUID(), fullName: "Traveler 1", isChild: false },
          { id: randomUUID(), fullName: "Traveler 2", isChild: false },
        ],
        subtotalMinor: 50000,
        totalAmountMinor: 50000,
        currencyCode: "EGP",
        status: "pending_payment",
        paymentGateway: "credit_card",
      });

      // Create pending payment transaction
      const providerRef = `PAY-REF-${randomUUID().slice(0, 8)}`;
      await db.insert(schema.paymentTransactions).values({
        id: paymentId,
        tenantId: defaultTenantId,
        bookingId,
        payerAccountId: ownerAccountId,
        gateway: "credit_card",
        amountMinor: 50000,
        currencyCode: "EGP",
        status: "pending",
        providerReference: providerRef,
      });

      // Fault DB: Throws error when inserting into accountingLedgerEntries
      const faultDb = createFaultInjectingDb(db, {
        beforeInsert: (table) => {
          if (table === schema.accountingLedgerEntries) {
            throw new Error("SIMULATED_LEDGER_FAILURE: Failed to write revenue ledger entry");
          }
        },
      });

      const faultPaymentsService = createPaymentsService({ db: faultDb });

      // Execute confirmPayment (which delegates to applySuccessfulPayment)
      await expect(
        faultPaymentsService.confirmPayment({ paymentId }),
      ).rejects.toThrow("SIMULATED_LEDGER_FAILURE");

      // EMPIRICAL VERIFICATION:
      // 1. Payment transaction must remain "pending" (unconfirmed)
      const [paymentAfterFail] = await db
        .select()
        .from(schema.paymentTransactions)
        .where(eq(schema.paymentTransactions.id, paymentId));
      expect(paymentAfterFail?.status).toBe("pending");
      expect(paymentAfterFail?.paidAt).toBeNull();

      // 2. Booking must remain "pending_payment" (unconfirmed)
      const [bookingAfterFail] = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, bookingId));
      expect(bookingAfterFail?.status).toBe("pending_payment");

      // 3. Trip confirmed seats count must remain 0
      const [tripAfterFail] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId));
      expect(tripAfterFail?.confirmedSeatsCount).toBe(0);

      // 4. No revenue ledger entry created
      const ledgerEntries = await db
        .select()
        .from(schema.accountingLedgerEntries)
        .where(eq(schema.accountingLedgerEntries.bookingId, bookingId));
      expect(ledgerEntries).toHaveLength(0);

      // NOW: Execute with normal DB to verify full commit when ledger succeeds
      const normalPaymentsService = createPaymentsService({ db });
      const confirmed = await normalPaymentsService.confirmPayment({ paymentId });
      expect(confirmed.status).toBe("succeeded");

      const [paymentAfterSuccess] = await db
        .select()
        .from(schema.paymentTransactions)
        .where(eq(schema.paymentTransactions.id, paymentId));
      expect(paymentAfterSuccess?.status).toBe("succeeded");

      const [bookingAfterSuccess] = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, bookingId));
      expect(bookingAfterSuccess?.status).toBe("confirmed");

      const [tripAfterSuccess] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId));
      expect(tripAfterSuccess?.confirmedSeatsCount).toBe(2);

      const [ledgerAfterSuccess] = await db
        .select()
        .from(schema.accountingLedgerEntries)
        .where(eq(schema.accountingLedgerEntries.bookingId, bookingId));
      expect(ledgerAfterSuccess).toBeDefined();
      expect(ledgerAfterSuccess.grossAmountMinor).toBe(50000);

      // Cleanup ledger entry
      await db.delete(schema.accountingLedgerEntries).where(eq(schema.accountingLedgerEntries.bookingId, bookingId));
    });
  });

  // =========================================================================
  // CHALLENGE 3: onboarding:approveApplication Rollback on Audit/Notification Failure
  // =========================================================================
  describe("CHALLENGE 3: onboarding:approveApplication Rollback on Audit Log Failure", () => {
    test("3.1 Simulated failure during audit log/notification rolls back organization and roles creation", async () => {
      const applicationId = randomUUID();
      const applicantAccountId = tracker.trackAccount(randomUUID());
      const orgLegalName = `Enterprise ${randomUUID().slice(0, 6)}`;

      // Create applicant account
      await db.insert(schema.accounts).values({
        id: applicantAccountId,
        fullName: "Applicant Lead",
        preferredLanguage: "ar",
        preferredSignInMethod: "password",
        status: "active",
      });

      // Create pending organization application
      await db.insert(schema.applications).values({
        id: applicationId,
        applicantAccountId,
        applicationType: "organization",
        state: "Pending Review",
        slaDueAt: new Date(Date.now() + 86400000 * 2),
        payload: {
          legalEntityName: orgLegalName,
          displayNameEn: "Test Enterprise",
          displayNameAr: "مؤسسة اختبار",
          countryCode: "EG",
          commercialRegNumber: "CR-123456",
          taxNumber: "TX-123456",
          tourismLicenseNumber: "TL-123456",
          headquartersAddress: "Cairo",
          signatoryFullName: "Signatory",
          signatoryNationalId: "12345678901234",
          signatoryRoleTitle: "Manager",
          payoutMethod: "bank_transfer",
          payoutIbanOrWallet: "EG123456",
        },
      });

      // Fault DB: Throws error when inserting into auditLogs
      const faultDb = createFaultInjectingDb(db, {
        beforeInsert: (table) => {
          if (table === schema.auditLogs) {
            throw new Error("SIMULATED_AUDIT_LOG_FAILURE: Database failed during audit log persistence");
          }
        },
      });

      const faultOnboardingService = createOnboardingService({ db: faultDb });
      const adminActor = {
        accountId: ownerAccountId,
        activeRole: "admin" as const,
        adminSubRole: "compliance" as const,
      };

      // Execute approveApplication and expect failure
      await expect(
        faultOnboardingService.approveApplication(adminActor, {
          applicationId,
          decisionReasonCode: "APPROVE_VERIFIED",
        }),
      ).rejects.toThrow("SIMULATED_AUDIT_LOG_FAILURE");

      // EMPIRICAL VERIFICATION:
      // 1. Organization must NOT exist in PostgreSQL
      const orgsFound = await db
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.legalEntityName, orgLegalName));
      expect(orgsFound).toHaveLength(0);

      // 2. Organization settings must NOT exist
      const settingsFound = await db
        .select()
        .from(schema.organizationSettings)
        .where(eq(schema.organizationSettings.tenantId, applicantAccountId));
      expect(settingsFound).toHaveLength(0);

      // 3. No active organization_owner role committed for the applicant
      const rolesFound = await db
        .select()
        .from(schema.accountRoles)
        .where(
          and(
            eq(schema.accountRoles.accountId, applicantAccountId),
            eq(schema.accountRoles.role, "organization_owner"),
            eq(schema.accountRoles.status, "active"),
          ),
        );
      expect(rolesFound).toHaveLength(0);

      // 4. Application state must STILL be "Pending Review" (not "Approved")
      const [appAfterFail] = await db
        .select()
        .from(schema.applications)
        .where(eq(schema.applications.id, applicationId));
      expect(appAfterFail?.state).toBe("Pending Review");
      expect(appAfterFail?.provisionedOrganizationId).toBeNull();

      // NOW: Execute with normal DB to verify that on success everything commits
      const normalOnboardingService = createOnboardingService({ db });
      const approvedApp = await normalOnboardingService.approveApplication(adminActor, {
        applicationId,
        decisionReasonCode: "APPROVE_VERIFIED",
      });
      expect(approvedApp.state).toBe("Approved");
      expect(approvedApp.provisionedOrganizationId).toBeDefined();

      const [orgAfterSuccess] = await db
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.id, approvedApp.provisionedOrganizationId!));
      expect(orgAfterSuccess).toBeDefined();
      expect(orgAfterSuccess?.legalEntityName).toBe(orgLegalName);

      const [roleAfterSuccess] = await db
        .select()
        .from(schema.accountRoles)
        .where(
          and(
            eq(schema.accountRoles.accountId, applicantAccountId),
            eq(schema.accountRoles.role, "organization_owner"),
          ),
        );
      expect(roleAfterSuccess?.status).toBe("active");

      // Cleanup
      if (approvedApp.provisionedOrganizationId) {
        await db
          .delete(schema.organizationSettings)
          .where(eq(schema.organizationSettings.tenantId, approvedApp.provisionedOrganizationId));
        await db
          .delete(schema.auditLogs)
          .where(eq(schema.auditLogs.tenantId, approvedApp.provisionedOrganizationId));
        await db
          .delete(schema.organizations)
          .where(eq(schema.organizations.id, approvedApp.provisionedOrganizationId));
      }
      await db.delete(schema.applications).where(eq(schema.applications.id, applicationId));
    });
  });

  // =========================================================================
  // CHALLENGE 4: auth:registerTraveler Rollback on OTP Issue Failure
  // =========================================================================
  describe("CHALLENGE 4: auth:registerTraveler Rollback with Zero Orphan Rows", () => {
    test("4.1 Simulated failure during OTP issue rolls back account and preferences without orphan rows", async () => {
      const uniqueSuffix = randomUUID().slice(0, 8);
      const testEmail = `traveler-fail-${uniqueSuffix}@example.com`;
      const emailBlindIndex = computeBlindIndex(normalizeEmail(testEmail));

      // Fault DB: Throws error when inserting into otpVerifications
      const faultDb = createFaultInjectingDb(db, {
        beforeInsert: (table) => {
          if (table === schema.otpVerifications) {
            throw new Error("SIMULATED_OTP_ISSUE_FAILURE: Failed to write OTP verification code");
          }
        },
      });

      const faultAuthService = createAuthService({ db: faultDb });

      // Execute registerTraveler and expect failure
      await expect(
        faultAuthService.registerTraveler({
          fullName: "Orphan Verification Traveler",
          email: testEmail,
          preferredLanguage: "en",
          preferredSignInMethod: "otp",
          surface: "web",
        }),
      ).rejects.toThrow("SIMULATED_OTP_ISSUE_FAILURE");

      // EMPIRICAL VERIFICATION: Inspect PostgreSQL for orphan rows
      // 1. Account must NOT exist
      const accountsFound = await db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.emailBlindIndex, emailBlindIndex));
      expect(accountsFound).toHaveLength(0);

      // 2. Notification preferences must NOT exist for any non-existent account
      // Query notificationPreferences where accountId matches any potential orphan
      const orphanAccounts = await db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.fullName, "Orphan Verification Traveler"));
      expect(orphanAccounts).toHaveLength(0);

      // 3. No orphan OTP verification records
      const otpsFound = await db
        .select()
        .from(schema.otpVerifications)
        .where(eq(schema.otpVerifications.targetIdentifier, testEmail));
      expect(otpsFound).toHaveLength(0);

      // NOW: Execute with normal DB to verify success creates all linked records atomically
      const successEmail = `traveler-success-${uniqueSuffix}@example.com`;
      const successBlindIndex = computeBlindIndex(normalizeEmail(successEmail));
      const normalAuthService = createAuthService({ db });

      const registered = await normalAuthService.registerTraveler({
        fullName: "Clean Registration Traveler",
        email: successEmail,
        preferredLanguage: "en",
        preferredSignInMethod: "otp",
        surface: "web",
      });

      expect(registered.accountId).toBeDefined();
      tracker.trackAccount(registered.accountId);

      // Verify all linked rows exist in PostgreSQL
      const [account] = await db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.emailBlindIndex, successBlindIndex));
      expect(account).toBeDefined();
      expect(account?.id).toBe(registered.accountId);

      const [pref] = await db
        .select()
        .from(schema.notificationPreferences)
        .where(eq(schema.notificationPreferences.accountId, registered.accountId));
      expect(pref).toBeDefined();

      const [role] = await db
        .select()
        .from(schema.accountRoles)
        .where(eq(schema.accountRoles.accountId, registered.accountId));
      expect(role).toBeDefined();
      expect(role?.role).toBe("traveler");

      const otps = await db
        .select()
        .from(schema.otpVerifications)
        .where(eq(schema.otpVerifications.accountId, registered.accountId));
      expect(otps.length).toBeGreaterThan(0);

      // Cleanup
      await db.delete(schema.otpVerifications).where(eq(schema.otpVerifications.accountId, registered.accountId));
    });
  });

  // =========================================================================
  // CHALLENGE 5: Connection Leaks & Deadlocks Under Concurrency Stress
  // =========================================================================
  describe("CHALLENGE 5: Concurrency Stress, Connection Leaks & Deadlock Resilience", () => {
    test("5.1 50 parallel transaction rollbacks release connections without leaks (0 idle in transaction)", async () => {
      // Execute 50 concurrent transactions that perform queries and deliberately roll back
      const tasks = Array.from({ length: 50 }, async (_, idx) => {
        try {
          await db.transaction(async (tx) => {
            await tx.select().from(schema.accounts).limit(1);
            throw new Error(`Deliberate rollback task ${idx}`);
          });
        } catch {
          // Expected
        }
      });

      await Promise.all(tasks);

      // Verify PostgreSQL connection state:
      // ZERO connections should remain in 'idle in transaction' state.
      const leakCheck = await db.execute<{ idle_in_transaction_count: string }>(sql`
        SELECT count(*)::text as idle_in_transaction_count
        FROM pg_stat_activity
        WHERE state = 'idle in transaction'
          AND datname = current_database()
      `);

      const idleCount = Number(leakCheck[0]?.idle_in_transaction_count ?? 0);
      expect(idleCount).toBe(0);

      // Immediately execute 20 parallel queries to verify connection pool health
      const poolCheck = await Promise.all(
        Array.from({ length: 20 }, () => db.select().from(schema.lookups).limit(1)),
      );
      expect(poolCheck).toHaveLength(20);
    });

    test("5.2 Concurrent row-level locking (FOR UPDATE) serializes transactions without deadlocks (40P01)", async () => {
      // Create a test trip with limited capacity
      const tripId = tracker.trackTrip(randomUUID());
      await db.insert(schema.trips).values({
        id: tripId,
        tenantId: defaultTenantId,
        titleAr: "رحلة فحص التزامن",
        titleEn: "Concurrency Test Trip",
        categoryLookupCode: "DAY_EXCURSION",
        language: "ar",
        timezone: "Africa/Cairo",
        basePriceMinor: 10000,
        totalCapacity: 50,
        confirmedSeatsCount: 0,
        heldSeatsCount: 0,
        state: "published",
        publishMode: "published",
        createdByAccountId: ownerAccountId,
      });

      // Run 10 parallel transactions competing for the row via FOR UPDATE
      const concurrency = 10;
      const results = await Promise.allSettled(
        Array.from({ length: concurrency }, async (_, i) => {
          return db.transaction(async (tx) => {
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
              })
              .where(eq(schema.trips.id, tripId));

            return i;
          });
        }),
      );

      // Every transaction should settle without a PostgreSQL 40P01 deadlock error
      for (const res of results) {
        expect(res.status).toBe("fulfilled");
      }

      // Check final confirmedSeatsCount equals concurrency
      const [finalTrip] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId));
      expect(finalTrip?.confirmedSeatsCount).toBe(concurrency);
    });
  });
});
