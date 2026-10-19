// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import {
  and,
  type Database,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  linkUploadedFilesOnItemSave,
  lte,
  ne,
  or,
  schema,
  sql,
} from "@trips-app/db";

import type {
  CurrencyCode,
  SeatLayoutConfig,
  SupportedLocale,
  TripPublishMode,
  TripRoutePoint,
  TripSeatAssignmentMode,
  TripStaffSource,
  TripState,
  TripWizardStepCompletion,
  UserRole,
} from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const {
  accounts,
  auditLogs,
  organizations,
  planCatalog,
  trips,
  tripVehicles,
  vehicles,
  vehicleTypes,
} = schema;

export function createTripsRepository(db: Database) {
  return {
    async findOrganizationByTenantId(tenantId: string) {
      const [row] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, tenantId))
        .limit(1);
      return row ?? null;
    },

    async findOrganizationPlanInDb(planTier: string) {
      const [row] = await db
        .select()
        .from(planCatalog)
        .where(and(eq(planCatalog.role, "organization"), eq(planCatalog.tier, planTier)))
        .limit(1);
      return row ?? null;
    },

    async findAccountById(accountId: string) {
      const [row] = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1);
      return row ?? null;
    },

    async countPublishedOrActiveTripsThisMonth(tenantId: string, monthStart: Date) {
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(trips)
        .where(
          and(
            eq(trips.tenantId, tenantId),
            ne(trips.state, "draft"),
            ne(trips.state, "cancelled"),
            gte(trips.createdAt, monthStart),
          ),
        );
      return Number(row?.count ?? 0);
    },

    async findTripByIdForTenant(tenantId: string, tripId: string) {
      const [row] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, tripId), eq(trips.tenantId, tenantId)))
        .limit(1);
      return row ?? null;
    },

    async listTripsForTenant(
      tenantId: string,
      filters?: {
        state?: TripState;
        search?: string;
        hasStaffingGap?: boolean;
      },
    ) {
      const conditions = [eq(trips.tenantId, tenantId)];
      if (filters?.state) {
        conditions.push(eq(trips.state, filters.state));
      }
      if (filters?.hasStaffingGap !== undefined) {
        conditions.push(eq(trips.hasStaffingGap, filters.hasStaffingGap));
      }
      if (filters?.search) {
        const pattern = `%${filters.search}%`;
        conditions.push(or(ilike(trips.titleAr, pattern), ilike(trips.titleEn, pattern))!);
      }

      return db
        .select()
        .from(trips)
        .where(and(...conditions))
        .orderBy(desc(trips.createdAt));
    },

    async listTripVehiclesForTrips(tenantId: string, tripIds: readonly string[]) {
      if (tripIds.length === 0) return [];
      return db
        .select({
          tripVehicle: tripVehicles,
          plateNumber: vehicles.plateNumber,
          model: vehicles.model,
        })
        .from(tripVehicles)
        .leftJoin(vehicles, eq(tripVehicles.vehicleId, vehicles.id))
        .where(
          and(eq(tripVehicles.tenantId, tenantId), inArray(tripVehicles.tripId, [...tripIds])),
        );
    },

    async findTenantVehiclesWithType(tenantId: string, vehicleIds: readonly string[]) {
      if (vehicleIds.length === 0) return [];
      return db
        .select({
          vehicle: vehicles,
          vehicleType: vehicleTypes,
        })
        .from(vehicles)
        .innerJoin(vehicleTypes, eq(vehicles.vehicleTypeId, vehicleTypes.id))
        .where(and(eq(vehicles.tenantId, tenantId), inArray(vehicles.id, [...vehicleIds])));
    },

    async insertDraftTrip(values: {
      tenantId: string;
      titleAr: string;
      titleEn: string;
      descriptionAr: string;
      descriptionEn: string;
      categoryLookupCode: string;
      language: SupportedLocale;
      coverImageUrl: string | null;
      galleryImageUrls: string[];
      wizardSteps: TripWizardStepCompletion;
      createdByAccountId: string;
      fileIds?: readonly string[];
    }) {
      const now = new Date();
      const [created] = await db
        .insert(trips)
        .values({
          tenantId: values.tenantId,
          titleAr: values.titleAr,
          titleEn: values.titleEn,
          descriptionAr: values.descriptionAr,
          descriptionEn: values.descriptionEn,
          categoryLookupCode: values.categoryLookupCode,
          language: values.language,
          coverImageUrl: values.coverImageUrl,
          galleryImageUrls: values.galleryImageUrls,
          timezone: "Africa/Cairo",
          currencyCode: "EGP",
          state: "draft",
          publishMode: "draft",
          wizardSteps: values.wizardSteps,
          hasStaffingGap: true,
          createdByAccountId: values.createdByAccountId,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const allUrls = [values.coverImageUrl, ...values.galleryImageUrls].filter((u): u is string =>
        Boolean(u),
      );
      if (allUrls.length > 0 || (values.fileIds && values.fileIds.length > 0)) {
        await linkUploadedFilesOnItemSave(db, {
          entityType: "trip",
          entityId: created!.id,
          tenantId: values.tenantId,
          uploaderAccountId: values.createdByAccountId,
          fileIds: values.fileIds,
          urls: allUrls,
          storageKeys: allUrls,
          replaceExistingForEntity: true,
          now,
        });
      }

      return created!;
    },

    async updateTripForTenant(
      tenantId: string,
      tripId: string,
      patch: {
        titleAr?: string;
        titleEn?: string;
        descriptionAr?: string;
        descriptionEn?: string;
        categoryLookupCode?: string;
        language?: SupportedLocale;
        coverImageUrl?: string | null;
        galleryImageUrls?: string[];
        startsAt?: Date | null;
        endsAt?: Date | null;
        timezone?: string;
        origin?: TripRoutePoint | null;
        destinations?: TripRoutePoint[];
        seatAssignmentMode?: TripSeatAssignmentMode;
        seatPriorityWindowHours?: number;
        basePriceMinor?: number;
        currencyCode?: CurrencyCode;
        totalCapacity?: number;
        childTrackingEnabled?: boolean;
        state?: TripState;
        publishMode?: TripPublishMode;
        targetedAudienceIds?: string[];
        vipEarlyAccessUntil?: Date | null;
        wizardSteps?: TripWizardStepCompletion;
        hasStaffingGap?: boolean;
        publishedAt?: Date | null;
        cancelledAt?: Date | null;
        cancellationReason?: string | null;
        cancelledByAccountId?: string | null;
        updatedByAccountId?: string;
        fileIds?: readonly string[];
      },
    ) {
      const now = new Date();
      const { updatedByAccountId, fileIds, ...dbPatch } = patch;
      const [updated] = await db
        .update(trips)
        .set({
          ...dbPatch,
          updatedAt: now,
        })
        .where(and(eq(trips.id, tripId), eq(trips.tenantId, tenantId)))
        .returning();

      if (!updated) return null;

      if (
        patch.coverImageUrl !== undefined ||
        patch.galleryImageUrls !== undefined ||
        fileIds !== undefined
      ) {
        const allUrls = [updated.coverImageUrl, ...(updated.galleryImageUrls ?? [])].filter(
          (u): u is string => Boolean(u),
        );
        await linkUploadedFilesOnItemSave(db, {
          entityType: "trip",
          entityId: updated.id,
          tenantId,
          uploaderAccountId: updatedByAccountId,
          fileIds,
          urls: allUrls,
          storageKeys: allUrls,
          replaceExistingForEntity: true,
          now,
        });
      }

      return updated;
    },

    async replaceTripVehicles(
      tenantId: string,
      tripId: string,
      snapshots: readonly {
        vehicleId: string;
        seatCountSnapshot: number;
        seatLayoutSnapshot: SeatLayoutConfig;
      }[],
    ) {
      const now = new Date();
      await db
        .delete(tripVehicles)
        .where(and(eq(tripVehicles.tenantId, tenantId), eq(tripVehicles.tripId, tripId)));

      if (snapshots.length === 0) return [];

      return db
        .insert(tripVehicles)
        .values(
          snapshots.map((item) => ({
            tenantId,
            tripId,
            vehicleId: item.vehicleId,
            seatCountSnapshot: item.seatCountSnapshot,
            seatLayoutSnapshot: item.seatLayoutSnapshot,
            driverSource: "unassigned" as const,
            moderatorSource: "unassigned" as const,
            photographerSource: "unassigned" as const,
            createdAt: now,
            updatedAt: now,
          })),
        )
        .returning();
    },

    async updateTripVehicleStaffing(
      tenantId: string,
      tripId: string,
      vehicleId: string,
      staffing: {
        driverSource: TripStaffSource;
        driverAccountId: string | null;
        moderatorSource: TripStaffSource;
        moderatorAccountId: string | null;
        photographerSource: TripStaffSource;
        photographerAccountId: string | null;
      },
    ) {
      const [updated] = await db
        .update(tripVehicles)
        .set({
          ...staffing,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(tripVehicles.tenantId, tenantId),
            eq(tripVehicles.tripId, tripId),
            eq(tripVehicles.vehicleId, vehicleId),
          ),
        )
        .returning();
      return updated ?? null;
    },

    async listPublicDiscoverableTrips(filters?: {
      search?: string;
      categoryLookupCode?: string;
      maxPriceMinor?: number;
    }) {
      const conditions = [
        inArray(trips.state, ["published", "scheduled", "Selection"]),
        ne(trips.publishMode, "draft"),
      ];
      if (filters?.categoryLookupCode) {
        conditions.push(
          eq(trips.categoryLookupCode, filters.categoryLookupCode.trim().toUpperCase()),
        );
      }
      if (filters?.maxPriceMinor !== undefined) {
        conditions.push(lte(trips.basePriceMinor, filters.maxPriceMinor));
      }
      if (filters?.search) {
        const pattern = `%${filters.search}%`;
        conditions.push(or(ilike(trips.titleAr, pattern), ilike(trips.titleEn, pattern))!);
      }

      return db
        .select({
          trip: trips,
          organizerNameAr: organizations.displayNameAr,
          organizerNameEn: organizations.displayNameEn,
        })
        .from(trips)
        .innerJoin(organizations, eq(trips.tenantId, organizations.id))
        .where(and(...conditions))
        .orderBy(desc(trips.publishedAt), desc(trips.createdAt));
    },

    async findPublicTripById(tripId: string) {
      const [row] = await db
        .select({
          trip: trips,
          organizerNameAr: organizations.displayNameAr,
          organizerNameEn: organizations.displayNameEn,
        })
        .from(trips)
        .innerJoin(organizations, eq(trips.tenantId, organizations.id))
        .where(eq(trips.id, tripId))
        .limit(1);
      return row ?? null;
    },

    async writeAuditLog(entry: {
      actorAccountId: string;
      actorRole: UserRole;
      tenantId: string;
      action: string;
      targetEntityType: string;
      targetEntityId: string;
      reason?: string | null;
      beforeState?: Record<string, unknown> | null;
      afterState?: Record<string, unknown> | null;
      ipAddress?: string | null;
      requestId?: string | null;
    }) {
      const [created] = await db.insert(auditLogs).values(entry).returning();
      return created!;
    },
  };
}
