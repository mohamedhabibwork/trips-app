import type { z } from "zod/v4";
import type { photographerProfileDtoSchema, tripPhotoAlbumDtoSchema } from "../schemas";
import type {
  createTripAlbumSchema,
  publishTripAlbumSchema,
  updatePhotographerProfileSchema,
  uploadPhotosToAlbumSchema,
} from "../schemas/validation";

export type UpdatePhotographerProfileInput = z.infer<typeof updatePhotographerProfileSchema>;
export type CreateTripAlbumInput = z.infer<typeof createTripAlbumSchema>;
export type UploadPhotosToAlbumInput = z.infer<typeof uploadPhotosToAlbumSchema>;
export type PublishTripAlbumInput = z.infer<typeof publishTripAlbumSchema>;
export type PhotographerProfileDto = z.infer<typeof photographerProfileDtoSchema>;
export type TripPhotoAlbumDto = z.infer<typeof tripPhotoAlbumDtoSchema>;
