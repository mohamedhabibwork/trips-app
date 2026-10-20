import { and, desc, eq, gte, lte, schema, type ServiceDatabase } from "@trips-app/db";
import type { UpdatePhotographerProfileInput } from "../types";

export type { ServiceDatabase };

export function createPhotographerRepository(db: ServiceDatabase) {
  return {
    async findProfileByAccountId(accountId: string) {
      const [row] = await db
        .select()
        .from(schema.photographerProfiles)
        .where(eq(schema.photographerProfiles.accountId, accountId))
        .limit(1);
      return row ?? null;
    },

    async updateProfile(accountId: string, patch: UpdatePhotographerProfileInput) {
      const [updated] = await db
        .update(schema.photographerProfiles)
        .set({
          ...patch,
          updatedAt: new Date(),
        })
        .where(eq(schema.photographerProfiles.accountId, accountId))
        .returning();
      return updated ?? null;
    },

    async findTripById(tripId: string) {
      const [row] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId))
        .limit(1);
      return row ?? null;
    },

    async insertAlbum(values: {
      tenantId: string;
      tripId: string;
      photographerAccountId: string;
      titleAr: string;
      titleEn: string;
      coverPhotoUrl: string | null;
      watermarked: boolean;
    }) {
      const [created] = await db
        .insert(schema.tripPhotoAlbums)
        .values({
          ...values,
          photoUrls: [],
          photoCount: 0,
          status: "draft",
        })
        .returning();
      return created!;
    },

    async findAlbumById(albumId: string) {
      const [row] = await db
        .select()
        .from(schema.tripPhotoAlbums)
        .where(eq(schema.tripPhotoAlbums.id, albumId))
        .limit(1);
      return row ?? null;
    },

    async updateAlbumPhotos(albumId: string, photoUrls: string[]) {
      const [updated] = await db
        .update(schema.tripPhotoAlbums)
        .set({
          photoUrls,
          photoCount: photoUrls.length,
          coverPhotoUrl: photoUrls[0] ?? null,
          updatedAt: new Date(),
        })
        .where(eq(schema.tripPhotoAlbums.id, albumId))
        .returning();
      return updated ?? null;
    },

    async markAlbumPublished(albumId: string) {
      const now = new Date();
      const [updated] = await db
        .update(schema.tripPhotoAlbums)
        .set({
          status: "published",
          publishedAt: now,
          updatedAt: now,
        })
        .where(eq(schema.tripPhotoAlbums.id, albumId))
        .returning();
      return updated ?? null;
    },

    async listAlbums(
      filtersOrTripId?:
        | string
        | {
            tripId?: string;
            photographerAccountId?: string;
            tenantId?: string;
            status?: "draft" | "published";
            dateRange?: { from?: Date; to?: Date };
          },
      photographerAccountId?: string,
    ) {
      let query = db.select().from(schema.tripPhotoAlbums).$dynamic();

      const conditions = [];

      if (typeof filtersOrTripId === "string") {
        conditions.push(eq(schema.tripPhotoAlbums.tripId, filtersOrTripId));
        if (photographerAccountId) {
          conditions.push(eq(schema.tripPhotoAlbums.photographerAccountId, photographerAccountId));
        }
      } else if (filtersOrTripId) {
        if (filtersOrTripId.tripId) {
          conditions.push(eq(schema.tripPhotoAlbums.tripId, filtersOrTripId.tripId));
        }
        if (filtersOrTripId.photographerAccountId) {
          conditions.push(
            eq(schema.tripPhotoAlbums.photographerAccountId, filtersOrTripId.photographerAccountId),
          );
        }
        if (filtersOrTripId.tenantId) {
          conditions.push(eq(schema.tripPhotoAlbums.tenantId, filtersOrTripId.tenantId));
        }
        if (filtersOrTripId.status) {
          conditions.push(eq(schema.tripPhotoAlbums.status, filtersOrTripId.status));
        }
        if (filtersOrTripId.dateRange?.from) {
          conditions.push(gte(schema.tripPhotoAlbums.createdAt, filtersOrTripId.dateRange.from));
        }
        if (filtersOrTripId.dateRange?.to) {
          conditions.push(lte(schema.tripPhotoAlbums.createdAt, filtersOrTripId.dateRange.to));
        }
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      query = query.orderBy(desc(schema.tripPhotoAlbums.createdAt));
      return query;
    },
  };
}

export type PhotographerRepository = ReturnType<typeof createPhotographerRepository>;
