// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, asc, eq, linkUploadedFilesOnItemSave, ne, schema, sql } from "@trips-app/db";
import type { ServiceDatabase } from "@trips-app/db";

import type { CurrencyCode, TripProgramStatus } from "../model";

export type { ServiceDatabase };

const { organizations, planCatalog, tripPrograms, trips } = schema;

export function createProgramsRepository(db: ServiceDatabase) {
  return {
    async findOrganizationPlan(tenantId: string) {
      const [row] = await db
        .select({
          org: organizations,
          plan: planCatalog,
        })
        .from(organizations)
        .leftJoin(
          planCatalog,
          and(eq(planCatalog.role, "organization"), eq(planCatalog.tier, organizations.planTier)),
        )
        .where(eq(organizations.id, tenantId))
        .limit(1);
      if (!row) return null;
      return { org: row.org, plan: row.plan };
    },

    async findTripForTenant(tenantId: string, tripId: string) {
      const [row] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, tripId), eq(trips.tenantId, tenantId)))
        .limit(1);
      return row ?? null;
    },

    async countActiveProgramsForTrip(tenantId: string, tripId: string) {
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tripPrograms)
        .where(
          and(
            eq(tripPrograms.tenantId, tenantId),
            eq(tripPrograms.tripId, tripId),
            ne(tripPrograms.status, "cancelled"),
          ),
        );
      return Number(row?.count ?? 0);
    },

    async insertProgram(values: {
      tenantId: string;
      tripId: string;
      titleAr: string;
      titleEn: string;
      descriptionAr: string;
      descriptionEn: string;
      dayNumber: number;
      startsAt: Date | null;
      endsAt: Date | null;
      locationNameAr: string | null;
      locationNameEn: string | null;
      priceMinor: number;
      currencyCode: CurrencyCode;
      isIncludedInBase: boolean;
      capacity: number | null;
      sortOrder: number;
      attachmentUrls: string[];
      createdByAccountId: string;
      fileIds?: readonly string[];
    }) {
      return db.transaction(async (tx) => {
        const now = new Date();
        const [created] = await tx
          .insert(tripPrograms)
          .values({
            tenantId: values.tenantId,
            tripId: values.tripId,
            titleAr: values.titleAr,
            titleEn: values.titleEn,
            descriptionAr: values.descriptionAr,
            descriptionEn: values.descriptionEn,
            dayNumber: values.dayNumber,
            startsAt: values.startsAt,
            endsAt: values.endsAt,
            locationNameAr: values.locationNameAr,
            locationNameEn: values.locationNameEn,
            priceMinor: values.priceMinor,
            currencyCode: values.currencyCode,
            isIncludedInBase: values.isIncludedInBase,
            capacity: values.capacity,
            sortOrder: values.sortOrder,
            attachmentUrls: values.attachmentUrls,
            status: "active",
            createdByAccountId: values.createdByAccountId,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        if (values.attachmentUrls.length > 0 || (values.fileIds && values.fileIds.length > 0)) {
          await linkUploadedFilesOnItemSave(tx, {
            entityType: "trip_program",
            entityId: created!.id,
            tenantId: values.tenantId,
            uploaderAccountId: values.createdByAccountId,
            fileIds: values.fileIds,
            urls: values.attachmentUrls,
            storageKeys: values.attachmentUrls,
            replaceExistingForEntity: true,
            now,
          });
        }

        // Mark wizardSteps.programs = true on the trip
        await tx
          .update(trips)
          .set({
            wizardSteps: sql`coalesce(${trips.wizardSteps}, '{}'::jsonb) || '{"programs": true}'::jsonb`,
            updatedAt: now,
          })
          .where(and(eq(trips.id, values.tripId), eq(trips.tenantId, values.tenantId)));

        return created!;
      });
    },

    async findProgramByIdForTenant(tenantId: string, programId: string) {
      const [row] = await db
        .select()
        .from(tripPrograms)
        .where(and(eq(tripPrograms.id, programId), eq(tripPrograms.tenantId, tenantId)))
        .limit(1);
      return row ?? null;
    },

    async updateProgramForTenant(
      tenantId: string,
      programId: string,
      patch: {
        titleAr?: string;
        titleEn?: string;
        descriptionAr?: string;
        descriptionEn?: string;
        dayNumber?: number;
        startsAt?: Date | null;
        endsAt?: Date | null;
        locationNameAr?: string | null;
        locationNameEn?: string | null;
        priceMinor?: number;
        currencyCode?: CurrencyCode;
        isIncludedInBase?: boolean;
        capacity?: number | null;
        sortOrder?: number;
        attachmentUrls?: string[];
        status?: TripProgramStatus;
        updatedByAccountId?: string;
        fileIds?: readonly string[];
      },
    ) {
      return db.transaction(async (tx) => {
        const now = new Date();
        const { updatedByAccountId, fileIds, ...dbPatch } = patch;
        const [updated] = await tx
          .update(tripPrograms)
          .set({ ...dbPatch, updatedAt: now })
          .where(and(eq(tripPrograms.id, programId), eq(tripPrograms.tenantId, tenantId)))
          .returning();
        if (!updated) return null;

        if (patch.attachmentUrls !== undefined || fileIds !== undefined) {
          await linkUploadedFilesOnItemSave(tx, {
            entityType: "trip_program",
            entityId: updated.id,
            tenantId,
            uploaderAccountId: updatedByAccountId,
            fileIds,
            urls: updated.attachmentUrls ?? [],
            storageKeys: updated.attachmentUrls ?? [],
            replaceExistingForEntity: true,
            now,
          });
        }
        return updated;
      });
    },

    async deleteProgramForTenant(tenantId: string, programId: string) {
      const [deleted] = await db
        .delete(tripPrograms)
        .where(and(eq(tripPrograms.id, programId), eq(tripPrograms.tenantId, tenantId)))
        .returning();
      return deleted ?? null;
    },

    async listProgramsForTrip(
      tenantId: string,
      tripId: string,
      optionsOrIncludeCancelled?:
        | boolean
        | {
            includeCancelled?: boolean;
            dayNumber?: number;
            isIncludedInBase?: boolean;
            limit?: number;
            offset?: number;
          },
    ) {
      const includeCancelled =
        typeof optionsOrIncludeCancelled === "boolean"
          ? optionsOrIncludeCancelled
          : optionsOrIncludeCancelled?.includeCancelled;
      const dayNumber =
        typeof optionsOrIncludeCancelled === "object"
          ? optionsOrIncludeCancelled.dayNumber
          : undefined;
      const isIncludedInBase =
        typeof optionsOrIncludeCancelled === "object"
          ? optionsOrIncludeCancelled.isIncludedInBase
          : undefined;
      const limit =
        typeof optionsOrIncludeCancelled === "object" ? optionsOrIncludeCancelled.limit : undefined;
      const offset =
        typeof optionsOrIncludeCancelled === "object"
          ? optionsOrIncludeCancelled.offset
          : undefined;

      let query = db.select().from(tripPrograms).$dynamic();
      const conditions = [eq(tripPrograms.tenantId, tenantId), eq(tripPrograms.tripId, tripId)];
      if (!includeCancelled) {
        conditions.push(ne(tripPrograms.status, "cancelled"));
      }
      if (dayNumber !== undefined) {
        conditions.push(eq(tripPrograms.dayNumber, dayNumber));
      }
      if (isIncludedInBase !== undefined) {
        conditions.push(eq(tripPrograms.isIncludedInBase, isIncludedInBase));
      }

      query = query
        .where(and(...conditions))
        .orderBy(
          asc(tripPrograms.dayNumber),
          asc(tripPrograms.sortOrder),
          asc(tripPrograms.createdAt),
        );
      if (limit !== undefined) query = query.limit(limit);
      if (offset !== undefined) query = query.offset(offset);
      return query;
    },

    async listPublicProgramsForTrip(
      tripId: string,
      options?: {
        dayNumber?: number;
        isIncludedInBase?: boolean;
        limit?: number;
        offset?: number;
      },
    ) {
      let query = db.select().from(tripPrograms).$dynamic();
      const conditions = [eq(tripPrograms.tripId, tripId), eq(tripPrograms.status, "active")];
      if (options?.dayNumber !== undefined) {
        conditions.push(eq(tripPrograms.dayNumber, options.dayNumber));
      }
      if (options?.isIncludedInBase !== undefined) {
        conditions.push(eq(tripPrograms.isIncludedInBase, options.isIncludedInBase));
      }

      query = query
        .where(and(...conditions))
        .orderBy(
          asc(tripPrograms.dayNumber),
          asc(tripPrograms.sortOrder),
          asc(tripPrograms.createdAt),
        );
      if (options?.limit !== undefined) query = query.limit(options.limit);
      if (options?.offset !== undefined) query = query.offset(options.offset);
      return query;
    },
  };
}
