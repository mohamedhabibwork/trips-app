import { z } from "zod/v4";

export const updatePhotographerProfileSchema = z.object({
  yearsOfExperience: z.number().int().min(0).max(60).optional(),
  cameraBodies: z.array(z.string().trim().min(1).max(120)).optional(),
  lenses: z.array(z.string().trim().min(1).max(120)).optional(),
  hasDroneLicense: z.boolean().optional(),
  serviceRegions: z.array(z.string().trim().min(1).max(80)).optional(),
  specialties: z.array(z.string().trim().min(1).max(80)).optional(),
});

export const createTripAlbumSchema = z.object({
  tripId: z.uuid(),
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

export const listTripAlbumsSchema = z
  .object({
    tripId: z.uuid().optional(),
  })
  .optional();
