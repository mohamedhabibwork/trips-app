// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import {
  and,
  asc,
  type Database,
  eq,
  linkUploadedFilesOnItemSave,
  ne,
  schema,
  sql,
} from "@trips-app/db";

import type { CurrencyCode, TripProgramStatus } from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const { organizations, planCatalog, tripPrograms, trips } = schema;

export function createProgramsRepository(db: Database) {
  return {
    async findOrganizationPlan(tenantId: string) {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, tenantId))
        .limit(1);
      if (!org) return null;
      const [plan] = await db
        .select()
        .from(planCatalog)
        .where(and(eq(planCatalog.role, "organization"), eq(planCatalog.tier, org.planTier)))
        .limit(1);
      return { org, plan: plan ?? null };
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
      const now = new Date();
      const [created] = await db
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
        await linkUploadedFilesOnItemSave(db, {
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
      const [tripRow] = await db
        .select({ wizardSteps: trips.wizardSteps })
        .from(trips)
        .where(and(eq(trips.id, values.tripId), eq(trips.tenantId, values.tenantId)))
        .limit(1);
      if (tripRow) {
        await db
          .update(trips)
          .set({
            wizardSteps: {
              ...tripRow.wizardSteps,
              programs: true,
            },
            updatedAt: now,
          })
          .where(and(eq(trips.id, values.tripId), eq(trips.tenantId, values.tenantId)));
      }

      return created!;
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
      const now = new Date();
      const { updatedByAccountId, fileIds, ...dbPatch } = patch;
      const [updated] = await db
        .update(tripPrograms)
        .set({ ...dbPatch, updatedAt: now })
        .where(and(eq(tripPrograms.id, programId), eq(tripPrograms.tenantId, tenantId)))
        .returning();
      if (!updated) return null;

      if (patch.attachmentUrls !== undefined || fileIds !== undefined) {
        await linkUploadedFilesOnItemSave(db, {
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
    },

    async deleteProgramForTenant(tenantId: string, programId: string) {
      const [deleted] = await db
        .delete(tripPrograms)
        .where(and(eq(tripPrograms.id, programId), eq(tripPrograms.tenantId, tenantId)))
        .returning();
      return deleted ?? null;
    },

    async listProgramsForTrip(tenantId: string, tripId: string, includeCancelled = false) {
      const conditions = [eq(tripPrograms.tenantId, tenantId), eq(tripPrograms.tripId, tripId)];
      if (!includeCancelled) {
        conditions.push(ne(tripPrograms.status, "cancelled"));
      }
      return db
        .select()
        .from(tripPrograms)
        .where(and(...conditions))
        .orderBy(
          asc(tripPrograms.dayNumber),
          asc(tripPrograms.sortOrder),
          asc(tripPrograms.createdAt),
        );
    },

    async listPublicProgramsForTrip(tripId: string) {
      return db
        .select()
        .from(tripPrograms)
        .where(and(eq(tripPrograms.tripId, tripId), eq(tripPrograms.status, "active")))
        .orderBy(
          asc(tripPrograms.dayNumber),
          asc(tripPrograms.sortOrder),
          asc(tripPrograms.createdAt),
        );
    },
  };
}
