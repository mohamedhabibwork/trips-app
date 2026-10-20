// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions.
import {
  insertPhotographerProfilesSchema,
  insertTripPhotoAlbumsSchema,
  selectPhotographerProfilesSchema,
  selectTripPhotoAlbumsSchema,
  updatePhotographerProfilesSchema,
  updateTripPhotoAlbumsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

export const photographerProfileSelectSchema = selectPhotographerProfilesSchema;
export const photographerProfileInsertSchema = insertPhotographerProfilesSchema;
export const photographerProfileUpdateSchema = updatePhotographerProfilesSchema;

export const tripPhotoAlbumSelectSchema = selectTripPhotoAlbumsSchema;
export const tripPhotoAlbumInsertSchema = insertTripPhotoAlbumsSchema;
export const tripPhotoAlbumUpdateSchema = updateTripPhotoAlbumsSchema;

export const updatePhotographerProfileSchema = updatePhotographerProfilesSchema
  .pick({
    yearsOfExperience: true,
    hasDroneLicense: true,
  })
  .extend({
    yearsOfExperience: z.number().int().min(0).max(60).optional(),
    cameraBodies: z.array(z.string().trim().min(1).max(120)).optional(),
    lenses: z.array(z.string().trim().min(1).max(120)).optional(),
    hasDroneLicense: z.boolean().optional(),
    serviceRegions: z.array(z.string().trim().min(1).max(80)).optional(),
    specialties: z.array(z.string().trim().min(1).max(80)).optional(),
  });

export const createTripAlbumSchema = insertTripPhotoAlbumsSchema
  .pick({
    tripId: true,
  })
  .extend({
    titleAr: z.string().trim().min(2).max(200),
    titleEn: z.string().trim().min(2).max(200),
    coverPhotoUrl: z.string().trim().min(1).max(500).nullable().optional(),
    watermarked: z.boolean().default(false),
  });

export const uploadPhotosToAlbumSchema = z.object({
  albumId: z.uuid(),
  photoUrls: z.array(z.string().trim().min(1).max(500)).min(1).max(100),
});

export const publishTripAlbumSchema = z.object({
  albumId: z.uuid(),
});

export const listTripAlbumsSchema = selectTripPhotoAlbumsSchema
  .pick({
    tripId: true,
  })
  .partial()
  .optional();
