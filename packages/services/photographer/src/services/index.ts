import { PhotographerServiceError } from "../errors";
import { createPhotographerRepository, type ServiceDatabase } from "../repository";
import type {
  CreateTripAlbumInput,
  PublishTripAlbumInput,
  UpdatePhotographerProfileInput,
  UploadPhotosToAlbumInput,
} from "../types";

export function createPhotographerService(deps: { db: ServiceDatabase }) {
  const repo = createPhotographerRepository(deps.db);

  return {
    async getProfile(accountId: string) {
      const profile = await repo.findProfileByAccountId(accountId);
      if (!profile) {
        throw new PhotographerServiceError(
          "PHOTOGRAPHER_PROFILE_NOT_FOUND",
          "Photographer profile not found.",
        );
      }
      return profile;
    },

    async updateProfile(accountId: string, input: UpdatePhotographerProfileInput) {
      const updated = await repo.updateProfile(accountId, input);
      if (!updated) {
        throw new PhotographerServiceError(
          "PHOTOGRAPHER_PROFILE_NOT_FOUND",
          "Photographer profile not found.",
        );
      }
      return updated;
    },

    async createTripAlbum(accountId: string, input: CreateTripAlbumInput) {
      const trip = await repo.findTripById(input.tripId);
      if (!trip) {
        throw new PhotographerServiceError("TRIP_NOT_FOUND", "Trip not found.");
      }
      return repo.insertAlbum({
        tenantId: trip.tenantId,
        tripId: trip.id,
        photographerAccountId: accountId,
        titleAr: input.titleAr,
        titleEn: input.titleEn,
        coverPhotoUrl: input.coverPhotoUrl ?? null,
        watermarked: input.watermarked,
      });
    },

    async uploadPhotosToAlbum(accountId: string, input: UploadPhotosToAlbumInput) {
      const album = await repo.findAlbumById(input.albumId);
      if (!album) {
        throw new PhotographerServiceError("ALBUM_NOT_FOUND", "Album not found.");
      }
      if (album.photographerAccountId !== accountId) {
        throw new PhotographerServiceError(
          "FORBIDDEN_ALBUM_ACCESS",
          "Only the album photographer can upload photos.",
        );
      }
      const combined = Array.from(new Set([...album.photoUrls, ...input.photoUrls]));
      const updated = await repo.updateAlbumPhotos(album.id, combined);
      if (!updated) {
        throw new PhotographerServiceError("ALBUM_NOT_FOUND", "Album not found.");
      }
      return updated;
    },

    async publishTripAlbum(accountId: string, input: PublishTripAlbumInput) {
      const album = await repo.findAlbumById(input.albumId);
      if (!album) {
        throw new PhotographerServiceError("ALBUM_NOT_FOUND", "Album not found.");
      }
      if (album.photographerAccountId !== accountId) {
        throw new PhotographerServiceError(
          "FORBIDDEN_ALBUM_ACCESS",
          "Only the album photographer can publish this album.",
        );
      }
      const updated = await repo.markAlbumPublished(album.id);
      if (!updated) {
        throw new PhotographerServiceError("ALBUM_NOT_FOUND", "Album not found.");
      }
      return updated;
    },

    async listTripAlbums(
      tripId?: string,
      actorOrPhotographerId?:
        | string
        | { accountId: string; role?: string; tenantId?: string | null },
    ) {
      const actor =
        typeof actorOrPhotographerId === "string"
          ? { accountId: actorOrPhotographerId, role: "platform_photographer" }
          : actorOrPhotographerId;
      const filterPhotographerId =
        actor?.role === "platform_photographer" || actor?.role === "org_photographer"
          ? actor.accountId
          : undefined;
      const albums = await repo.listAlbums(tripId, filterPhotographerId);
      if (!actor) {
        return albums;
      }
      return albums.filter((album) => {
        if (album.status === "published") return true;
        if (album.photographerAccountId === actor.accountId) return true;
        if (actor.role === "admin") return true;
        if (actor.tenantId && album.tenantId === actor.tenantId) return true;
        return false;
      });
    },
  };
}

export type PhotographerService = ReturnType<typeof createPhotographerService>;
