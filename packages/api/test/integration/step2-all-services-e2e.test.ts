import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createRouterClient } from "@orpc/server";
import {
  createDb,
  demoAccountId,
  type DemoSeedSummary,
  inArray,
  schema,
  seedDemoData,
} from "@trips-app/db";
import type { Context } from "@trips-app/rpc";
import { createFleetService } from "@trips-app/service-fleet";
import { createTripsService } from "@trips-app/service-trips";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { appRouter } from "../../src/routers/index";

function resolveTestDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = resolve(import.meta.dir, "../../../../apps/server/.env");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf8");
    const match = content.match(/^DATABASE_URL=(.+)$/m);
    if (match?.[1]) return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return "postgresql://postgres:postgres@localhost:5432/trips";
}

describe("Integration: All 17 Remaining Services End-to-End (Operations, Commerce & Execution)", () => {
  const db = createDb({ DATABASE_URL: resolveTestDatabaseUrl() });
  const fleetService = createFleetService(db);
  const tripsService = createTripsService(db);
  let summary: DemoSeedSummary;

  const createdTripIds: string[] = [];
  const createdVehicleIds: string[] = [];
  const createdVehicleTypeIds: string[] = [];
  const createdProgramIds: string[] = [];
  const createdAvailabilityBlockIds: string[] = [];
  const createdNegotiationIds: string[] = [];
  const createdCouponIds: string[] = [];
  const createdBookingIds: string[] = [];
  const createdPaymentIds: string[] = [];
  const createdLedgerEntryIds: string[] = [];
  const createdAlbumIds: string[] = [];
  const createdLabTestIds: string[] = [];
  const createdNotificationIds: string[] = [];

  function makeClient(auth: NonNullable<Context["auth"]> | null) {
    return createRouterClient(appRouter, {
      context: {
        db,
        requestId: `e2e-${randomUUID()}`,
        locale: "en",
        ipAddress: "127.0.0.1",
        auth,
      } as Context,
    });
  }

  beforeAll(async () => {
    summary = await seedDemoData(db);
  });

  afterAll(async () => {
    if (createdNotificationIds.length > 0) {
      await db
        .delete(schema.notificationMessages)
        .where(inArray(schema.notificationMessages.id, createdNotificationIds));
    }
    if (createdLabTestIds.length > 0) {
      await db
        .delete(schema.driverLabTests)
        .where(inArray(schema.driverLabTests.id, createdLabTestIds));
    }
    if (createdAlbumIds.length > 0) {
      await db
        .delete(schema.tripPhotoAlbums)
        .where(inArray(schema.tripPhotoAlbums.id, createdAlbumIds));
    }
    if (createdLedgerEntryIds.length > 0) {
      await db
        .delete(schema.accountingLedgerEntries)
        .where(inArray(schema.accountingLedgerEntries.id, createdLedgerEntryIds));
    }
    if (createdPaymentIds.length > 0) {
      await db
        .delete(schema.paymentTransactions)
        .where(inArray(schema.paymentTransactions.id, createdPaymentIds));
    }
    if (createdBookingIds.length > 0) {
      await db
        .delete(schema.parentChildLinks)
        .where(inArray(schema.parentChildLinks.bookingId, createdBookingIds));
      await db
        .delete(schema.checkInRecords)
        .where(inArray(schema.checkInRecords.bookingId, createdBookingIds));
      await db.delete(schema.bookings).where(inArray(schema.bookings.id, createdBookingIds));
    }
    if (createdCouponIds.length > 0) {
      await db.delete(schema.coupons).where(inArray(schema.coupons.id, createdCouponIds));
    }
    if (createdNegotiationIds.length > 0) {
      await db
        .delete(schema.supplierNegotiations)
        .where(inArray(schema.supplierNegotiations.id, createdNegotiationIds));
    }
    if (createdAvailabilityBlockIds.length > 0) {
      await db
        .delete(schema.supplierAvailabilityBlocks)
        .where(inArray(schema.supplierAvailabilityBlocks.id, createdAvailabilityBlockIds));
    }
    if (createdProgramIds.length > 0) {
      await db
        .delete(schema.tripPrograms)
        .where(inArray(schema.tripPrograms.id, createdProgramIds));
    }
    if (createdTripIds.length > 0) {
      await db
        .delete(schema.parentChildLinks)
        .where(inArray(schema.parentChildLinks.tripId, createdTripIds));
      await db
        .delete(schema.checkInRecords)
        .where(inArray(schema.checkInRecords.tripId, createdTripIds));
      await db.delete(schema.bookings).where(inArray(schema.bookings.tripId, createdTripIds));
      await db
        .delete(schema.tripTrackingEvents)
        .where(inArray(schema.tripTrackingEvents.tripId, createdTripIds));
      await db
        .delete(schema.tripSeatInventory)
        .where(inArray(schema.tripSeatInventory.tripId, createdTripIds));
      await db
        .delete(schema.moderatorAssignments)
        .where(inArray(schema.moderatorAssignments.tripId, createdTripIds));
      await db.delete(schema.trips).where(inArray(schema.trips.id, createdTripIds));
    }
    if (createdVehicleIds.length > 0) {
      await db.delete(schema.vehicles).where(inArray(schema.vehicles.id, createdVehicleIds));
    }
    if (createdVehicleTypeIds.length > 0) {
      await db
        .delete(schema.vehicleTypes)
        .where(inArray(schema.vehicleTypes.id, createdVehicleTypeIds));
    }
  });

  test("1. Operations Domain: Programs, Staffing, Availability, Negotiation, Seats, and Coupons end-to-end", async () => {
    const enterpriseTenantId = summary.ids.organizations.nileHorizonEnterprise;
    const ownerId = demoAccountId(summary, "owner@nilehorizon.eg");
    const driverBasicId = demoAccountId(summary, "driver.basic@example.com");
    const orgDriverId = demoAccountId(summary, "org.driver@nilehorizon.eg");
    const orgPhotoId = demoAccountId(summary, "org.photo@nilehorizon.eg");
    const moderatorId = demoAccountId(summary, "moderator.bus1@nilehorizon.eg");
    const vipTravelerId = demoAccountId(summary, "traveler.vip@example.com");
    const freeTravelerId = demoAccountId(summary, "traveler.free@example.com");
    const superAdminId = demoAccountId(summary, "superadmin@trips-enjoy.com");

    const ownerClient = makeClient({
      accountId: ownerId,
      sessionId: randomUUID(),
      activeRole: "organization_owner",
      activeTenantId: enterpriseTenantId,
      planTier: "enterprise",
      adminSubRole: null,
      moderatorTripId: null,
      moderatorVehicleId: null,
    });

    const driverClient = makeClient({
      accountId: driverBasicId,
      sessionId: randomUUID(),
      activeRole: "platform_driver",
      activeTenantId: null,
      planTier: "basic",
      adminSubRole: null,
      moderatorTripId: null,
      moderatorVehicleId: null,
    });

    const vipTravelerClient = makeClient({
      accountId: vipTravelerId,
      sessionId: randomUUID(),
      activeRole: "traveler",
      activeTenantId: null,
      planTier: "vip",
      adminSubRole: null,
      moderatorTripId: null,
      moderatorVehicleId: null,
    });

    const freeTravelerClient = makeClient({
      accountId: freeTravelerId,
      sessionId: randomUUID(),
      activeRole: "traveler",
      activeTenantId: null,
      planTier: "free",
      adminSubRole: null,
      moderatorTripId: null,
    });

    const adminClient = makeClient({
      accountId: superAdminId,
      sessionId: randomUUID(),
      activeRole: "admin",
      activeTenantId: null,
      planTier: null,
      adminSubRole: "super_admin",
      moderatorTripId: null,
      moderatorVehicleId: null,
    });

    // Create a vehicle and published trip for Nile Horizon
    const enterpriseActor = {
      accountId: ownerId,
      role: "organization_owner" as const,
      activeTenantId: enterpriseTenantId,
    };

    const orgVt = await fleetService.createVehicleType(enterpriseActor, {
      categoryLookupCode: "HIACE_PASSENGER_VAN_14",
      nameAr: "باص الأقصر VIP",
      nameEn: "Luxor VIP Shuttle 4-Seat",
      seatCount: 4,
      seatLayout: {
        rows: 2,
        cols: 2,
        cells: [
          { row: 0, col: 0, type: "seat" as const, seatLabel: "1A" },
          { row: 0, col: 1, type: "seat" as const, seatLabel: "1B" },
          { row: 1, col: 0, type: "seat" as const, seatLabel: "2A" },
          { row: 1, col: 1, type: "seat" as const, seatLabel: "2B" },
        ],
      },
    });
    createdVehicleTypeIds.push(orgVt.id);

    const vehicle = await fleetService.createVehicle(enterpriseActor, {
      vehicleTypeId: orgVt.id,
      plateNumber: `أ ق ص ${Date.now().toString().slice(-4)}`,
      model: "Mercedes Tourismo VIP",
      manufacturingYear: 2025,
      seatCount: 4,
      amenityCodes: ["AC", "WIFI"],
    });
    const vehicleId = vehicle.id;
    createdVehicleIds.push(vehicleId);

    const now = Date.now();
    const depAt = new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString();
    const retAt = new Date(now + 13 * 24 * 60 * 60 * 1000).toISOString();

    const draftTrip = await tripsService.createDraft(enterpriseActor, {
      titleAr: "رحلة الأقصر وأسوان الشاملة",
      titleEn: "Complete Luxor & Aswan Expedition",
      descriptionAr: "رحلة شاملة لمعابد الأقصر وأسوان",
      descriptionEn: "Comprehensive expedition to Luxor and Aswan temples",
      categoryLookupCode: "DESERT_SAFARI_CAMP",
      language: "ar",
    });
    const tripId = draftTrip.id;
    createdTripIds.push(tripId);

    await tripsService.saveWizardStep(enterpriseActor, {
      tripId,
      step: "schedule",
      startsAt: depAt,
      endsAt: retAt,
      timezone: "Africa/Cairo",
      origin: { nameAr: "القاهرة", nameEn: "Cairo", regionLookupCode: "CAIRO_GIZA" },
      destinations: [{ nameAr: "الأقصر", nameEn: "Luxor", regionLookupCode: "LUXOR_ASWAN" }],
    });

    await tripsService.saveWizardStep(enterpriseActor, {
      tripId,
      step: "vehicles",
      vehicleIds: [vehicleId],
    });

    await tripsService.saveWizardStep(enterpriseActor, {
      tripId,
      step: "seating",
      seatAssignmentMode: "traveler_choice",
      seatPriorityWindowHours: 24,
    });

    await tripsService.saveWizardStep(enterpriseActor, {
      tripId,
      step: "pricing",
      basePrice: { amountMinor: 300_000, currency: "EGP" },
      childTrackingEnabled: true,
    });

    await tripsService.publish(enterpriseActor, {
      tripId,
      publishMode: "public",
    });

    // --- 1A. Programs Service ---
    const createdProg = await ownerClient.programs.createProgram({
      tripId,
      titleAr: "جولة معبد الكرنك الصوت والضوء",
      titleEn: "Karnak Temple Sound & Light Show",
      descriptionAr: "عرض مسائي خاص",
      descriptionEn: "Special evening show",
      dayNumber: 1,
      priceMinor: 50_000,
      currencyCode: "EGP",
      isIncludedInBase: false,
      capacity: 15,
      sortOrder: 1,
    });
    createdProgramIds.push(createdProg.id);
    expect(createdProg.titleEn).toBe("Karnak Temple Sound & Light Show");
    expect(createdProg.priceMinor).toBe(50_000);

    const updatedProg = await ownerClient.programs.updateProgram({
      programId: createdProg.id,
      priceMinor: 60_000,
      titleEn: "Karnak Temple VIP Sound & Light Show",
    });
    expect(updatedProg.priceMinor).toBe(60_000);
    expect(updatedProg.titleEn).toBe("Karnak Temple VIP Sound & Light Show");

    const orgPrograms = await ownerClient.programs.listTripPrograms({ tripId });
    expect(orgPrograms.items.some((p) => p.id === createdProg.id)).toBe(true);

    const publicPrograms = await ownerClient.programs.listPublicTripPrograms({ tripId });
    expect(publicPrograms.items.some((p) => p.id === createdProg.id)).toBe(true);

    // --- 1B. Staffing Service ---
    const assignedStaff = await ownerClient.staffing.assignVehicleStaff({
      tripId,
      vehicleId,
      driverSource: "org_staff",
      driverAccountId: orgDriverId,
      moderatorSource: "org_staff",
      moderatorAccountId: moderatorId,
      photographerSource: "org_staff",
      photographerAccountId: orgPhotoId,
    });
    expect(assignedStaff.vehicle.driverAccountId).toBe(orgDriverId);
    expect(assignedStaff.hasStaffingGap).toBe(false);

    const modCodeRes = await ownerClient.staffing.issueModeratorStaffCode({
      tripId,
      vehicleId,
      moderatorAccountId: moderatorId,
    });
    expect(modCodeRes.staffCode).toMatch(/^\d{6}$/);
    expect(modCodeRes.assignment.status).toBe("assigned");

    const staffingList = await ownerClient.staffing.listTripStaffing({ tripId });
    expect(staffingList.moderatorAssignments.length).toBeGreaterThanOrEqual(1);

    // --- 1C. Availability Service ---
    const blockStart = new Date(now + 20 * 24 * 60 * 60 * 1000).toISOString();
    const blockEnd = new Date(now + 22 * 24 * 60 * 60 * 1000).toISOString();

    const upsertedBlock = await driverClient.availability.upsertBlock({
      blockType: "unavailable",
      startsAt: blockStart,
      endsAt: blockEnd,
      notes: "Annual vehicle maintenance",
    });
    createdAvailabilityBlockIds.push(upsertedBlock.id);
    expect(upsertedBlock.blockType).toBe("unavailable");

    const checkConflict = await ownerClient.availability.checkSupplierAvailability({
      supplierAccountId: driverBasicId,
      startsAt: blockStart,
      endsAt: blockEnd,
    });
    expect(checkConflict.isAvailable).toBe(false);
    expect(checkConflict.conflictingBlocks.length).toBeGreaterThanOrEqual(1);

    const checkNoConflict = await ownerClient.availability.checkSupplierAvailability({
      supplierAccountId: driverBasicId,
      startsAt: depAt,
      endsAt: retAt,
    });
    expect(checkNoConflict.isAvailable).toBe(true);

    const myBlocks = await driverClient.availability.listMyBlocks({});
    expect(myBlocks.items.some((b) => b.id === upsertedBlock.id)).toBe(true);

    // --- 1D. Negotiation Service ---
    const createdOffer = await ownerClient.negotiation.createOffer({
      tripId,
      vehicleId,
      supplierAccountId: driverBasicId,
      supplierRole: "platform_driver",
      offerAmountMinor: 400_000,
      currencyCode: "EGP",
      notes: "3-day Luxor & Aswan charter",
    });
    createdNegotiationIds.push(createdOffer.id);
    expect(createdOffer.status).toBe("pending_supplier");

    // Supplier counters the offer
    const counteredOffer = await driverClient.negotiation.respondToOffer({
      negotiationId: createdOffer.id,
      action: "counter",
      counterOfferMinor: 450_000,
      notes: "Includes fuel and highway tolls",
    });
    expect(counteredOffer.status).toBe("countered_by_supplier");
    expect(counteredOffer.currentOfferMinor).toBe(450_000);

    // Organization accepts the counter-offer
    const acceptedOffer = await ownerClient.negotiation.respondToOffer({
      negotiationId: createdOffer.id,
      action: "accept",
      notes: "Agreed on 4500 EGP",
    });
    expect(acceptedOffer.status).toBe("accepted");
    expect(acceptedOffer.agreedPriceMinor).toBe(450_000);

    const orgNegotiations = await ownerClient.negotiation.listOrganizationNegotiations({ tripId });
    expect(orgNegotiations.items.some((n) => n.id === createdOffer.id)).toBe(true);

    const supplierOffers = await driverClient.negotiation.listSupplierOffers({ tripId });
    expect(supplierOffers.items.some((n) => n.id === createdOffer.id)).toBe(true);

    // --- 1E. Seats Service ---
    // Free traveler cannot hold seats (plan gate: Explorer/VIP required)
    await expect(
      freeTravelerClient.seats.holdSeats({
        tripId,
        vehicleId,
        seatLabels: ["1A"],
      }),
    ).rejects.toMatchObject({ code: "PLAN_REQUIRED" });

    // VIP traveler holds seats 1A and 1B
    const holdRes = await vipTravelerClient.seats.holdSeats({
      tripId,
      vehicleId,
      seatLabels: ["1A", "1B"],
    });
    expect(holdRes.heldSeats.length).toBe(2);
    expect(holdRes.heldSeats.map((s) => s.seatLabel).sort()).toEqual(["1A", "1B"]);

    // Cross-traveler releaseHold guard: another traveler cannot release vipTraveler's hold on 1A
    const explorerTravelerClient = makeClient({
      accountId: freeTravelerId,
      sessionId: randomUUID(),
      activeRole: "traveler",
      activeTenantId: null,
      planTier: "explorer",
      adminSubRole: null,
      moderatorTripId: null,
      moderatorVehicleId: null,
    });
    const unauthorizedRelease = await explorerTravelerClient.seats.releaseHold({
      tripId,
      vehicleId,
      seatLabels: ["1A"],
    });
    expect(unauthorizedRelease.releasedCount).toBe(0);

    // Concurrent holdSeats race condition guard: two travelers simultaneously attempting to hold 2B
    const concurrentHoldResults = await Promise.allSettled([
      vipTravelerClient.seats.holdSeats({
        tripId,
        vehicleId,
        seatLabels: ["2B"],
      }),
      explorerTravelerClient.seats.holdSeats({
        tripId,
        vehicleId,
        seatLabels: ["2B"],
      }),
    ]);
    const succeededHolds = concurrentHoldResults.filter((r) => r.status === "fulfilled");
    const failedHolds = concurrentHoldResults.filter((r) => r.status === "rejected");
    expect(succeededHolds.length).toBe(1);
    expect(failedHolds.length).toBe(1);

    // Release 2B from whichever traveler won the race
    await vipTravelerClient.seats.releaseHold({ tripId, vehicleId, seatLabels: ["2B"] });
    await explorerTravelerClient.seats.releaseHold({ tripId, vehicleId, seatLabels: ["2B"] });

    // Organization manually reserves 2A
    const assignSeatRes = await ownerClient.seats.assignSeatByOrganization({
      tripId,
      vehicleId,
      seatLabel: "2A",
      status: "reserved",
      passengerName: "VIP Guest",
    });
    expect(assignSeatRes.status).toBe("reserved");

    // Release 1B hold
    const releaseRes = await vipTravelerClient.seats.releaseHold({
      tripId,
      vehicleId,
      seatLabels: ["1B"],
    });
    expect(releaseRes.releasedCount).toBe(1);

    const seatMap = await vipTravelerClient.seats.getSeatMap({ tripId, vehicleId });
    expect(seatMap.seats.length).toBe(4);
    expect(seatMap.seats.some((s) => s.seatLabel === "1A" && s.status === "held")).toBe(true);

    // --- 1F. Coupons Service ---
    const couponCode = `LUXOR${Date.now().toString().slice(-5)}`;
    const orgCouponRes = await ownerClient.coupons.createOrganizationCoupon({
      code: couponCode,
      titleAr: "خصم رحلة الأقصر",
      titleEn: "Luxor Launch Discount",
      discountType: "percentage",
      discountValue: 10,
      maxDiscountMinor: 100_000,
      minOrderMinor: 200_000,
      currencyCode: "EGP",
      maxRedemptions: 10,
      tripId,
    });
    createdCouponIds.push(orgCouponRes.id);
    expect(orgCouponRes.code).toBe(couponCode);

    const platformCouponRes = await adminClient.coupons.createPlatformCoupon({
      code: `PLAT${Date.now().toString().slice(-5)}`,
      titleAr: "خصم المنصة",
      titleEn: "Platform Seasonal Promo",
      discountType: "fixed_amount",
      discountValue: 25_000,
      minOrderMinor: 100_000,
      currencyCode: "EGP",
    });
    createdCouponIds.push(platformCouponRes.id);

    const validatedCoupon = await vipTravelerClient.coupons.validateCoupon({
      code: couponCode,
      tripId,
      subtotalMinor: 510_000,
    });
    expect(validatedCoupon.coupon.code).toBe(couponCode);
    expect(validatedCoupon.discountMinor).toBe(51_000);
    expect(validatedCoupon.finalAmountMinor).toBe(459_000);

    // --- 2. Commerce & Execution Domain: Booking, Payments, Check-In, Moderator, Tracking, Parent, Accounting, Plans, Photographer, Driver, Notifications ---
    // 2A. Booking Service: VIP traveler books 1 adult + 1 child with program + coupon + seats
    const childPassengerId = `child-${randomUUID().slice(0, 8)}`;
    const adultPassengerId = `adult-${randomUUID().slice(0, 8)}`;

    const bookingDetail = await vipTravelerClient.booking.createBooking({
      tripId,
      vehicleId,
      passengers: [
        {
          id: adultPassengerId,
          fullName: "Ziad Mahmoud",
          isChild: false,
          age: 36,
          seatLabel: "1A",
        },
        {
          id: childPassengerId,
          fullName: "Yassin Ziad Mahmoud",
          isChild: true,
          age: 9,
          guardianPhoneE164: "+201000000033",
          seatLabel: "1B",
        },
      ],
      selectedProgramIds: [createdProg.id],
      seatLabels: ["1A", "1B"],
      couponCode,
      paymentGateway: "fawry",
    });
    const bookingId = bookingDetail.booking.id;
    createdBookingIds.push(bookingId);

    // Verify pricing math: 2 passengers * 300,000 = 600,000 base
    // + 2 passengers * 60,000 program = 120,000 programs => 720,000 subtotal
    // - 10% coupon (72,000) = 648,000 total
    expect(bookingDetail.booking.subtotalMinor).toBe(600_000);
    expect(bookingDetail.booking.programsTotalMinor).toBe(120_000);
    expect(bookingDetail.booking.discountMinor).toBe(72_000);
    expect(bookingDetail.booking.totalAmountMinor).toBe(648_000);
    expect(bookingDetail.boardingPasses.length).toBe(2);

    const myBookings = await vipTravelerClient.booking.listMyBookings();
    expect(myBookings.some((b) => b.id === bookingId)).toBe(true);

    const orgBookings = await ownerClient.booking.listOrganizationBookings({ tripId });
    expect(orgBookings.some((b) => b.id === bookingId)).toBe(true);

    // 2B. Payments Service: Create Fawry payment intent (48h reference window), confirm payment, verify booking confirmed + ledger posted
    // Cross-traveler payment intent guard: another traveler cannot create a payment intent for someone else's booking
    await expect(
      freeTravelerClient.payments.createPaymentIntent({
        bookingId,
        purpose: "trip_booking",
        gateway: "fawry",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const paymentIntent = await vipTravelerClient.payments.createPaymentIntent({
      bookingId,
      purpose: "trip_booking",
      gateway: "fawry",
    });
    createdPaymentIds.push(paymentIntent.id);
    expect(paymentIntent.status).toBe("requires_action");
    expect(paymentIntent.fawryReferenceCode).toMatch(/^\d{10}$/);
    expect(paymentIntent.fawryExpiresAt).not.toBeNull();
    expect(paymentIntent.amountMinor).toBe(648_000);

    // Cross-traveler confirmPayment guard
    await expect(
      freeTravelerClient.payments.confirmPayment({
        paymentId: paymentIntent.id,
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const confirmedPayment = await vipTravelerClient.payments.confirmPayment({
      paymentId: paymentIntent.id,
    });
    expect(confirmedPayment.status).toBe("succeeded");
    expect(confirmedPayment.paidAt).toBeInstanceOf(Date);

    const updatedBookingAfterPay = await vipTravelerClient.booking.getBooking({
      bookingId,
    });
    expect(updatedBookingAfterPay.booking.status).toBe("confirmed");
    expect(updatedBookingAfterPay.booking.updatedAt).toBeInstanceOf(Date);

    // 2C. Accounting Service: Verify ledger entry was posted upon payment confirmation, create payout settlement, flag exception
    const orgAccountingSummary = await ownerClient.accounting.getOrganizationSummary();
    expect(orgAccountingSummary.grossRevenueMinor).toBeGreaterThanOrEqual(648_000);

    const ledgerEntries = await ownerClient.accounting.listLedgerEntries({ tripId });
    expect(ledgerEntries.length).toBeGreaterThanOrEqual(1);
    for (const entry of ledgerEntries) {
      createdLedgerEntryIds.push(entry.id);
    }

    const payoutEntry = await ownerClient.accounting.createPayoutSettlement({
      amountMinor: 100_000,
      currencyCode: "EGP",
      description: "Luxor trip advance settlement",
    });
    createdLedgerEntryIds.push(payoutEntry.id);
    expect(payoutEntry.entryType).toBe("payout_settlement");
    expect(payoutEntry.status).toBe("settled");

    // Verify "finance" AdminSubRole RBAC on accounting admin endpoints
    const financeAdminClient = makeClient({
      accountId: superAdminId,
      sessionId: randomUUID(),
      activeRole: "admin",
      activeTenantId: null,
      planTier: null,
      adminSubRole: "finance",
      moderatorTripId: null,
      moderatorVehicleId: null,
    });

    const flaggedEntry = await financeAdminClient.accounting.flagReconciliationException({
      entryId: payoutEntry.id,
      reason: "Bank transfer reference mismatch during audit",
    });
    expect(flaggedEntry.status).toBe("reconciliation_exception");

    const adminExceptions = await financeAdminClient.accounting.listAdminReconciliationExceptions();
    expect(adminExceptions.some((e) => e.id === payoutEntry.id)).toBe(true);

    // 2D. Check-In Service: QR code verification, duplicate scan guard, manual override, and traveler boarding passes
    const boardingPasses = await vipTravelerClient.checkIn.getMyBoardingPasses({
      bookingId,
    });
    expect(boardingPasses.length).toBe(2);
    const firstPass = boardingPasses[0]!;
    const secondPass = boardingPasses[1]!;

    const checkedInPass = await ownerClient.checkIn.verifyAndCheckInByQr({
      qrCodeToken: firstPass.qrCodeToken,
    });
    expect(checkedInPass.status).toBe("checked_in");
    expect(checkedInPass.method).toBe("qr_scan");

    // Duplicate QR scan is rejected with CONFLICT
    await expect(
      ownerClient.checkIn.verifyAndCheckInByQr({
        qrCodeToken: firstPass.qrCodeToken,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });

    const manualPass = await ownerClient.checkIn.manualCheckInOverride({
      checkInRecordId: secondPass.id,
      status: "checked_in",
      notes: "Verified child ID with parent at gate",
    });
    expect(manualPass.status).toBe("checked_in");
    expect(manualPass.method).toBe("manual_override");

    const manifest = await ownerClient.checkIn.listTripManifest({ tripId, vehicleId });
    expect(manifest.length).toBe(2);

    // 2E. Moderator Service: Vehicle-scoped moderator session checks assignment, manifest, headcount, and safety alert
    const modClient = makeClient({
      accountId: moderatorId,
      sessionId: randomUUID(),
      activeRole: "moderator",
      activeTenantId: enterpriseTenantId,
      planTier: null,
      adminSubRole: null,
      moderatorTripId: tripId,
      moderatorVehicleId: vehicleId,
    });

    const activeModAssignment = await modClient.moderator.getActiveAssignment();
    expect(activeModAssignment.tripId).toBe(tripId);
    expect(activeModAssignment.vehicleId).toBe(vehicleId);

    const modManifest = await modClient.moderator.getVehicleManifest();
    expect(modManifest.length).toBe(2);

    const headcountEvent = await modClient.moderator.recordHeadcount({
      countedPassengers: 2,
      notes: "All 2 passengers seated before highway departure",
    });
    expect(headcountEvent.eventType).toBe("headcount_verified");
    expect(headcountEvent.metadata).toMatchObject({ countedPassengers: 2 });

    const safetyAlertEvent = await modClient.moderator.raiseSafetyAlert({
      severity: "warning",
      messageAr: "توقف مؤقت لفحص الإطارات",
      messageEn: "Temporary stop for tire pressure inspection",
    });
    expect(safetyAlertEvent.eventType).toBe("safety_alert");
    expect(safetyAlertEvent.severity).toBe("warning");

    // 2F. Tracking & Parent Services: Live GPS ping, child safety boarding event, parent linked child status
    const gpsEvent = await modClient.tracking.recordGpsPing({
      tripId,
      vehicleId,
      coordinates: {
        latitude: 25.6872,
        longitude: 32.6396,
        speedKmh: 85,
        headingDeg: 180,
      },
    });
    expect(gpsEvent.eventType).toBe("gps_ping");

    const childBoardedEvent = await modClient.tracking.recordChildSafetyEvent({
      tripId,
      vehicleId,
      childPassengerId,
      eventType: "child_boarded",
      messageEn: "Yassin boarded Bus 1 safely",
    });
    expect(childBoardedEvent.eventType).toBe("child_boarded");

    const liveTracking = await vipTravelerClient.tracking.getTripLiveTracking({ tripId });
    expect(liveTracking.latestCoordinates?.latitude).toBe(25.6872);
    expect(liveTracking.events.length).toBeGreaterThanOrEqual(2);

    const orgSafetyAlerts = await ownerClient.tracking.listSafetyAlerts();
    expect(orgSafetyAlerts.some((a) => a.id === safetyAlertEvent.id)).toBe(true);

    // Parent linked children (auto-linked during booking creation!)
    const linkedChildren = await vipTravelerClient.parent.listLinkedChildren();
    const autoLinkedChild = linkedChildren.find(
      (link) => link.bookingId === bookingId && link.childPassengerId === childPassengerId,
    );
    expect(autoLinkedChild).toBeDefined();

    const childLiveStatus = await vipTravelerClient.parent.getChildTripLiveStatus({
      linkId: autoLinkedChild!.id,
    });
    expect(childLiveStatus.link.tripId).toBe(tripId);
    expect(childLiveStatus.checkInRecord?.status).toBe("checked_in");
    expect(childLiveStatus.events.some((e) => e.eventType === "child_boarded")).toBe(true);
    expect(childLiveStatus.events.some((e) => e.coordinates?.latitude === 25.6872)).toBe(true);

    // 2G. Plans Service: Catalog, my subscription, org subscription, change plan, admin override
    const catalog = await vipTravelerClient.plans.getCatalog({ role: "traveler" });
    expect(catalog.length).toBeGreaterThanOrEqual(3);

    const changedSub = await vipTravelerClient.plans.changeAccountPlan({
      planId: "traveler:vip",
      billingCycle: "annual",
    });
    expect(changedSub.planId).toBe("traveler:vip");
    expect(changedSub.billingCycle).toBe("annual");

    const mySub = await vipTravelerClient.plans.getMySubscription();
    expect(mySub?.planId).toBe("traveler:vip");

    const overriddenSub = await adminClient.plans.adminOverrideSubscription({
      scope: "organization",
      tenantId: enterpriseTenantId,
      planId: "organization:enterprise",
      billingCycle: "annual",
      overrideNote: "Enterprise strategic partner annual renewal",
    });
    expect(overriddenSub.updatedByAccountId).toBe(superAdminId);
    expect(overriddenSub.overrideNote).toBe("Enterprise strategic partner annual renewal");

    // 2H. Photographer Service: Profile, update profile, create album, upload photos, publish album
    const photoProId = demoAccountId(summary, "photo.pro@example.com");
    const photoClient = makeClient({
      accountId: photoProId,
      sessionId: randomUUID(),
      activeRole: "platform_photographer",
      activeTenantId: null,
      planTier: "pro",
      adminSubRole: null,
      moderatorTripId: null,
      moderatorVehicleId: null,
    });

    const photoProfile = await photoClient.photographer.getProfile();
    expect(photoProfile.accountId).toBe(photoProId);

    const updatedPhotoProfile = await photoClient.photographer.updateProfile({
      yearsOfExperience: 9,
      hasDroneLicense: true,
      specialties: ["desert", "heritage", "aerial"],
    });
    expect(updatedPhotoProfile.yearsOfExperience).toBe(9);
    expect(updatedPhotoProfile.hasDroneLicense).toBe(true);

    const album = await photoClient.photographer.createTripAlbum({
      tripId,
      titleAr: "ألبوم معبد الكرنك",
      titleEn: "Karnak Temple Highlights",
      watermarked: true,
    });
    createdAlbumIds.push(album.id);
    expect(album.status).toBe("draft");

    // Draft albums must NOT be visible to travelers, but MUST be visible to the photographer
    const travelerAlbumsBeforePublish = await vipTravelerClient.photographer.listTripAlbums({
      tripId,
    });
    expect(travelerAlbumsBeforePublish.some((a) => a.id === album.id)).toBe(false);
    const photographerAlbumsBeforePublish = await photoClient.photographer.listTripAlbums({
      tripId,
    });
    expect(photographerAlbumsBeforePublish.some((a) => a.id === album.id)).toBe(true);

    const albumWithPhotos = await photoClient.photographer.uploadPhotosToAlbum({
      albumId: album.id,
      photoUrls: [
        "https://cdn.trips-enjoy.com/photos/karnak-1.jpg",
        "https://cdn.trips-enjoy.com/photos/karnak-2.jpg",
      ],
    });
    expect(albumWithPhotos.photoCount).toBe(2);

    const publishedAlbum = await photoClient.photographer.publishTripAlbum({
      albumId: album.id,
    });
    expect(publishedAlbum.status).toBe("published");

    const publicAlbums = await vipTravelerClient.photographer.listTripAlbums({ tripId });
    expect(publicAlbums.some((a) => a.id === album.id)).toBe(true);

    // 2I. Driver Service: Profile, update profile, admin request lab test -> driver book -> upload -> admin review pass -> unpauses driver
    const driverProfile = await driverClient.driver.getProfile();
    expect(driverProfile.accountId).toBe(driverBasicId);

    const updatedDriverProfile = await driverClient.driver.updateProfile({
      yearsOfExperience: 11,
      serviceAreas: ["Cairo", "Luxor", "Aswan"],
    });
    expect(updatedDriverProfile.yearsOfExperience).toBe(11);

    // Verify "operations" AdminSubRole RBAC on driver admin endpoints
    const opsAdminClient = makeClient({
      accountId: superAdminId,
      sessionId: randomUUID(),
      activeRole: "admin",
      activeTenantId: null,
      planTier: null,
      adminSubRole: "operations",
      moderatorTripId: null,
      moderatorVehicleId: null,
    });

    const requestedLabTest = await opsAdminClient.driver.adminRequestLabTest({
      driverAccountId: driverBasicId,
      deadlineAt: new Date(now + 48 * 60 * 60 * 1000).toISOString(),
    });
    createdLabTestIds.push(requestedLabTest.id);
    expect(requestedLabTest.status).toBe("requested");

    // Verify driver profile is paused while mandatory lab test is pending
    const pausedDriverProfile = await driverClient.driver.getProfile();
    expect(pausedDriverProfile.status).toBe("paused_lab_test");

    const bookedLabTest = await driverClient.driver.bookLabTest({
      labTestId: requestedLabTest.id,
      labCenterName: "Al Borg Diagnostics - Mohandessin",
      appointmentAt: new Date(now + 12 * 60 * 60 * 1000).toISOString(),
    });
    expect(bookedLabTest.status).toBe("booked");

    const uploadedLabTest = await driverClient.driver.uploadLabTestResult({
      labTestId: requestedLabTest.id,
      resultDocumentUrl: "https://cdn.trips-enjoy.com/labs/result-clean.pdf",
    });
    expect(uploadedLabTest.status).toBe("result_uploaded");

    const reviewedLabTest = await opsAdminClient.driver.adminReviewLabTest({
      labTestId: requestedLabTest.id,
      decision: "verified_pass",
      reviewNotes: "Negative panel verified with lab QR",
    });
    expect(reviewedLabTest.status).toBe("verified_pass");

    // Verify driver profile is unpaused after verified_pass
    const unpausedDriverProfile = await driverClient.driver.getProfile();
    expect(unpausedDriverProfile.status).toBe("active");

    // 2J. Notifications Service: Send notification, list inbox, mark single read, mark all read
    const sentNotif = await ownerClient.notifications.sendNotification({
      recipientAccountId: vipTravelerId,
      tenantId: enterpriseTenantId,
      category: "trip_updates",
      channel: "in_app",
      titleAr: "تحديث موعد التجمع",
      titleEn: "Assembly Time Reminder",
      bodyAr: "يرجى التواجد قبل التحرك بـ ٣٠ دقيقة",
      bodyEn: "Please arrive 30 minutes prior to departure.",
      actionUrl: `/trips/${tripId}`,
    });
    createdNotificationIds.push(sentNotif.id);
    expect(sentNotif.isRead).toBe(false);

    const inbox = await vipTravelerClient.notifications.listInbox({ unreadOnly: true });
    expect(inbox.some((n) => n.id === sentNotif.id)).toBe(true);

    const markedOne = await vipTravelerClient.notifications.markRead({
      notificationId: sentNotif.id,
    });
    expect(markedOne.isRead).toBe(true);
    expect(markedOne.readAt).not.toBeNull();

    const markAllRes = await vipTravelerClient.notifications.markAllRead();
    expect(markAllRes.updatedCount).toBeGreaterThanOrEqual(0);

    // 2K. Dispute & Refund lifecycle + Booking cancellation refund policy
    const disputedPayment = await vipTravelerClient.payments.openDispute({
      paymentId: confirmedPayment.id,
      reason: "Charged twice on Fawry receipt",
    });
    expect(disputedPayment.disputeStatus).toBe("open");

    const resolvedMerchant = await adminClient.payments.resolveDispute({
      paymentId: confirmedPayment.id,
      resolution: "resolved_merchant",
    });
    expect(resolvedMerchant.disputeStatus).toBe("resolved_merchant");

    // Cancel booking (10 days before departure => 80% refund tier = 518,400 minor)
    const cancelledBooking = await vipTravelerClient.booking.cancelBooking({
      bookingId,
      reason: "Family schedule change",
    });
    expect(cancelledBooking.status).toBe("cancelled");
    expect(cancelledBooking.refundAmountMinor).toBe(518_400);
  });
});
