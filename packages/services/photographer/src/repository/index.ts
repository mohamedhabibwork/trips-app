import { desc, eq } from "@trips-app/db";
import type { Database, Database as ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { UpdatePhotographerProfileInput } from "../types";

export type { ServiceDatabase };

export function createPhotographerRepository(db: Database) {
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

    async listAlbums(tripId?: string, photographerAccountId?: string) {
      if (tripId) {
        return db
          .select()
          .from(schema.tripPhotoAlbums)
          .where(eq(schema.tripPhotoAlbums.tripId, tripId))
          .orderBy(desc(schema.tripPhotoAlbums.createdAt));
      }
      if (photographerAccountId) {
        return db
          .select()
          .from(schema.tripPhotoAlbums)
          .where(eq(schema.tripPhotoAlbums.photographerAccountId, photographerAccountId))
          .orderBy(desc(schema.tripPhotoAlbums.createdAt));
      }
      return db
        .select()
        .from(schema.tripPhotoAlbums)
        .orderBy(desc(schema.tripPhotoAlbums.createdAt));
    },
  };
}

export type PhotographerRepository = ReturnType<typeof createPhotographerRepository>;
