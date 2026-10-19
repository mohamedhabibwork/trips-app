import { selectPhotographerProfilesSchema, selectTripPhotoAlbumsSchema } from "@trips-app/db/zod";

export const photographerProfileDtoSchema = selectPhotographerProfilesSchema;
export const tripPhotoAlbumDtoSchema = selectTripPhotoAlbumsSchema;
