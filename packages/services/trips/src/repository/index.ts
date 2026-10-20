// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import {
  and,
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
  type ServiceDatabase,
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

export type { ServiceDatabase } from "@trips-app/db";

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

export function createTripsRepository(db: ServiceDatabase) {
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
        dateRange?: { from?: Date; to?: Date };
        pagination?: { limit?: number; offset?: number };
      },
    ) {
      let query = db.select().from(trips).$dynamic();

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
      if (filters?.dateRange?.from) {
        conditions.push(gte(trips.startsAt, filters.dateRange.from));
      }
      if (filters?.dateRange?.to) {
        conditions.push(lte(trips.startsAt, filters.dateRange.to));
      }

      query = query.where(and(...conditions));
      query = query.orderBy(desc(trips.createdAt));

      if (filters?.pagination?.limit) {
        query = query.limit(filters.pagination.limit);
      }
      if (filters?.pagination?.offset) {
        query = query.offset(filters.pagination.offset);
      }

      return query;
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
      return db.transaction(async (tx) => {
        const now = new Date();
        const [created] = await tx
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

        const allUrls = [values.coverImageUrl, ...values.galleryImageUrls].filter(
          (u): u is string => Boolean(u),
        );
        if (allUrls.length > 0 || (values.fileIds && values.fileIds.length > 0)) {
          await linkUploadedFilesOnItemSave(tx, {
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
      });
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
      return db.transaction(async (tx) => {
        const now = new Date();
        const { updatedByAccountId, fileIds, ...dbPatch } = patch;
        const [updated] = await tx
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
          await linkUploadedFilesOnItemSave(tx, {
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
      });
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
      return db.transaction(async (tx) => {
        const now = new Date();
        await tx
          .delete(tripVehicles)
          .where(and(eq(tripVehicles.tenantId, tenantId), eq(tripVehicles.tripId, tripId)));

        if (snapshots.length === 0) return [];

        return tx
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
      });
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
      dateRange?: { from?: Date; to?: Date };
      pagination?: { limit?: number; offset?: number };
    }) {
      let query = db
        .select({
          trip: trips,
          organizerNameAr: organizations.displayNameAr,
          organizerNameEn: organizations.displayNameEn,
        })
        .from(trips)
        .innerJoin(organizations, eq(trips.tenantId, organizations.id))
        .$dynamic();

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
      if (filters?.dateRange?.from) {
        conditions.push(gte(trips.startsAt, filters.dateRange.from));
      }
      if (filters?.dateRange?.to) {
        conditions.push(lte(trips.startsAt, filters.dateRange.to));
      }

      query = query.where(and(...conditions));
      query = query.orderBy(desc(trips.publishedAt), desc(trips.createdAt));

      if (filters?.pagination?.limit) {
        query = query.limit(filters.pagination.limit);
      }
      if (filters?.pagination?.offset) {
        query = query.offset(filters.pagination.offset);
      }

      return query;
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

    /** Seats taken by live bookings: confirmed always, pending payment only within its D-30
     * confirm window — matches the booking service's capacity check, so what travelers see
     * as available is what the booking will accept (the trips-table counters can be stale). */
    async sumActiveBookedPassengers(tripId: string, pendingCutoff: Date) {
      const [row] = await db
        .select({
          total: sql<number>`coalesce(sum(${schema.bookings.passengersCount}), 0)::int`,
        })
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.tripId, tripId),
            or(
              eq(schema.bookings.status, "confirmed"),
              and(
                eq(schema.bookings.status, "pending_payment"),
                sql`${schema.bookings.createdAt} >= ${pendingCutoff}`,
              ),
            ),
          ),
        );
      return Number(row?.total ?? 0);
    },

    /** Batched variant of sumActiveBookedPassengers for list surfaces (browse/landing):
     * live occupancy per trip so the cards match the detail view and the booking guard. */
    async sumActiveBookedPassengersByTrips(tripIds: string[], pendingCutoff: Date) {
      if (tripIds.length === 0) return new Map<string, number>();
      const rows = await db
        .select({
          tripId: schema.bookings.tripId,
          total: sql<number>`coalesce(sum(${schema.bookings.passengersCount}), 0)::int`,
        })
        .from(schema.bookings)
        .where(
          and(
            inArray(schema.bookings.tripId, tripIds),
            or(
              eq(schema.bookings.status, "confirmed"),
              and(
                eq(schema.bookings.status, "pending_payment"),
                sql`${schema.bookings.createdAt} >= ${pendingCutoff}`,
              ),
            ),
          ),
        )
        .groupBy(schema.bookings.tripId);
      return new Map(rows.map((row) => [row.tripId, Number(row.total)]));
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
