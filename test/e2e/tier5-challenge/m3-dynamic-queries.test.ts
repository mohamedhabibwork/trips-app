import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { inArray, schema } from "@trips-app/db";
import { getTestContext, getTestDb, TestEntityTracker } from "../helpers/db";
import { createOnboardingRepository } from "../../../packages/services/onboarding/src/repository";
import { createTripsRepository } from "../../../packages/services/trips/src/repository";
import { createEmployeesRepository } from "../../../packages/services/employees/src/repository";

describe("Tier 5 - Empirical Challenge: Dynamic Query Building ($dynamic()) & In-Memory Scan Elimination", () => {
  const db = getTestDb();
  const tracker = new TestEntityTracker();
  let ownerAccountId: string;

  // Custom trackers for entities not in TestEntityTracker
  const applicationIds: string[] = [];
  const extraAccountIds: string[] = [];
  const extraOrgIds: string[] = [];

  const onboardingRepo = createOnboardingRepository(db);
  const tripsRepo = createTripsRepository(db);
  const employeesRepo = createEmployeesRepository(db);

  beforeAll(async () => {
    const ctx = await getTestContext();
    ownerAccountId = ctx.ownerAccountId;
  });

  afterAll(async () => {
    // Clean up applications
    if (applicationIds.length > 0) {
      await db.delete(schema.applications).where(inArray(schema.applications.id, applicationIds));
    }
    // Clean up tracked entities
    await tracker.cleanup(db);
    // Clean up extra accounts & orgs
    if (extraAccountIds.length > 0) {
      await db.delete(schema.accounts).where(inArray(schema.accounts.id, extraAccountIds));
    }
    if (extraOrgIds.length > 0) {
      await db.delete(schema.organizations).where(inArray(schema.organizations.id, extraOrgIds));
    }
  });

  // =========================================================================
  // CHALLENGE 1: onboarding:listApplications & findLatestApplicationForApplicant
  // =========================================================================
  describe("CHALLENGE 1: onboarding:listApplications & findLatestApplicationForApplicant", () => {
    let applicantA: string;
    let applicantB: string;
    let app1Id: string; // driver, Pending Review, sla overdue, duplicateHold: true
    let app2Id: string; // driver, Pending Review, sla not overdue, duplicateHold: false
    let app3Id: string; // photographer, Approved, sla overdue date, duplicateHold: true
    let app4Id: string; // organization, Rejected, sla not overdue, payload {}
    let app5Id: string; // applicantB: driver, Pending Review, sla overdue, duplicateHold: true

    const refNow = new Date("2026-06-01T00:00:00Z");
    const pastSla = new Date("2026-05-01T00:00:00Z");
    const futureSla = new Date("2026-07-01T00:00:00Z");

    beforeAll(async () => {
      applicantA = randomUUID();
      applicantB = randomUUID();
      extraAccountIds.push(applicantA, applicantB);

      // Create applicant accounts
      await db.insert(schema.accounts).values([
        {
          id: applicantA,
          fullName: "Applicant Alpha",
          phoneE164: `+2010${Math.floor(10000000 + Math.random() * 90000000)}`,
          phoneBlindIndex: `bidx_alpha_${randomUUID()}`,
          phoneEncrypted: `enc_alpha_${randomUUID()}`,
          status: "active",
        },
        {
          id: applicantB,
          fullName: "Applicant Beta",
          phoneE164: `+2010${Math.floor(10000000 + Math.random() * 90000000)}`,
          phoneBlindIndex: `bidx_beta_${randomUUID()}`,
          phoneEncrypted: `enc_beta_${randomUUID()}`,
          status: "active",
        },
      ]);

      app1Id = randomUUID();
      app2Id = randomUUID();
      app3Id = randomUUID();
      app4Id = randomUUID();
      app5Id = randomUUID();
      applicationIds.push(app1Id, app2Id, app3Id, app4Id, app5Id);

      await db.insert(schema.applications).values([
        {
          id: app1Id,
          applicantAccountId: applicantA,
          applicationType: "driver",
          state: "Pending Review",
          slaDueAt: pastSla,
          payload: { duplicateHold: true, name: "Alpha Driver 1" },
          createdAt: new Date("2026-01-01T10:00:00Z"),
        },
        {
          id: app2Id,
          applicantAccountId: applicantA,
          applicationType: "driver",
          state: "Pending Review",
          slaDueAt: futureSla,
          payload: { duplicateHold: false, name: "Alpha Driver 2" },
          createdAt: new Date("2026-01-02T10:00:00Z"),
        },
        {
          id: app3Id,
          applicantAccountId: applicantA,
          applicationType: "photographer",
          state: "Approved",
          slaDueAt: pastSla,
          payload: { duplicateHold: true, name: "Alpha Photographer" },
          createdAt: new Date("2026-01-03T10:00:00Z"),
        },
        {
          id: app4Id,
          applicantAccountId: applicantA,
          applicationType: "organization",
          state: "Rejected",
          slaDueAt: futureSla,
          payload: { name: "Alpha Org" },
          createdAt: new Date("2026-01-04T10:00:00Z"),
        },
        {
          id: app5Id,
          applicantAccountId: applicantB,
          applicationType: "driver",
          state: "Pending Review",
          slaDueAt: pastSla,
          payload: { duplicateHold: true, name: "Beta Driver" },
          createdAt: new Date("2026-01-05T10:00:00Z"),
        },
      ]);
    });

    test("1.1 Empty & undefined filters: returns applications ordered by createdAt DESC without malformed SQL", async () => {
      const q = onboardingRepo.listApplications();
      const sqlObj = (q as any).toSQL ? (q as any).toSQL() : null;
      if (sqlObj) {
        expect(sqlObj.sql.toLowerCase()).toContain("order by");
        expect(sqlObj.sql.toLowerCase()).toContain("desc");
        // No WHERE clause when filter is undefined
        expect(sqlObj.sql.toLowerCase()).not.toContain("where");
      }

      const results = await q;
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThanOrEqual(5);

      // Verify order by createdAt descending
      const trackedResults = results.filter((r) => applicationIds.includes(r.id));
      expect(trackedResults.length).toBe(5);
      for (let i = 0; i < trackedResults.length - 1; i++) {
        expect(new Date(trackedResults[i]!.createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(trackedResults[i + 1]!.createdAt).getTime(),
        );
      }
    });

    test("1.2 Filter by state: strictly pushes WHERE state = ? into SQL and filters accurately", async () => {
      const q = onboardingRepo.listApplications({ state: "Pending Review" });
      const sqlObj = (q as any).toSQL ? (q as any).toSQL() : null;
      if (sqlObj) {
        expect(sqlObj.sql.toLowerCase()).toContain("where");
        expect(sqlObj.sql).toContain('"applications"."state" = $');
      }

      const results = await q;
      const tracked = results.filter((r) => applicationIds.includes(r.id));
      const ids = tracked.map((r) => r.id);

      expect(ids).toContain(app1Id);
      expect(ids).toContain(app2Id);
      expect(ids).toContain(app5Id);
      expect(ids).not.toContain(app3Id); // Approved
      expect(ids).not.toContain(app4Id); // Rejected
      expect(tracked.every((r) => r.state === "Pending Review")).toBe(true);
    });

    test("1.3 Filter by applicationType: strictly pushes WHERE application_type = ? into SQL", async () => {
      const q = onboardingRepo.listApplications({ applicationType: "driver" });
      const sqlObj = (q as any).toSQL ? (q as any).toSQL() : null;
      if (sqlObj) {
        expect(sqlObj.sql).toContain('"applications"."application_type" = $');
      }

      const results = await q;
      const tracked = results.filter((r) => applicationIds.includes(r.id));
      const ids = tracked.map((r) => r.id);

      expect(ids).toContain(app1Id);
      expect(ids).toContain(app2Id);
      expect(ids).toContain(app5Id);
      expect(ids).not.toContain(app3Id); // photographer
      expect(ids).not.toContain(app4Id); // organization
      expect(tracked.every((r) => r.applicationType === "driver")).toBe(true);
    });

    test("1.4 Filter by duplicateHoldOnly: queries JSONB payload in PostgreSQL without full scan", async () => {
      const q = onboardingRepo.listApplications({ duplicateHoldOnly: true });
      const sqlObj = (q as any).toSQL ? (q as any).toSQL() : null;
      if (sqlObj) {
        // Must contain JSONB arrow operator ->> 'duplicateHold' = 'true'
        expect(sqlObj.sql).toContain("->>'duplicateHold' = 'true'");
      }

      const results = await q;
      const tracked = results.filter((r) => applicationIds.includes(r.id));
      const ids = tracked.map((r) => r.id);

      expect(ids).toContain(app1Id); // duplicateHold: true
      expect(ids).toContain(app3Id); // duplicateHold: true
      expect(ids).toContain(app5Id); // duplicateHold: true
      expect(ids).not.toContain(app2Id); // duplicateHold: false
      expect(ids).not.toContain(app4Id); // missing duplicateHold
    });

    test("1.5 Filter by overdueOnly with custom `now`: enforces state='Pending Review' AND slaDueAt < now", async () => {
      const q = onboardingRepo.listApplications({ overdueOnly: true, now: refNow });
      const sqlObj = (q as any).toSQL ? (q as any).toSQL() : null;
      if (sqlObj) {
        expect(sqlObj.sql).toContain('"applications"."state" = $');
        expect(sqlObj.sql).toContain('"applications"."sla_due_at" < $');
      }

      const results = await q;
      const tracked = results.filter((r) => applicationIds.includes(r.id));
      const ids = tracked.map((r) => r.id);

      expect(ids).toContain(app1Id); // Pending Review & past SLA
      expect(ids).toContain(app5Id); // Pending Review & past SLA
      expect(ids).not.toContain(app2Id); // Pending Review BUT future SLA
      expect(ids).not.toContain(app3Id); // past SLA BUT state is Approved
      expect(ids).not.toContain(app4Id); // Rejected & future SLA
    });

    test("1.6 Multi-filter combination: state, applicationType, duplicateHoldOnly, and overdueOnly joined with AND", async () => {
      const q = onboardingRepo.listApplications({
        state: "Pending Review",
        applicationType: "driver",
        duplicateHoldOnly: true,
        overdueOnly: true,
        now: refNow,
      });

      const sqlObj = (q as any).toSQL ? (q as any).toSQL() : null;
      if (sqlObj) {
        // Assert no clause was dropped
        expect(sqlObj.sql).toContain('"applications"."application_type" = $');
        expect(sqlObj.sql).toContain("->>'duplicateHold' = 'true'");
        expect(sqlObj.sql).toContain('"applications"."sla_due_at" < $');
      }

      const results = await q;
      const tracked = results.filter((r) => applicationIds.includes(r.id));
      const ids = tracked.map((r) => r.id);

      // Only app1 and app5 satisfy ALL conditions:
      // - Pending Review
      // - driver
      // - duplicateHold: true
      // - overdue relative to refNow
      expect(ids).toEqual([app5Id, app1Id]); // Ordered by createdAt desc: app5 (Jan 5) then app1 (Jan 1)
    });

    test("1.7 findLatestApplicationForApplicant: with and without applicationType", async () => {
      // Without applicationType: applicantA has app1 (Jan 1), app2 (Jan 2), app3 (Jan 3), app4 (Jan 4).
      // Latest across all types is app4 (organization).
      const latestOverall = await onboardingRepo.findLatestApplicationForApplicant(applicantA);
      expect(latestOverall).not.toBeNull();
      expect(latestOverall?.id).toBe(app4Id);
      expect(latestOverall?.applicationType).toBe("organization");

      // With applicationType='driver': latest driver for applicantA is app2 (Jan 2), not app1 (Jan 1)
      const latestDriver = await onboardingRepo.findLatestApplicationForApplicant(applicantA, "driver");
      expect(latestDriver).not.toBeNull();
      expect(latestDriver?.id).toBe(app2Id);
      expect(latestDriver?.applicationType).toBe("driver");

      // With applicationType='photographer': latest photographer for applicantA is app3
      const latestPhoto = await onboardingRepo.findLatestApplicationForApplicant(applicantA, "photographer");
      expect(latestPhoto).not.toBeNull();
      expect(latestPhoto?.id).toBe(app3Id);

      // With non-existent applicationType for applicantB: returns null
      const nonExistent = await onboardingRepo.findLatestApplicationForApplicant(applicantB, "photographer");
      expect(nonExistent).toBeNull();

      // With unknown applicantId: returns null
      const unknownApplicant = await onboardingRepo.findLatestApplicationForApplicant(randomUUID());
      expect(unknownApplicant).toBeNull();
    });

    test("1.8 Contradictory filters: state='Approved' AND overdueOnly=true yields empty result safely", async () => {
      // Overdue requires state='Pending Review'; if state='Approved' is also passed, SQL has both conditions joined by AND
      const results = await onboardingRepo.listApplications({
        state: "Approved",
        overdueOnly: true,
        now: refNow,
      });
      const tracked = results.filter((r) => applicationIds.includes(r.id));
      expect(tracked.length).toBe(0);
    });

    test("1.9 Distant past `now` filter yields empty overdue list", async () => {
      const results = await onboardingRepo.listApplications({
        overdueOnly: true,
        now: new Date("1970-01-01T00:00:00Z"),
      });
      const tracked = results.filter((r) => applicationIds.includes(r.id));
      expect(tracked.length).toBe(0);
    });

    test("1.10 duplicateHoldOnly=false does not filter on duplicateHold", async () => {
      const results = await onboardingRepo.listApplications({
        duplicateHoldOnly: false,
        applicationType: "driver",
      });
      const tracked = results.filter((r) => applicationIds.includes(r.id));
      // Returns all 3 driver applications (app1, app2, app5) regardless of duplicateHold flag
      expect(tracked.length).toBe(3);
    });
  });

  // =========================================================================
  // CHALLENGE 2: trips:listTripsForTenant & trips:listPublicDiscoverableTrips
  // =========================================================================
  describe("CHALLENGE 2: trips:listTripsForTenant & trips:listPublicDiscoverableTrips", () => {
    let tenantA: string;
    let tenantB: string;
    let trip1Id: string; // tenantA, published, CULTURE, 50000, June 10, no gap
    let trip2Id: string; // tenantA, published, ADVENTURE, 120000, July 15, has gap
    let trip3Id: string; // tenantA, draft / draftMode, CULTURE, 200000, Aug 20, no gap
    let trip4Id: string; // tenantA, scheduled / publishedMode, ADVENTURE, 80000, Sept 05, has gap
    let trip5Id: string; // tenantB, published, CULTURE, 60000, June 15, no gap

    beforeAll(async () => {
      tenantA = tracker.trackOrganization(randomUUID());
      tenantB = tracker.trackOrganization(randomUUID());

      // Create organizations for tenantA and tenantB
      await db.insert(schema.organizations).values([
        {
          id: tenantA,
          ownerAccountId,
          legalEntityName: "Tenant Alpha Trips SAE",
          displayNameAr: "شركة ألفا للرحلات",
          displayNameEn: "Alpha Trips Co",
          commercialRegNumberEncrypted: `crn_${randomUUID()}`,
          taxNumberEncrypted: `tax_${randomUUID()}`,
          tourismLicenseNumberEncrypted: `lic_${randomUUID()}`,
          tourismLicenseExpiry: new Date("2027-01-01"),
          countryCode: "EG",
          headquartersAddress: "Cairo, Egypt",
          signatoryFullName: "Alpha Manager",
          signatoryNationalIdEncrypted: `nid_${randomUUID()}`,
          signatoryRoleTitle: "General Manager",
          payoutMethod: "bank_transfer",
          payoutIbanEncrypted: `iban_${randomUUID()}`,
          planTier: "starter",
          status: "active",
        },
        {
          id: tenantB,
          ownerAccountId,
          legalEntityName: "Tenant Beta Tours LLC",
          displayNameAr: "شركة بيتا للسياحة",
          displayNameEn: "Beta Tours Co",
          commercialRegNumberEncrypted: `crn_${randomUUID()}`,
          taxNumberEncrypted: `tax_${randomUUID()}`,
          tourismLicenseNumberEncrypted: `lic_${randomUUID()}`,
          tourismLicenseExpiry: new Date("2027-01-01"),
          countryCode: "EG",
          headquartersAddress: "Alexandria, Egypt",
          signatoryFullName: "Beta Manager",
          signatoryNationalIdEncrypted: `nid_${randomUUID()}`,
          signatoryRoleTitle: "Managing Director",
          payoutMethod: "bank_transfer",
          payoutIbanEncrypted: `iban_${randomUUID()}`,
          planTier: "starter",
          status: "active",
        },
      ]);

      trip1Id = tracker.trackTrip(randomUUID());
      trip2Id = tracker.trackTrip(randomUUID());
      trip3Id = tracker.trackTrip(randomUUID());
      trip4Id = tracker.trackTrip(randomUUID());
      trip5Id = tracker.trackTrip(randomUUID());

      await db.insert(schema.trips).values([
        {
          id: trip1Id,
          tenantId: tenantA,
          titleAr: "جولة الأهرامات الفرعونية الكبرى",
          titleEn: "Great Pharaohs Pyramids Tour",
          categoryLookupCode: "CULTURE",
          basePriceMinor: 50000,
          startsAt: new Date("2026-06-10T10:00:00Z"),
          state: "published",
          publishMode: "published",
          hasStaffingGap: false,
          publishedAt: new Date("2026-01-01T10:00:00Z"),
          createdAt: new Date("2026-01-01T10:00:00Z"),
        },
        {
          id: trip2Id,
          tenantId: tenantA,
          titleAr: "مغامرة سفاري الصحراء الشرقية",
          titleEn: "Eastern Desert Safari Adventure",
          categoryLookupCode: "ADVENTURE",
          basePriceMinor: 120000,
          startsAt: new Date("2026-07-15T08:00:00Z"),
          state: "published",
          publishMode: "published",
          hasStaffingGap: true,
          publishedAt: new Date("2026-01-02T10:00:00Z"),
          createdAt: new Date("2026-01-02T10:00:00Z"),
        },
        {
          id: trip3Id,
          tenantId: tenantA,
          titleAr: "كروز النيل الساحر",
          titleEn: "Charming Nile Cruise",
          categoryLookupCode: "CULTURE",
          basePriceMinor: 200000,
          startsAt: new Date("2026-08-20T12:00:00Z"),
          state: "draft",
          publishMode: "draft",
          hasStaffingGap: false,
          createdAt: new Date("2026-01-03T10:00:00Z"),
        },
        {
          id: trip4Id,
          tenantId: tenantA,
          titleAr: "رحلة غوص رأس محمد",
          titleEn: "Ras Mohammed Diving Expedition",
          categoryLookupCode: "ADVENTURE",
          basePriceMinor: 80000,
          startsAt: new Date("2026-09-05T09:00:00Z"),
          state: "scheduled",
          publishMode: "published",
          hasStaffingGap: true,
          publishedAt: new Date("2026-01-04T10:00:00Z"),
          createdAt: new Date("2026-01-04T10:00:00Z"),
        },
        {
          id: trip5Id,
          tenantId: tenantB,
          titleAr: "رحلة بيتا الحصرية",
          titleEn: "Beta Exclusive Pyramids Tour",
          categoryLookupCode: "CULTURE",
          basePriceMinor: 60000,
          startsAt: new Date("2026-06-15T10:00:00Z"),
          state: "published",
          publishMode: "published",
          hasStaffingGap: false,
          publishedAt: new Date("2026-01-05T10:00:00Z"),
          createdAt: new Date("2026-01-05T10:00:00Z"),
        },
      ]);
    });

    test("2.1 listTripsForTenant: strictly isolates tenant data in SQL", async () => {
      const tripsA = await tripsRepo.listTripsForTenant(tenantA);
      const tripsB = await tripsRepo.listTripsForTenant(tenantB);

      const idsA = tripsA.map((t) => t.id);
      const idsB = tripsB.map((t) => t.id);

      expect(idsA).toContain(trip1Id);
      expect(idsA).toContain(trip2Id);
      expect(idsA).toContain(trip3Id);
      expect(idsA).toContain(trip4Id);
      expect(idsA).not.toContain(trip5Id); // Belongs to tenantB!

      expect(idsB).toContain(trip5Id);
      expect(idsB).not.toContain(trip1Id);
    });

    test("2.2 listTripsForTenant: state filter & hasStaffingGap boolean filter", async () => {
      // State filter
      const drafts = await tripsRepo.listTripsForTenant(tenantA, { state: "draft" });
      expect(drafts.map((t) => t.id)).toEqual([trip3Id]);

      const published = await tripsRepo.listTripsForTenant(tenantA, { state: "published" });
      const pubIds = published.map((t) => t.id);
      expect(pubIds).toContain(trip1Id);
      expect(pubIds).toContain(trip2Id);
      expect(pubIds).not.toContain(trip3Id);
      expect(pubIds).not.toContain(trip4Id);

      // Staffing gap filter (hasStaffingGap = true)
      const withGap = await tripsRepo.listTripsForTenant(tenantA, { hasStaffingGap: true });
      const withGapIds = withGap.map((t) => t.id);
      expect(withGapIds).toContain(trip2Id);
      expect(withGapIds).toContain(trip4Id);
      expect(withGapIds).not.toContain(trip1Id);
      expect(withGapIds).not.toContain(trip3Id);

      // Staffing gap filter (hasStaffingGap = false)
      const withoutGap = await tripsRepo.listTripsForTenant(tenantA, { hasStaffingGap: false });
      const withoutGapIds = withoutGap.map((t) => t.id);
      expect(withoutGapIds).toContain(trip1Id);
      expect(withoutGapIds).toContain(trip3Id);
      expect(withoutGapIds).not.toContain(trip2Id);
      expect(withoutGapIds).not.toContain(trip4Id);
    });

    test("2.3 listTripsForTenant: case-insensitive ILIKE search (Arabic & English)", async () => {
      // English substring search
      const safari = await tripsRepo.listTripsForTenant(tenantA, { search: "safari" });
      expect(safari.map((t) => t.id)).toEqual([trip2Id]);

      // Arabic substring search
      const diving = await tripsRepo.listTripsForTenant(tenantA, { search: "غوص" });
      expect(diving.map((t) => t.id)).toEqual([trip4Id]);

      // Non-matching search
      const noMatch = await tripsRepo.listTripsForTenant(tenantA, { search: "nonexistent_trip_keyword" });
      expect(noMatch.length).toBe(0);
    });

    test("2.4 listTripsForTenant: dateRange from, to, and pagination limit & offset", async () => {
      // Date range from July to August 2026 -> should match trip2 (July 15) and trip3 (Aug 20)
      const inSummer = await tripsRepo.listTripsForTenant(tenantA, {
        dateRange: {
          from: new Date("2026-07-01T00:00:00Z"),
          to: new Date("2026-08-31T23:59:59Z"),
        },
      });
      const summerIds = inSummer.map((t) => t.id);
      expect(summerIds).toContain(trip2Id);
      expect(summerIds).toContain(trip3Id);
      expect(summerIds).not.toContain(trip1Id); // June
      expect(summerIds).not.toContain(trip4Id); // Sept

      // Pagination on all tenantA trips: total 4 trips ordered by createdAt DESC: [trip4, trip3, trip2, trip1]
      const page1 = await tripsRepo.listTripsForTenant(tenantA, {
        pagination: { limit: 2, offset: 0 },
      });
      expect(page1.length).toBe(2);
      expect(page1[0]!.id).toBe(trip4Id);
      expect(page1[1]!.id).toBe(trip3Id);

      const page2 = await tripsRepo.listTripsForTenant(tenantA, {
        pagination: { limit: 2, offset: 2 },
      });
      expect(page2.length).toBe(2);
      expect(page2[0]!.id).toBe(trip2Id);
      expect(page2[1]!.id).toBe(trip1Id);
    });

    test("2.5 listPublicDiscoverableTrips: enforces public visibility, joins organizer, and applies dynamic filters", async () => {
      // Public discoverable query should NEVER include trip3 (state: 'draft', publishMode: 'draft')
      const allPublic = await tripsRepo.listPublicDiscoverableTrips();
      const allPublicIds = allPublic.map((p) => p.trip.id);

      expect(allPublicIds).toContain(trip1Id);
      expect(allPublicIds).toContain(trip2Id);
      expect(allPublicIds).toContain(trip4Id);
      expect(allPublicIds).toContain(trip5Id);
      expect(allPublicIds).not.toContain(trip3Id); // DRAFT IS NEVER DISCOVERABLE!

      // Verify JOINed organizer fields
      const p1 = allPublic.find((p) => p.trip.id === trip1Id);
      expect(p1?.organizerNameEn).toBe("Alpha Trips Co");
      expect(p1?.organizerNameAr).toBe("شركة ألفا للرحلات");

      // Filter by categoryLookupCode (case-insensitive conversion)
      const adventure = await tripsRepo.listPublicDiscoverableTrips({ categoryLookupCode: "adventure" });
      const advIds = adventure.map((p) => p.trip.id);
      expect(advIds).toContain(trip2Id);
      expect(advIds).toContain(trip4Id);
      expect(advIds).not.toContain(trip1Id);
      expect(advIds).not.toContain(trip5Id);

      // Filter by maxPriceMinor
      const affordable = await tripsRepo.listPublicDiscoverableTrips({ maxPriceMinor: 80000 });
      const affIds = affordable.map((p) => p.trip.id);
      expect(affIds).toContain(trip1Id); // 50000 <= 80000
      expect(affIds).toContain(trip4Id); // 80000 <= 80000
      expect(affIds).toContain(trip5Id); // 60000 <= 80000
      expect(affIds).not.toContain(trip2Id); // 120000 > 80000

      // Combined category + maxPrice + dateRange
      const filtered = await tripsRepo.listPublicDiscoverableTrips({
        categoryLookupCode: "ADVENTURE",
        maxPriceMinor: 100000,
        dateRange: { from: new Date("2026-08-01T00:00:00Z") },
      });
      expect(filtered.map((p) => p.trip.id)).toEqual([trip4Id]); // Ras Mohammed Diving Expedition
    });

    test("2.6 SQL injection resilience: injection strings in search are safely parameterized", async () => {
      const injectionAttempt = "'; DROP TABLE trips; -- ' OR '1'='1";
      const results = await tripsRepo.listTripsForTenant(tenantA, {
        search: injectionAttempt,
      });
      // Parameterized search treats it as a literal string pattern, matching zero trips
      expect(results.length).toBe(0);

      // Verify trips table was not dropped!
      const allTrips = await tripsRepo.listTripsForTenant(tenantA);
      expect(allTrips.length).toBe(4);
    });

    test("2.7 maxPriceMinor=0 boundary: treated as valid filter, not falsy-skipped", async () => {
      const results = await tripsRepo.listPublicDiscoverableTrips({ maxPriceMinor: 0 });
      const ids = results.map((p) => p.trip.id);
      // None of our test trips have basePriceMinor <= 0 (they are 50000, 80000, 120000)
      expect(ids).not.toContain(trip1Id);
      expect(ids).not.toContain(trip2Id);
      expect(ids).not.toContain(trip4Id);
    });

    test("2.8 Inverted date range (from > to) yields empty set without SQL syntax errors", async () => {
      const results = await tripsRepo.listTripsForTenant(tenantA, {
        dateRange: {
          from: new Date("2026-12-01T00:00:00Z"),
          to: new Date("2026-01-01T00:00:00Z"),
        },
      });
      expect(results.length).toBe(0);
    });

    test("2.9 categoryLookupCode with untrimmed lowercase input is normalized correctly", async () => {
      const results = await tripsRepo.listPublicDiscoverableTrips({
        categoryLookupCode: "   adventure   ",
      });
      const ids = results.map((p) => p.trip.id);
      expect(ids).toContain(trip2Id);
      expect(ids).toContain(trip4Id);
      expect(ids).not.toContain(trip1Id);
    });
  });

  // =========================================================================
  // CHALLENGE 3: employees:listByTenant & employees:countActiveOrInvitedForTenant
  // =========================================================================
  describe("CHALLENGE 3: employees:listByTenant & employees:countActiveOrInvitedForTenant", () => {
    let tenantX: string;
    let tenantY: string;
    let account1: string;
    let account2: string;
    let m1Id: string; // tenantX, active, linked to account1 (Alice)
    let m2Id: string; // tenantX, invited, unlinked account (Bob)
    let m3Id: string; // tenantX, suspended, linked to account2 (Charlie)
    let m4Id: string; // tenantX, revoked, unlinked (Diana)
    let m5Id: string; // tenantY, active, linked (Eve)

    const dummyPermissions = {
      manage_trips: true,
      manage_bookings: true,
      manage_fleet: false,
      manage_employees: false,
      manage_finance: false,
    };

    beforeAll(async () => {
      tenantX = tracker.trackOrganization(randomUUID());
      tenantY = tracker.trackOrganization(randomUUID());

      account1 = randomUUID();
      account2 = randomUUID();
      extraAccountIds.push(account1, account2);

      // Create organizations
      await db.insert(schema.organizations).values([
        {
          id: tenantX,
          ownerAccountId,
          legalEntityName: "Tenant X Enterprises",
          displayNameAr: "مؤسسة إكس",
          displayNameEn: "Tenant X Corp",
          commercialRegNumberEncrypted: `crn_${randomUUID()}`,
          taxNumberEncrypted: `tax_${randomUUID()}`,
          tourismLicenseNumberEncrypted: `lic_${randomUUID()}`,
          tourismLicenseExpiry: new Date("2027-01-01"),
          countryCode: "EG",
          headquartersAddress: "Cairo, Egypt",
          signatoryFullName: "Signatory X",
          signatoryNationalIdEncrypted: `nid_${randomUUID()}`,
          signatoryRoleTitle: "President",
          payoutMethod: "bank_transfer",
          payoutIbanEncrypted: `iban_${randomUUID()}`,
          planTier: "starter",
          status: "active",
        },
        {
          id: tenantY,
          ownerAccountId,
          legalEntityName: "Tenant Y Logistics",
          displayNameAr: "مؤسسة واي",
          displayNameEn: "Tenant Y Corp",
          commercialRegNumberEncrypted: `crn_${randomUUID()}`,
          taxNumberEncrypted: `tax_${randomUUID()}`,
          tourismLicenseNumberEncrypted: `lic_${randomUUID()}`,
          tourismLicenseExpiry: new Date("2027-01-01"),
          countryCode: "EG",
          headquartersAddress: "Giza, Egypt",
          signatoryFullName: "Signatory Y",
          signatoryNationalIdEncrypted: `nid_${randomUUID()}`,
          signatoryRoleTitle: "President",
          payoutMethod: "bank_transfer",
          payoutIbanEncrypted: `iban_${randomUUID()}`,
          planTier: "starter",
          status: "active",
        },
      ]);

      // Create linked accounts
      await db.insert(schema.accounts).values([
        {
          id: account1,
          fullName: "Alice Wonderland",
          avatarUrl: "https://cdn.trips.com/avatars/alice.png",
          phoneE164: `+2011${Math.floor(10000000 + Math.random() * 90000000)}`,
          phoneBlindIndex: `bidx_${randomUUID()}`,
          phoneEncrypted: `enc_${randomUUID()}`,
          status: "active",
        },
        {
          id: account2,
          fullName: "Charlie Chaplin",
          avatarUrl: "https://cdn.trips.com/avatars/charlie.png",
          phoneE164: `+2011${Math.floor(10000000 + Math.random() * 90000000)}`,
          phoneBlindIndex: `bidx_${randomUUID()}`,
          phoneEncrypted: `enc_${randomUUID()}`,
          status: "active",
        },
      ]);

      m1Id = tracker.trackEmployee(randomUUID());
      m2Id = tracker.trackEmployee(randomUUID());
      m3Id = tracker.trackEmployee(randomUUID());
      m4Id = tracker.trackEmployee(randomUUID());
      m5Id = tracker.trackEmployee(randomUUID());

      await db.insert(schema.employeeMemberships).values([
        {
          id: m1Id,
          tenantId: tenantX,
          accountId: account1,
          invitedEmail: "alice@tenantx.com",
          roleTitle: "Operations Director",
          permissions: dummyPermissions,
          inviteTokenHash: `hash_${randomUUID()}`,
          inviteExpiresAt: new Date(Date.now() + 86400000 * 7),
          status: "active",
          createdAt: new Date("2026-01-01T10:00:00Z"),
        },
        {
          id: m2Id,
          tenantId: tenantX,
          accountId: null, // Unlinked
          invitedEmail: "bob.dispatcher@tenantx.com",
          roleTitle: "Trip Dispatcher",
          permissions: dummyPermissions,
          inviteTokenHash: `hash_${randomUUID()}`,
          inviteExpiresAt: new Date(Date.now() + 86400000 * 7),
          status: "invited",
          createdAt: new Date("2026-01-02T10:00:00Z"),
        },
        {
          id: m3Id,
          tenantId: tenantX,
          accountId: account2,
          invitedEmail: "charlie@tenantx.com",
          roleTitle: "Customer Support",
          permissions: dummyPermissions,
          inviteTokenHash: `hash_${randomUUID()}`,
          inviteExpiresAt: new Date(Date.now() + 86400000 * 7),
          status: "suspended",
          createdAt: new Date("2026-01-03T10:00:00Z"),
        },
        {
          id: m4Id,
          tenantId: tenantX,
          accountId: null,
          invitedEmail: "diana.analyst@tenantx.com",
          roleTitle: "Business Analyst",
          permissions: dummyPermissions,
          inviteTokenHash: `hash_${randomUUID()}`,
          inviteExpiresAt: new Date(Date.now() - 86400000),
          status: "revoked",
          createdAt: new Date("2026-01-04T10:00:00Z"),
        },
        {
          id: m5Id,
          tenantId: tenantY,
          accountId: account1,
          invitedEmail: "alice@tenanty.com",
          roleTitle: "External Consultant",
          permissions: dummyPermissions,
          inviteTokenHash: `hash_${randomUUID()}`,
          inviteExpiresAt: new Date(Date.now() + 86400000 * 7),
          status: "active",
          createdAt: new Date("2026-01-05T10:00:00Z"),
        },
      ]);
    });

    test("3.1 listByTenant: tenant isolation, status filter, and leftJoin accounts projection", async () => {
      // Tenant X list
      const listX = await employeesRepo.listByTenant(tenantX);
      const idsX = listX.map((m) => m.row.id);

      expect(idsX).toContain(m1Id);
      expect(idsX).toContain(m2Id);
      expect(idsX).toContain(m3Id);
      expect(idsX).toContain(m4Id);
      expect(idsX).not.toContain(m5Id); // Belongs to Tenant Y!

      // LeftJoin projection: m1 is linked to account1 -> fullName and avatarUrl present
      const m1 = listX.find((m) => m.row.id === m1Id);
      expect(m1?.fullName).toBe("Alice Wonderland");
      expect(m1?.avatarUrl).toBe("https://cdn.trips.com/avatars/alice.png");

      // LeftJoin projection: m2 is unlinked -> fullName and avatarUrl are null
      const m2 = listX.find((m) => m.row.id === m2Id);
      expect(m2?.fullName).toBeNull();
      expect(m2?.avatarUrl).toBeNull();

      // Status filter
      const activeOnly = await employeesRepo.listByTenant(tenantX, { status: "active" });
      expect(activeOnly.map((m) => m.row.id)).toEqual([m1Id]);

      const invitedOnly = await employeesRepo.listByTenant(tenantX, { status: "invited" });
      expect(invitedOnly.map((m) => m.row.id)).toEqual([m2Id]);

      const suspendedOnly = await employeesRepo.listByTenant(tenantX, { status: "suspended" });
      expect(suspendedOnly.map((m) => m.row.id)).toEqual([m3Id]);
    });

    test("3.2 listByTenant: search filter matches invitedEmail, roleTitle, and linked account fullName", async () => {
      // Search by email
      const byEmail = await employeesRepo.listByTenant(tenantX, { search: "bob.dispatcher" });
      expect(byEmail.map((m) => m.row.id)).toEqual([m2Id]);

      // Search by roleTitle
      const byRole = await employeesRepo.listByTenant(tenantX, { search: "Support" });
      expect(byRole.map((m) => m.row.id)).toEqual([m3Id]);

      // Search by linked account fullName
      const byName = await employeesRepo.listByTenant(tenantX, { search: "Alice" });
      expect(byName.map((m) => m.row.id)).toEqual([m1Id]);
    });

    test("3.3 countActiveOrInvitedForTenant: strictly aggregates in SQL (active + invited only)", async () => {
      // Tenant X has: m1 (active), m2 (invited), m3 (suspended), m4 (revoked)
      // Active (1) + Invited (1) = 2
      const countX = await employeesRepo.countActiveOrInvitedForTenant(tenantX);
      expect(countX).toBe(2);

      // Tenant Y has: m5 (active) -> count = 1
      const countY = await employeesRepo.countActiveOrInvitedForTenant(tenantY);
      expect(countY).toBe(1);

      // Random non-existent tenant -> count = 0
      const countEmpty = await employeesRepo.countActiveOrInvitedForTenant(randomUUID());
      expect(countEmpty).toBe(0);
    });

    test("3.4 Whitespace handling in employee search", async () => {
      // Untrimmed name matches
      const untrimmed = await employeesRepo.listByTenant(tenantX, { search: "   Alice   " });
      expect(untrimmed.map((m) => m.row.id)).toEqual([m1Id]);

      // Whitespace-only search is ignored (treated as no search filter)
      const whitespaceOnly = await employeesRepo.listByTenant(tenantX, { search: "    " });
      const ids = whitespaceOnly.map((m) => m.row.id);
      expect(ids.length).toBe(4);
    });

    test("3.5 Non-existent employee membership status returns empty array", async () => {
      const results = await employeesRepo.listByTenant(tenantX, {
        status: "nonexistent_status" as any,
      });
      expect(results.length).toBe(0);
    });
  });

  // =========================================================================
  // CHALLENGE 4: Clause Dropping & SQL Syntax Hardening
  // =========================================================================
  describe("CHALLENGE 4: Clause Dropping & SQL Syntax Hardening", () => {
    function createCapturingDb(baseDb: typeof db) {
      let lastSql: { sql: string; params: unknown[] } | null = null;

      function wrapQb(qb: any): any {
        return new Proxy(qb, {
          get(targetQb, qbProp) {
            const val = targetQb[qbProp];
            if (typeof val === "function") {
              return (...fnArgs: any[]) => {
                const res = val.apply(targetQb, fnArgs);
                if (res && typeof res.toSQL === "function") {
                  try {
                    lastSql = res.toSQL();
                  } catch {}
                }
                if (res && typeof res === "object" && typeof res.then === "function") {
                  return wrapQb(res);
                }
                return res;
              };
            }
            return val;
          },
        });
      }

      const proxy = new Proxy(baseDb, {
        get(target, prop, receiver) {
          if (prop === "select") {
            return (...args: any[]) => {
              const qb = (target as any).select(...args);
              return wrapQb(qb);
            };
          }
          return Reflect.get(target, prop, receiver);
        },
      });
      return { capturingDb: proxy as typeof db, getLastSql: () => lastSql };
    }

    test("4.1 tripsRepo.listTripsForTenant preserves all stacked clauses without dropping any", async () => {
      const { capturingDb, getLastSql } = createCapturingDb(db);
      const testRepo = createTripsRepository(capturingDb);

      await testRepo.listTripsForTenant("00000000-0000-0000-0000-000000000001", {
        state: "published",
        hasStaffingGap: true,
        search: "Pharaohs",
        dateRange: {
          from: new Date("2026-06-01T00:00:00Z"),
          to: new Date("2026-08-31T00:00:00Z"),
        },
        pagination: { limit: 10, offset: 20 },
      });

      const sqlObj = getLastSql();
      expect(sqlObj).not.toBeNull();
      const generatedSql = sqlObj!.sql.toLowerCase();

      // Verify all condition clauses are present in the SQL text
      expect(generatedSql).toContain('"tenant_id" = $');
      expect(generatedSql).toContain('"state" = $');
      expect(generatedSql).toContain('"has_staffing_gap" = $');
      expect(generatedSql).toContain('"starts_at" >= $');
      expect(generatedSql).toContain('"starts_at" <= $');
      expect(generatedSql).toContain("limit $");
      expect(generatedSql).toContain("offset $");
      expect(generatedSql).toContain("order by");
      expect(generatedSql).toContain("desc");

      // Verify parameter bindings count:
      // $1: tenantId, $2: state, $3: hasStaffingGap, $4: search, $5: search, $6: from, $7: to, $8: limit, $9: offset
      expect(sqlObj!.params.length).toBeGreaterThanOrEqual(7);
    });

    test("4.2 tripsRepo.listPublicDiscoverableTrips preserves inner join and filters without SQL errors", async () => {
      const { capturingDb, getLastSql } = createCapturingDb(db);
      const testRepo = createTripsRepository(capturingDb);

      await testRepo.listPublicDiscoverableTrips({
        categoryLookupCode: "ADVENTURE",
        maxPriceMinor: 150000,
        search: "Safari",
        dateRange: { from: new Date("2026-06-01T00:00:00Z") },
        pagination: { limit: 5, offset: 15 },
      });

      const sqlObj = getLastSql();
      expect(sqlObj).not.toBeNull();
      const generatedSql = sqlObj!.sql.toLowerCase();

      expect(generatedSql).toContain("inner join");
      expect(generatedSql).toContain('"organizations"');
      expect(generatedSql).toContain('"trips"."category_lookup_code" = $');
      expect(generatedSql).toContain('"trips"."base_price_minor" <= $');
      expect(generatedSql).toContain('"trips"."starts_at" >= $');
      expect(generatedSql).toContain("limit $");
      expect(generatedSql).toContain("offset $");
    });
  });
});
