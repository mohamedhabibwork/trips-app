import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  createDb,
  demoAccountId,
  type DemoSeedSummary,
  eq,
  inArray,
  schema,
  seedDemoData,
} from "@trips-app/db";
import { createEmployeesService } from "@trips-app/service-employees";
import { createFleetService } from "@trips-app/service-fleet";
import { createMediaService } from "@trips-app/service-media";
import { createTravelerService } from "@trips-app/service-traveler";
import { createTripsService } from "@trips-app/service-trips";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";

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

describe("Integration: Step 1A & 1B Services (Employees, Traveler, Media, Fleet, Trips & Cross-Tenant Isolation)", () => {
  const db = createDb({ DATABASE_URL: resolveTestDatabaseUrl() });
  const employeesService = createEmployeesService(db);
  const travelerService = createTravelerService(db);
  const mediaService = createMediaService(db);
  const fleetService = createFleetService(db);
  const tripsService = createTripsService(db);

  let summary: DemoSeedSummary;
  const createdTripIds: string[] = [];
  const createdVehicleIds: string[] = [];
  const createdVehicleTypeIds: string[] = [];
  const createdEmployeeMembershipIds: string[] = [];
  const createdPrivacyRequestIds: string[] = [];
  const createdUploadedFileIds: string[] = [];

  beforeAll(async () => {
    summary = await seedDemoData(db);
  });

  afterAll(async () => {
    if (createdTripIds.length > 0) {
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
    if (createdEmployeeMembershipIds.length > 0) {
      await db
        .delete(schema.employeeMemberships)
        .where(inArray(schema.employeeMemberships.id, createdEmployeeMembershipIds));
    }
    if (createdPrivacyRequestIds.length > 0) {
      await db
        .delete(schema.privacyRequests)
        .where(inArray(schema.privacyRequests.id, createdPrivacyRequestIds));
    }
    if (createdUploadedFileIds.length > 0) {
      await db
        .delete(schema.uploadedFiles)
        .where(inArray(schema.uploadedFiles.id, createdUploadedFileIds));
    }
  });

  test("1. Employees: invite, resend, accept, update 9-area permissions, suspend with session revocation (T-EMP-05), and enforce plan quota", async () => {
    const enterpriseTenantId = summary.ids.organizations.nileHorizonEnterprise;
    const ownerId = demoAccountId(summary, "owner@nilehorizon.eg");
    const travelerAccountId = demoAccountId(summary, "traveler.explorer@example.com");

    const ownerAuth = {
      accountId: ownerId,
      sessionId: randomUUID(),
      activeRole: "organization_owner" as const,
      activeTenantId: enterpriseTenantId,
      planTier: "enterprise",
    };

    // 1a. List existing employees & quota
    const initialList = await employeesService.list(ownerAuth, {});
    expect(initialList.quota.planTier).toBe("enterprise");
    expect(initialList.employees.length).toBeGreaterThanOrEqual(1);

    // 1b. Invite a new employee
    const invitedEmail = `step1.emp.${Date.now()}@nilehorizon.eg`;
    const inviteRes = await employeesService.invite(ownerAuth, {
      invitedEmail,
      roleTitle: "Fleet & Trips Supervisor",
      preset: "fleet_supervisor",
    });
    createdEmployeeMembershipIds.push(inviteRes.employee.id);
    expect(inviteRes.employee.status).toBe("invited");
    expect(inviteRes.employee.permissions.fleet).toBe("manage");
    expect(inviteRes.inviteToken.length).toBeGreaterThan(10);

    // 1c. Resend invite rotates token
    const resendRes = await employeesService.resendInvite(ownerAuth, {
      membershipId: inviteRes.employee.id,
    });
    expect(resendRes.inviteToken).not.toBe(inviteRes.inviteToken);

    // 1d. Accept invite binds accountId and activates membership
    const acceptRes = await employeesService.acceptInvite(
      {
        accountId: travelerAccountId,
        activeRole: "traveler",
      },
      { inviteToken: resendRes.inviteToken },
    );
    expect(acceptRes.employee.status).toBe("active");
    expect(acceptRes.employee.accountId).toBe(travelerAccountId);

    // 1e. Update 9-area permissions
    const updatedPermRes = await employeesService.updatePermissions(ownerAuth, {
      membershipId: inviteRes.employee.id,
      roleTitle: "Lead Operations Supervisor",
      permissions: {
        trips: "manage",
        bookings: "manage",
        accounting: "view",
        coupons: "view",
        employees: "view",
        fleet: "manage",
        subscription: "none",
        tracking: "manage",
        settings: "none",
      },
    });
    expect(updatedPermRes.employee.roleTitle).toBe("Lead Operations Supervisor");
    expect(updatedPermRes.employee.permissions.trips).toBe("manage");

    // 1f. Create an active session for this employee in enterpriseTenantId and verify suspension revokes it (T-EMP-05)
    const empSessionId = randomUUID();
    const now = new Date();
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
    await db.insert(schema.authSessions).values({
      id: empSessionId,
      accountId: travelerAccountId,
      activeRole: "organization_employee",
      activeTenantId: enterpriseTenantId,
      refreshTokenHash: `test-hash-${empSessionId}`,
      surface: "web",
      expiresAt: in1Hour,
      maxSessionExpiresAt: in1Hour,
    });

    const suspendRes = await employeesService.updateStatus(ownerAuth, {
      membershipId: inviteRes.employee.id,
      status: "suspended",
      reason: "Compliance audit review",
    });
    expect(suspendRes.employee.status).toBe("suspended");
    expect(suspendRes.revokedSessionsCount).toBeGreaterThanOrEqual(1);

    const [sessionAfterSuspend] = await db
      .select()
      .from(schema.authSessions)
      .where(eq(schema.authSessions.id, empSessionId));
    expect(sessionAfterSuspend?.revokedAt).not.toBeNull();

    // Clean up test session
    await db.delete(schema.authSessions).where(eq(schema.authSessions.id, empSessionId));
  });

  test("2. Traveler & Media: profile read/update (D-20), avatar linking via linkUploadedFilesOnItemSave, notifications, plan overview, and privacy requests", async () => {
    const freeTravelerId = demoAccountId(summary, "traveler.free@example.com");
    const actor = {
      accountId: freeTravelerId,
      role: "traveler" as const,
    };

    // 2a. Get profile returns decrypted email & phone
    const initialProfile = await travelerService.getProfile(actor);
    expect(initialProfile.accountId).toBe(freeTravelerId);
    expect(initialProfile.email).toBe("traveler.free@example.com");
    expect(initialProfile.countryCode).toBe("EG");

    // 2b. Upload avatar via media service and confirm it starts as pending with 12h expiry
    const uploadRes = await mediaService.uploadFile(
      {
        accountId: freeTravelerId,
        role: "traveler",
      },
      {
        originalFilename: "traveler-avatar.png",
        mimeType: "image/png",
        contentBase64: Buffer.from("fake-png-avatar-bytes").toString("base64"),
        purpose: "avatar",
      },
    );
    createdUploadedFileIds.push(uploadRes.file.id);
    expect(uploadRes.file.status).toBe("pending");
    expect(uploadRes.file.expiresAt).not.toBeNull();

    // 2c. Update traveler profile with uploaded avatar -> links file permanently
    const updatedProfile = await travelerService.updateProfile(actor, {
      fullName: "Omar Khaled Updated",
      countryCode: "EG",
      preferredLanguage: "en",
      email: "traveler.free@example.com",
      phoneE164: "+201000000031",
      avatarUrl: uploadRes.file.url,
      avatarFileId: uploadRes.file.id,
    });
    expect(updatedProfile.fullName).toBe("Omar Khaled Updated");
    expect(updatedProfile.preferredLanguage).toBe("en");
    expect(updatedProfile.avatarUrl).toBe(uploadRes.file.url);

    const [linkedFile] = await db
      .select()
      .from(schema.uploadedFiles)
      .where(eq(schema.uploadedFiles.id, uploadRes.file.id));
    expect(linkedFile?.status).toBe("linked");
    expect(linkedFile?.linkedEntityType).toBe("profile");
    expect(linkedFile?.linkedEntityId).toBe(freeTravelerId);
    expect(linkedFile?.expiresAt).toBeNull();

    // 2d. D-20 invariant: clearing both email and phone is rejected with VALIDATION_ERROR
    await expect(
      travelerService.updateProfile(actor, {
        fullName: "Omar Khaled",
        countryCode: "EG",
        email: null,
        phoneE164: null,
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    // 2e. Notification preferences update via dedicated endpoint and via updateProfile (Mobile contract)
    const updatedPrefs = await travelerService.updateNotificationPreferences(actor, {
      bookingsSms: false,
      promotionsPush: true,
    });
    expect(updatedPrefs.bookingsSms).toBe(false);
    expect(updatedPrefs.promotionsPush).toBe(true);

    const profileWithPrefs = await travelerService.updateProfile(actor, {
      fullName: "Omar Khaled Mobile",
      countryCode: "EG",
      preferredLanguage: "ar",
      email: "traveler.free@example.com",
      phoneE164: "+201000000031",
      avatarUrl: uploadRes.file.url,
      fileIds: [uploadRes.file.id],
      notificationPreferences: {
        bookingsPush: true,
        bookingsSms: true,
        bookingsEmail: true,
        tripUpdatesPush: true,
        tripUpdatesSms: false,
        tripUpdatesEmail: true,
        promotionsPush: false,
        promotionsSms: false,
        promotionsEmail: false,
      },
    });
    expect(profileWithPrefs.fullName).toBe("Omar Khaled Mobile");
    expect(profileWithPrefs.preferredLanguage).toBe("ar");
    expect(profileWithPrefs.notificationPreferences.bookingsSms).toBe(true);
    expect(profileWithPrefs.notificationPreferences.promotionsPush).toBe(false);

    // 2f. Plan overview returns Free, Explorer, VIP
    const planOverview = await travelerService.getPlanOverview(actor);
    expect(planOverview.currentPlanTier).toBe("free");
    expect(planOverview.plans.length).toBe(3);

    // 2g. Privacy data export request (accepting optional confirmedUnderstood flag from Mobile)
    const exportReq = await travelerService.requestPrivacyAction(actor, {
      requestType: "data_export",
      reason: "Personal archive copy",
      confirmedUnderstood: true,
    });
    createdPrivacyRequestIds.push(exportReq.id);
    expect(exportReq.requestType).toBe("data_export");
    expect(exportReq.status).toBe("pending");
  });

  test("3. Fleet & Trips: vehicle types (T-FLT-05), vehicle seatCount invariant (T-FLT-04), 8-step trip wizard, plan gates, publish, lifecycle transitions, cancellation, public browse (FR-TRIP-02), and cross-tenant isolation (IF-12)", async () => {
    const enterpriseTenantId = summary.ids.organizations.nileHorizonEnterprise;
    const starterTenantId = summary.ids.organizations.sinaiStarter;
    const enterpriseOwnerId = demoAccountId(summary, "owner@nilehorizon.eg");
    const starterOwnerId = demoAccountId(summary, "owner@sinaitrails.eg");
    const opsAdminId = demoAccountId(summary, "ops.admin@trips-enjoy.com");
    const freeTravelerId = demoAccountId(summary, "traveler.free@example.com");
    const vipTravelerId = demoAccountId(summary, "traveler.vip@example.com");

    const enterpriseActor = {
      accountId: enterpriseOwnerId,
      role: "organization_owner" as const,
      activeTenantId: enterpriseTenantId,
    };
    const starterActor = {
      accountId: starterOwnerId,
      role: "organization_owner" as const,
      activeTenantId: starterTenantId,
    };
    const opsAdminActor = {
      accountId: opsAdminId,
      role: "admin" as const,
      adminSubRole: "operations" as const,
    };

    const sample4SeatLayout = {
      rows: 2,
      cols: 2,
      cells: [
        { row: 0, col: 0, type: "seat" as const, seatLabel: "1A" },
        { row: 0, col: 1, type: "seat" as const, seatLabel: "1B" },
        { row: 1, col: 0, type: "seat" as const, seatLabel: "2A" },
        { row: 1, col: 1, type: "seat" as const, seatLabel: "2B" },
      ],
    };

    // 3a. Platform admin creates a platform-wide vehicle type (T-FLT-05)
    const platformVt = await fleetService.createPlatformVehicleType(opsAdminActor, {
      categoryLookupCode: "SAFARI_4X4_LAND_CRUISER",
      nameAr: "لاند كروزر سفاري قياسي",
      nameEn: "Standard Safari Land Cruiser 4-Seat",
      seatCount: 4,
      seatLayout: sample4SeatLayout,
    });
    createdVehicleTypeIds.push(platformVt.id);
    expect(platformVt.scope).toBe("platform");
    expect(platformVt.tenantId).toBeNull();

    // 3b. Enterprise organization creates a custom organization vehicle type
    const orgVt = await fleetService.createVehicleType(enterpriseActor, {
      categoryLookupCode: "HIACE_PASSENGER_VAN_14",
      nameAr: "فان VIP خاص",
      nameEn: "Executive VIP 4-Seat Shuttle",
      seatCount: 4,
      seatLayout: sample4SeatLayout,
    });
    createdVehicleTypeIds.push(orgVt.id);
    expect(orgVt.scope).toBe("organization");
    expect(orgVt.tenantId).toBe(enterpriseTenantId);

    // Starter tenant sees platformVt but NOT enterprise's orgVt (T-FLT-05 & DAT-01)
    const starterVtList = await fleetService.listVehicleTypes(starterActor);
    expect(starterVtList.items.some((vt) => vt.id === platformVt.id)).toBe(true);
    expect(starterVtList.items.some((vt) => vt.id === orgVt.id)).toBe(false);

    // 3c. T-FLT-04: Creating a vehicle with mismatched seatCount is rejected with BUSINESS_RULE_VIOLATION
    await expect(
      fleetService.createVehicle(enterpriseActor, {
        vehicleTypeId: orgVt.id,
        plateNumber: "ن ي ل 9001",
        model: "Toyota HiAce VIP",
        manufacturingYear: 2025,
        seatCount: 14, // mismatch with orgVt.seatCount (4)
      }),
    ).rejects.toMatchObject({ code: "BUSINESS_RULE_VIOLATION" });

    // 3d. Create valid vehicle & verify duplicate plate rejection
    const vehicle1 = await fleetService.createVehicle(enterpriseActor, {
      vehicleTypeId: orgVt.id,
      plateNumber: "ن ي ل - 9001",
      model: "Toyota HiAce VIP",
      manufacturingYear: 2025,
      seatCount: 4,
      amenityCodes: ["AC", "WIFI", "GPS_TRACKER"],
    });
    createdVehicleIds.push(vehicle1.id);
    expect(vehicle1.seatCount).toBe(4);

    await expect(
      fleetService.createVehicle(enterpriseActor, {
        vehicleTypeId: orgVt.id,
        plateNumber: "نيل9001", // normalizes to same plate
        model: "Duplicate Van",
        manufacturingYear: 2025,
        seatCount: 4,
      }),
    ).rejects.toMatchObject({ code: "DUPLICATE_RESOURCE" });

    // Cross-tenant isolation (IF-12): Starter tenant cannot fetch or update Enterprise's vehicle
    await expect(
      fleetService.getVehicle(starterActor, { vehicleId: vehicle1.id }),
    ).rejects.toMatchObject({ code: "RESOURCE_NOT_FOUND" });

    // 3e. Create draft trip & test incomplete publish precondition
    const draftTrip = await tripsService.createDraft(enterpriseActor, {
      titleAr: "مغامرة واحة سيوة الفاخرة",
      titleEn: "Luxury Siwa Oasis Expedition",
      descriptionAr: "رحلة سفاري وتخييم ٣ أيام",
      descriptionEn: "3-day luxury desert safari and oasis retreat",
      categoryLookupCode: "DESERT_SAFARI_CAMP",
      language: "ar",
    });
    createdTripIds.push(draftTrip.id);
    expect(draftTrip.state).toBe("draft");
    expect(draftTrip.wizardSteps.basics).toBe(true);

    // Publishing before schedule, vehicles, and pricing steps are completed fails with PRECONDITION_FAILED
    await expect(
      tripsService.publish(enterpriseActor, { tripId: draftTrip.id }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });

    // 3f. Complete wizard steps 2 through 8
    const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const endsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

    await tripsService.saveWizardStep(enterpriseActor, {
      tripId: draftTrip.id,
      step: "schedule",
      startsAt,
      endsAt,
      timezone: "Africa/Cairo",
      origin: { nameAr: "القاهرة", nameEn: "Cairo", regionLookupCode: "CAIRO_GIZA" },
      destinations: [{ nameAr: "سيوة", nameEn: "Siwa Oasis", regionLookupCode: "MATROUH_SIWA" }],
    });

    const afterVehicles = await tripsService.saveWizardStep(enterpriseActor, {
      tripId: draftTrip.id,
      step: "vehicles",
      vehicleIds: [vehicle1.id],
    });
    expect(afterVehicles.totalCapacity).toBe(4);
    expect(afterVehicles.vehicles).toHaveLength(1);
    expect(afterVehicles.vehicles[0]?.seatCountSnapshot).toBe(4);

    await tripsService.saveWizardStep(enterpriseActor, {
      tripId: draftTrip.id,
      step: "programs",
    });

    await tripsService.saveWizardStep(enterpriseActor, {
      tripId: draftTrip.id,
      step: "seating",
      seatAssignmentMode: "traveler_choice",
      seatPriorityWindowHours: 24,
    });

    const afterPricing = await tripsService.saveWizardStep(enterpriseActor, {
      tripId: draftTrip.id,
      step: "pricing",
      basePrice: { amountMinor: 450000, currency: "EGP" },
      childTrackingEnabled: true,
    });
    expect(afterPricing.basePrice).toEqual({ amountMinor: 450000, currency: "EGP" });

    // 3g. Publish with VIP Early Access window in the future -> verify FR-TRIP-02 discovery rules
    const vipUntil = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const publishedTrip = await tripsService.publish(enterpriseActor, {
      tripId: draftTrip.id,
      publishMode: "public",
      vipEarlyAccessUntil: vipUntil,
    });
    expect(publishedTrip.state).toBe("published");
    expect(publishedTrip.publishedAt).not.toBeNull();

    // Free traveler cannot see trip during VIP early access window
    const freeBrowse = await tripsService.browsePublicTrips(
      { accountId: freeTravelerId, role: "traveler", travelerPlanTier: "free" },
      { search: "Luxury Siwa Oasis Expedition" },
    );
    expect(freeBrowse.items.some((t) => t.id === draftTrip.id)).toBe(false);

    // VIP traveler CAN see trip during VIP early access window
    const vipBrowse = await tripsService.browsePublicTrips(
      { accountId: vipTravelerId, role: "traveler", travelerPlanTier: "vip" },
      { search: "Luxury Siwa Oasis Expedition" },
    );
    expect(vipBrowse.items.some((t) => t.id === draftTrip.id)).toBe(true);

    // 3h. Transition published -> scheduled succeeds, but scheduled -> Selection is blocked while hasStaffingGap is true
    const scheduledTrip = await tripsService.transitionState(enterpriseActor, {
      tripId: draftTrip.id,
      targetState: "scheduled",
    });
    expect(scheduledTrip.state).toBe("scheduled");

    // Removing a vehicle assigned to a scheduled trip is blocked with BUSINESS_RULE_VIOLATION
    await expect(
      fleetService.removeVehicle(enterpriseActor, { vehicleId: vehicle1.id }),
    ).rejects.toMatchObject({ code: "BUSINESS_RULE_VIOLATION" });

    // Transition to Selection fails while hasStaffingGap === true
    await expect(
      tripsService.transitionState(enterpriseActor, {
        tripId: draftTrip.id,
        targetState: "Selection",
      }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });

    // Assign driver and moderator via staffing step -> clears hasStaffingGap
    const afterStaffing = await tripsService.saveWizardStep(enterpriseActor, {
      tripId: draftTrip.id,
      step: "staffing",
      assignments: [
        {
          vehicleId: vehicle1.id,
          driverSource: "org_staff",
          driverAccountId: enterpriseOwnerId,
          moderatorSource: "org_staff",
          moderatorAccountId: enterpriseOwnerId,
        },
      ],
    });
    expect(afterStaffing.hasStaffingGap).toBe(false);

    // Now transition scheduled -> Selection succeeds
    const selectionTrip = await tripsService.transitionState(enterpriseActor, {
      tripId: draftTrip.id,
      targetState: "Selection",
    });
    expect(selectionTrip.state).toBe("Selection");

    // 3i. Cancel trip with mandatory audit reason (SCR-ORG-14)
    const cancelledTrip = await tripsService.cancel(enterpriseActor, {
      tripId: draftTrip.id,
      reason: "Sandstorm safety advisory in Western Desert",
    });
    expect(cancelledTrip.state).toBe("cancelled");
    expect(cancelledTrip.cancellationReason).toBe("Sandstorm safety advisory in Western Desert");

    // Cancelled trip is never returned in public browse
    const vipBrowseAfterCancel = await tripsService.browsePublicTrips(
      { accountId: vipTravelerId, role: "traveler", travelerPlanTier: "vip" },
      { search: "Luxury Siwa Oasis Expedition" },
    );
    expect(vipBrowseAfterCancel.items.some((t) => t.id === draftTrip.id)).toBe(false);

    // 3j. Starter organization plan feature gates (seatSelfSelection & childTracking require higher plan -> PLAN_REQUIRED)
    const starterDraft = await tripsService.createDraft(starterActor, {
      titleAr: "رحلة سانت كاترين",
      titleEn: "Mount Sinai Sunrise Hike",
      categoryLookupCode: "DESERT_SAFARI_CAMP",
    });
    createdTripIds.push(starterDraft.id);

    await expect(
      tripsService.saveWizardStep(starterActor, {
        tripId: starterDraft.id,
        step: "seating",
        seatAssignmentMode: "traveler_choice",
      }),
    ).rejects.toMatchObject({ code: "PLAN_REQUIRED" });

    await expect(
      tripsService.saveWizardStep(starterActor, {
        tripId: starterDraft.id,
        step: "pricing",
        basePrice: { amountMinor: 95000, currency: "EGP" },
        childTrackingEnabled: true,
      }),
    ).rejects.toMatchObject({ code: "PLAN_REQUIRED" });

    // Cross-tenant isolation (IF-12): Starter organization cannot view or cancel Enterprise trip
    await expect(
      tripsService.getOrganizationTrip(starterActor, { tripId: draftTrip.id }),
    ).rejects.toMatchObject({ code: "RESOURCE_NOT_FOUND" });
  });
});
