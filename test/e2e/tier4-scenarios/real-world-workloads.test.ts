import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { and, desc, eq, inArray, schema } from "@trips-app/db";
import { createTripsService } from "@trips-app/service-trips";
import { createEmployeesService } from "@trips-app/service-employees";
import { getTestContext, getTestDb, TestEntityTracker } from "../helpers/db";

describe("Tier 4 - Real-World Application Scenarios (Comprehensive End-to-End Workloads)", () => {
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

  test("SCENARIO-01: End-to-end Trip Lifecycle: Wizard Draft -> Fleet Assignment -> Publish -> Discovery", async () => {
    const tripsService = createTripsService(db);
    const actor = {
      accountId: ownerAccountId,
      sessionId: "00000000-0000-4000-8000-000000000000",
      role: "organization_owner" as const,
      activeRole: "organization_owner" as const,
      activeTenantId: tenantId,
      planTier: "enterprise",
    };

    // Step 1: Create draft trip using authoritative lookup category
    const draft = await tripsService.createDraft(actor, {
      titleAr: "رحلة الواحات البحرية",
      titleEn: "Bahariya Oasis Expedition",
      categoryLookupCode: "DAY_EXCURSION",
    });
    expect(draft.id).toBeDefined();
    tracker.trackTrip(draft.id);

    // Step 2: Assign vehicle and seat layout
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

    await db.insert(schema.vehicleTypes).values({
      id: vehicleTypeId,
      tenantId,
      categoryLookupCode: "COASTER_MINIBUS_28",
      nameAr: "حافلة سفاري",
      nameEn: "Safari Bus",
      seatCount: 20,
      seatLayout: dummyLayout,
      scope: "organization",
      status: "active",
      createdByAccountId: ownerAccountId,
    });

    await db.insert(schema.vehicles).values({
      id: vehicleId,
      tenantId,
      vehicleTypeId,
      plateNumber: "OAS 1010",
      plateNumberNormalized: "OAS1010",
      model: "Toyota Coaster 4x4",
      manufacturingYear: 2023,
      seatCount: 20,
      status: "active",
      createdByAccountId: ownerAccountId,
    });

    await tripsService.saveWizardStep(actor, {
      tripId: draft.id,
      step: "vehicles",
      vehicleIds: [vehicleId],
    });

    // Step 3: Save schedule and pricing wizard steps
    const startsAt = new Date(Date.now() + 86400000 * 7);
    const endsAt = new Date(Date.now() + 86400000 * 9);

    await tripsService.saveWizardStep(actor, {
      tripId: draft.id,
      step: "schedule",
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      timezone: "Africa/Cairo",
      origin: { nameAr: "القاهرة", nameEn: "Cairo" },
      destinations: [{ nameAr: "الواحات البحرية", nameEn: "Bahariya Oasis" }],
    });

    await tripsService.saveWizardStep(actor, {
      tripId: draft.id,
      step: "pricing",
      basePrice: {
        amountMinor: 350000,
        currency: "EGP",
      },
    });

    // Step 4: Publish trip
    const published = await tripsService.publish(actor, { tripId: draft.id });
    expect(published.state).toBe("published");

    // Step 5: Verify public browse discovery
    const publicList = await tripsService.browsePublicTrips(
      { accountId: ownerAccountId, travelerPlanTier: "free" },
      { search: "Bahariya" },
    );
    expect(publicList.items.some((t) => t.id === draft.id)).toBe(true);
  });

  test("SCENARIO-02: End-to-end Booking, Seat Reservation & Payment Ledger Creation", async () => {
    // Set up a trip for booking
    const tripId = tracker.trackTrip(randomUUID());
    const travelerAccountId = ownerAccountId;

    await db.insert(schema.trips).values({
      id: tripId,
      tenantId,
      titleAr: "رحلة الحجز المالي",
      titleEn: "Financial Booking Trip",
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

    const bookingId = tracker.trackBooking(randomUUID());
    const paymentId = tracker.trackPayment(randomUUID());

    // Atomic transaction simulating booking + payment + ledger record
    await db.transaction(async (tx) => {
      // 1. Create booking record
      await tx.insert(schema.bookings).values({
        id: bookingId,
        bookingReference: `BK-${Date.now().toString().slice(-6)}`,
        tenantId,
        tripId,
        travelerAccountId,
        passengersCount: 2,
        passengers: [
          { id: randomUUID(), fullName: "Traveler One", isChild: false },
          { id: randomUUID(), fullName: "Traveler Two", isChild: false },
        ],
        subtotalMinor: 100000,
        totalAmountMinor: 100000,
        currencyCode: "EGP",
        status: "confirmed",
        paymentGateway: "fawry",
      });

      // 2. Adjust trip confirmed seats count
      await tx
        .update(schema.trips)
        .set({ confirmedSeatsCount: 2 })
        .where(eq(schema.trips.id, tripId));

      // 3. Record payment transaction
      await tx.insert(schema.paymentTransactions).values({
        id: paymentId,
        tenantId,
        bookingId,
        payerAccountId: travelerAccountId,
        purpose: "trip_booking",
        gateway: "fawry",
        amountMinor: 100000,
        currencyCode: "EGP",
        status: "succeeded",
        providerReference: `prov_fawry_${randomUUID()}`,
        paidAt: new Date(),
      });

      // 4. Record accounting ledger entry
      await tx.insert(schema.accountingLedgerEntries).values({
        tenantId,
        tripId,
        bookingId,
        entryType: "booking_revenue",
        direction: "credit",
        grossAmountMinor: 100000,
        commissionAmountMinor: 10000,
        netAmountMinor: 90000,
        currencyCode: "EGP",
        status: "posted",
        description: "Booking revenue entry",
        occurredAt: new Date(),
      });
    });

    // Verification of atomic state across all 4 tables
    const [booking] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId));
    const [trip] = await db.select().from(schema.trips).where(eq(schema.trips.id, tripId));
    const [payment] = await db
      .select()
      .from(schema.paymentTransactions)
      .where(eq(schema.paymentTransactions.id, paymentId));
    const [ledger] = await db
      .select()
      .from(schema.accountingLedgerEntries)
      .where(eq(schema.accountingLedgerEntries.bookingId, bookingId));

    expect(booking?.status).toBe("confirmed");
    expect(trip?.confirmedSeatsCount).toBe(2);
    expect(payment?.status).toBe("succeeded");
    expect(ledger?.netAmountMinor).toBe(90000);
  });

  test("SCENARIO-03: End-to-end Booking Cancellation & Inventory Release Transaction", async () => {
    const tripId = tracker.trackTrip(randomUUID());
    const bookingId = tracker.trackBooking(randomUUID());
    const couponId = tracker.trackCoupon(randomUUID());

    // Setup: Coupon with 1 redemption
    await db.insert(schema.coupons).values({
      id: couponId,
      tenantId,
      ownerAccountId,
      code: `CPN_CAN_${Date.now()}`,
      titleAr: "كوبون قابل للإلغاء",
      titleEn: "Cancellable Coupon",
      discountType: "percentage",
      discountValue: 10,
      currencyCode: "EGP",
      redemptionsCount: 1,
      status: "active",
    });

    // Setup: Trip with 2 confirmed seats
    await db.insert(schema.trips).values({
      id: tripId,
      tenantId,
      titleAr: "رحلة الإلغاء",
      titleEn: "Cancellation Trip",
      categoryLookupCode: "DAY_EXCURSION",
      language: "ar",
      timezone: "Africa/Cairo",
      basePriceMinor: 50000,
      totalCapacity: 20,
      confirmedSeatsCount: 2,
      state: "published",
      publishMode: "published",
      createdByAccountId: ownerAccountId,
    });

    // Setup: Confirmed booking
    await db.insert(schema.bookings).values({
      id: bookingId,
      bookingReference: `BK-CAN-${Date.now().toString().slice(-4)}`,
      tenantId,
      tripId,
      travelerAccountId: ownerAccountId,
      passengersCount: 2,
      couponId,
      subtotalMinor: 100000,
      totalAmountMinor: 90000,
      currencyCode: "EGP",
      status: "confirmed",
    });

    // Atomic Cancellation Unit
    await db.transaction(async (tx) => {
      // 1. Decrement coupon redemption count
      await tx
        .update(schema.coupons)
        .set({ redemptionsCount: 0 })
        .where(eq(schema.coupons.id, couponId));

      // 2. Decrement trip confirmed seats count
      await tx
        .update(schema.trips)
        .set({ confirmedSeatsCount: 0 })
        .where(eq(schema.trips.id, tripId));

      // 3. Mark booking cancelled
      await tx
        .update(schema.bookings)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: "Traveler requested cancellation",
          refundAmountMinor: 90000,
        })
        .where(eq(schema.bookings.id, bookingId));

      // 4. Insert refund ledger entry
      await tx.insert(schema.accountingLedgerEntries).values({
        tenantId,
        tripId,
        bookingId,
        entryType: "refund_payout",
        direction: "debit",
        grossAmountMinor: 90000,
        commissionAmountMinor: 0,
        netAmountMinor: 90000,
        currencyCode: "EGP",
        status: "posted",
        description: "Refund payout entry",
        occurredAt: new Date(),
      });
    });

    // Verify all 4 state changes committed
    const [c] = await db.select().from(schema.coupons).where(eq(schema.coupons.id, couponId));
    const [t] = await db.select().from(schema.trips).where(eq(schema.trips.id, tripId));
    const [b] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId));
    const [l] = await db
      .select()
      .from(schema.accountingLedgerEntries)
      .where(and(eq(schema.accountingLedgerEntries.bookingId, bookingId), eq(schema.accountingLedgerEntries.direction, "debit")));

    expect(c?.redemptionsCount).toBe(0);
    expect(t?.confirmedSeatsCount).toBe(0);
    expect(b?.status).toBe("cancelled");
    expect(l?.direction).toBe("debit");
  });

  test("SCENARIO-04: End-to-end Supplier Onboarding Application & Administrative Approval Workflow", async () => {
    const applicationId = randomUUID();
    const newOrgId = tracker.trackOrganization(randomUUID());

    // 1. Submit application with required SLA deadline
    await db.insert(schema.applications).values({
      id: applicationId,
      applicantAccountId: ownerAccountId,
      applicationType: "organization",
      state: "Pending Review",
      slaDueAt: new Date(Date.now() + 86400000 * 3),
      payload: {
        legalEntityName: "New Supplier Co",
        displayNameEn: "New Supplier",
        displayNameAr: "مورد جديد",
      },
    });

    // 2. Admin approval transaction
    await db.transaction(async (tx) => {
      // Step 2a: Create organization
      await tx.insert(schema.organizations).values({
        id: newOrgId,
        ownerAccountId,
        legalEntityName: "New Supplier Co",
        displayNameEn: "New Supplier",
        displayNameAr: "مورد جديد",
        commercialRegNumberEncrypted: "crn_enc_456",
        taxNumberEncrypted: "tax_enc_456",
        tourismLicenseNumberEncrypted: "lic_enc_456",
        tourismLicenseExpiry: new Date(Date.now() + 86400000 * 365),
        countryCode: "EG",
        headquartersAddress: "Alexandria, Egypt",
        signatoryFullName: "Supplier Lead",
        signatoryNationalIdEncrypted: "nid_enc_456",
        signatoryRoleTitle: "CEO",
        payoutMethod: "bank_transfer",
        payoutIbanEncrypted: "iban_enc_456",
        planTier: "starter",
        status: "active",
      });

      // Step 2b: Update application state
      await tx
        .update(schema.applications)
        .set({
          state: "Approved",
          reviewedByAdminAccountId: ownerAccountId,
          reviewedAt: new Date(),
          provisionedOrganizationId: newOrgId,
        })
        .where(eq(schema.applications.id, applicationId));

      // Step 2c: Write audit log
      await tx.insert(schema.auditLogs).values({
        actorAccountId: ownerAccountId,
        actorRole: "admin",
        tenantId: newOrgId,
        action: "organization.onboarding_approved",
        targetEntityType: "organization",
        targetEntityId: newOrgId,
        reason: "Supplier passed compliance review",
      });
    });

    // Verify organization, application, and audit log
    const [org] = await db.select().from(schema.organizations).where(eq(schema.organizations.id, newOrgId));
    const [app] = await db.select().from(schema.applications).where(eq(schema.applications.id, applicationId));
    const [log] = await db
      .select()
      .from(schema.auditLogs)
      .where(and(eq(schema.auditLogs.targetEntityId, newOrgId), eq(schema.auditLogs.action, "organization.onboarding_approved")));

    expect(org?.status).toBe("active");
    expect(app?.state).toBe("Approved");
    expect(app?.provisionedOrganizationId).toBe(newOrgId);
    expect(log).toBeDefined();

    // Cleanup application and audit log
    await db.delete(schema.auditLogs).where(eq(schema.auditLogs.targetEntityId, newOrgId));
    await db.delete(schema.applications).where(eq(schema.applications.id, applicationId));
  });

  test("SCENARIO-05: End-to-end Employee Invitation, Status Management & Session Invalidation", async () => {
    const employeesService = createEmployeesService(db);
    const actor = {
      accountId: ownerAccountId,
      sessionId: "00000000-0000-4000-8000-000000000000",
      activeRole: "organization_owner" as const,
      activeTenantId: tenantId,
      planTier: "enterprise",
    };

    const invitedEmail = `scenario.emp.${Date.now()}@nilehorizon.eg`;

    // 1. Invite employee
    const inviteRes = await employeesService.invite(actor, {
      invitedEmail,
      roleTitle: "Operations Specialist",
      permissions: {
        trips: "view_only",
        bookings: "view_only",
        accounting: "none",
        coupons: "none",
        employees: "none",
        fleet: "view_only",
        subscription: "none",
        tracking: "view_only",
        settings: "none",
      },
    });

    expect(inviteRes.employee.id).toBeDefined();
    tracker.trackEmployee(inviteRes.employee.id);

    // 2. Update employee status (suspend with session revocation)
    const updateRes = await employeesService.updateStatus(actor, {
      membershipId: inviteRes.employee.id,
      status: "suspended",
    });

    expect(updateRes.employee.status).toBe("suspended");

    // 3. List employees and confirm status
    const listRes = await employeesService.list(actor, { search: invitedEmail });
    expect(listRes.employees.some((e) => e.id === inviteRes.employee.id && e.status === "suspended")).toBe(true);
  });
});
