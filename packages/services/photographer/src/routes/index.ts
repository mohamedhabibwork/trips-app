import {
  createTripAlbumSchema,
  listTripAlbumsSchema,
  photographerProfileDtoSchema,
  publishTripAlbumSchema,
  tripPhotoAlbumDtoSchema,
  updatePhotographerProfileSchema,
  uploadPhotosToAlbumSchema,
} from "../schemas";
import { createPhotographerService } from "../services";
import {
  photographerAlbumManageProcedure,
  photographerAuthenticatedProcedure,
  photographerRoleProcedure,
  procedure,
} from "./procedure";

const status = procedure
  .route({
    method: "GET",
    path: "/photographer/status",
    summary: "Health check for the photographer service",
    tags: ["photographer"],
  })
  .handler(async () => ({ service: "photographer" as const, status: "ok" as const }));

const getProfile = photographerRoleProcedure
  .output(photographerProfileDtoSchema)
  .handler(async ({ context }) => {
    const svc = createPhotographerService({ db: context.db });
    return await svc.getProfile(context.auth.accountId);
  });

const updateProfile = photographerRoleProcedure
  .input(updatePhotographerProfileSchema)
  .output(photographerProfileDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPhotographerService({ db: context.db });
    return await svc.updateProfile(context.auth.accountId, input);
  });

const createTripAlbum = photographerAlbumManageProcedure
  .input(createTripAlbumSchema)
  .output(tripPhotoAlbumDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPhotographerService({ db: context.db });
    return await svc.createTripAlbum(context.auth.accountId, input);
  });

const uploadPhotosToAlbum = photographerAlbumManageProcedure
  .input(uploadPhotosToAlbumSchema)
  .output(tripPhotoAlbumDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPhotographerService({ db: context.db });
    return await svc.uploadPhotosToAlbum(context.auth.accountId, input);
  });

const publishTripAlbum = photographerAlbumManageProcedure
  .input(publishTripAlbumSchema)
  .output(tripPhotoAlbumDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPhotographerService({ db: context.db });
    return await svc.publishTripAlbum(context.auth.accountId, input);
  });

const listTripAlbums = photographerAuthenticatedProcedure
  .input(listTripAlbumsSchema)
  .output(tripPhotoAlbumDtoSchema.array())
  .handler(async ({ context, input }) => {
    const svc = createPhotographerService({ db: context.db });
    return await svc.listTripAlbums(input?.tripId, {
      accountId: context.auth.accountId,
      role: context.auth.activeRole,
      tenantId: context.auth.activeTenantId,
    });
  });

export const routes = {
  status,
  getProfile,
  updateProfile,
  createTripAlbum,
  uploadPhotosToAlbum,
  publishTripAlbum,
  listTripAlbums,
};
