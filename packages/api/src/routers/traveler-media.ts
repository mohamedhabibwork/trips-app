// Traveler albums (SCR-TRV-16/17): album lists for completed trips, album access with the
// audience privacy rules, and shared links carried by a 32-character opaque token.
// A revoked or unknown link resolves to "not found" — never to a permission error.
import { and, desc, eq, inArray, schema } from "@trips-app/db";
import { ServiceError } from "@trips-app/rpc";
import {
  ALBUM_PUBLIC_SIGNED_URL_SECONDS,
  ALBUM_SELECTED_SIGNED_URL_SECONDS,
  generateSharedLinkToken,
  isValidSharedLinkToken,
} from "@trips-app/domain";
import { authenticatedProcedure, publicProcedure } from "@trips-app/rpc";
import { z } from "zod/v4";

const SHARED_LINK_VALIDITY_DAYS = 30;
function toAlbumDto(row: {
  id: string;
  tripId: string;
  titleAr: string;
  titleEn: string;
  coverPhotoUrl: string | null;
  photoUrls: string[];
  photoCount: number;
  watermarked: boolean;
  audience: string;
  status: string;
  publishedAt: Date | null;
}) {
  return {
    id: row.id,
    tripId: row.tripId,
    titleAr: row.titleAr,
    titleEn: row.titleEn,
    coverPhotoUrl: row.coverPhotoUrl,
    photoUrls: row.photoUrls,
    photoCount: row.photoCount,
    watermarked: row.watermarked,
    audience: row.audience,
    status: row.status,
    publishedAt: row.publishedAt,
  };
}

export const travelerAlbumsRouter = {
  status: publicProcedure
    .route({
      method: "GET",
      path: "/traveler/albums/status",
      operationId: "travelerAlbumsStatus",
      summary: "Traveler albums service health status",
      tags: ["traveler"],
    })
    .handler(() => ({ service: "traveler-albums", status: "ok" as const })),

  /** Album list for the trips this traveler completed (photographer publish gate applied). */
  listMyAlbums: authenticatedProcedure
    .route({
      method: "GET",
      path: "/traveler/albums",
      operationId: "travelerAlbumsListMine",
      summary: "Published albums for the traveler's completed trips",
      tags: ["traveler"],
    })
    .handler(async ({ context }) => {
      const accountId = context.auth.accountId;

      const bookings = await context.db
        .select({ tripId: schema.bookings.tripId })
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.travelerAccountId, accountId),
            inArray(schema.bookings.status, ["confirmed", "checked_in", "completed", "refunded"]),
          ),
        );
      const tripIds = [...new Set(bookings.map((b) => b.tripId))];
      if (tripIds.length === 0) {
        return { albums: [] };
      }

      const rows = await context.db
        .select()
        .from(schema.tripPhotoAlbums)
        .where(
          and(
            inArray(schema.tripPhotoAlbums.tripId, tripIds),
            eq(schema.tripPhotoAlbums.status, "published"),
          ),
        )
        .orderBy(desc(schema.tripPhotoAlbums.publishedAt));

      // Audience privacy rule (SCR-TRV-17): selected-user albums only appear to their audience.
      const visible = rows.filter(
        (row) => row.audience === "public" || (row.audienceAccountIds ?? []).includes(accountId),
      );

      return {
        albums: visible.map((row) => ({
          ...toAlbumDto(row),
          signedUrlExpiresInSeconds:
            row.audience === "public"
              ? ALBUM_PUBLIC_SIGNED_URL_SECONDS
              : ALBUM_SELECTED_SIGNED_URL_SECONDS,
        })),
      };
    }),

  /** Open one album: public → 24h signed URLs, selected_travelers → 15 minutes. */
  getAlbum: authenticatedProcedure
    .route({
      method: "POST",
      path: "/traveler/albums/get",
      operationId: "travelerAlbumsGet",
      summary: "Album viewer access with audience privacy rules",
      tags: ["traveler"],
    })
    .input(z.object({ albumId: z.uuid() }))
    .handler(async ({ context, input }) => {
      const accountId = context.auth.accountId;
      const [album] = await context.db
        .select()
        .from(schema.tripPhotoAlbums)
        .where(
          and(
            eq(schema.tripPhotoAlbums.id, input.albumId),
            eq(schema.tripPhotoAlbums.status, "published"),
          ),
        )
        .limit(1);
      if (!album) {
        return { album: null, access: null };
      }

      if (
        album.audience === "selected_travelers" &&
        !(album.audienceAccountIds ?? []).includes(accountId)
      ) {
        // Selected-user album: hidden, same envelope as not found.
        return { album: null, access: null };
      }

      return {
        album: toAlbumDto(album),
        access: {
          audience: album.audience,
          signedUrlExpiresInSeconds:
            album.audience === "public"
              ? ALBUM_PUBLIC_SIGNED_URL_SECONDS
              : ALBUM_SELECTED_SIGNED_URL_SECONDS,
        },
      };
    }),

  /** Create a share link for a published album the traveler can already open. */
  createSharedLink: authenticatedProcedure
    .route({
      method: "POST",
      path: "/traveler/albums/shared-links/create",
      operationId: "travelerAlbumsCreateSharedLink",
      summary: "Create a 32-character shared album link",
      tags: ["traveler"],
    })
    .input(z.object({ albumId: z.uuid() }))
    .handler(async ({ context, input }) => {
      const accountId = context.auth.accountId;
      const [album] = await context.db
        .select()
        .from(schema.tripPhotoAlbums)
        .where(
          and(
            eq(schema.tripPhotoAlbums.id, input.albumId),
            eq(schema.tripPhotoAlbums.status, "published"),
          ),
        )
        .limit(1);
      if (!album) {
        throw new ServiceError("RESOURCE_NOT_FOUND", "Album not found.", undefined, "traveler");
      }
      if (
        album.audience === "selected_travelers" &&
        !(album.audienceAccountIds ?? []).includes(accountId)
      ) {
        throw new ServiceError("RESOURCE_NOT_FOUND", "Album not found.", undefined, "traveler");
      }

      const [existing] = await context.db
        .select()
        .from(schema.albumSharedLinks)
        .where(
          and(
            eq(schema.albumSharedLinks.albumId, album.id),
            eq(schema.albumSharedLinks.createdByAccountId, accountId),
            eq(schema.albumSharedLinks.status, "active"),
          ),
        )
        .limit(1);
      if (existing) {
        return { link: { id: existing.id, token: existing.token, albumId: album.id } };
      }

      const expiresAt = new Date(Date.now() + SHARED_LINK_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
      const [created] = await context.db
        .insert(schema.albumSharedLinks)
        .values({
          tenantId: album.tenantId,
          albumId: album.id,
          token: generateSharedLinkToken(),
          createdByAccountId: accountId,
          status: "active",
          expiresAt,
        })
        .returning();
      return { link: { id: created!.id, token: created!.token, albumId: album.id } };
    }),

  /** Revoke one of the traveler's own shared links. */
  revokeSharedLink: authenticatedProcedure
    .route({
      method: "POST",
      path: "/traveler/albums/shared-links/revoke",
      operationId: "travelerAlbumsRevokeSharedLink",
      summary: "Revoke a shared album link; the token stops resolving",
      tags: ["traveler"],
    })
    .input(z.object({ token: z.string().min(32).max(64) }))
    .handler(async ({ context, input }) => {
      const [revoked] = await context.db
        .update(schema.albumSharedLinks)
        .set({ status: "revoked", revokedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(schema.albumSharedLinks.token, input.token),
            eq(schema.albumSharedLinks.createdByAccountId, context.auth.accountId),
            eq(schema.albumSharedLinks.status, "active"),
          ),
        )
        .returning({ id: schema.albumSharedLinks.id });
      return { revoked: Boolean(revoked) };
    }),

  /** Public shared-link resolution: unknown, malformed or revoked tokens all read as not found. */
  resolveSharedLink: publicProcedure
    .route({
      method: "POST",
      path: "/traveler/albums/shared-links/resolve",
      operationId: "travelerAlbumsResolveSharedLink",
      summary: "Resolve a shared album token; revoked/unknown links return not found",
      tags: ["traveler"],
    })
    .input(z.object({ token: z.string().min(16).max(64) }))
    .handler(async ({ context, input }) => {
      if (!isValidSharedLinkToken(input.token)) {
        return { album: null };
      }
      const [link] = await context.db
        .select()
        .from(schema.albumSharedLinks)
        .where(
          and(
            eq(schema.albumSharedLinks.token, input.token),
            eq(schema.albumSharedLinks.status, "active"),
          ),
        )
        .limit(1);
      if (!link || (link.expiresAt && link.expiresAt.getTime() <= Date.now())) {
        return { album: null };
      }
      const [album] = await context.db
        .select()
        .from(schema.tripPhotoAlbums)
        .where(
          and(
            eq(schema.tripPhotoAlbums.id, link.albumId),
            eq(schema.tripPhotoAlbums.status, "published"),
          ),
        )
        .limit(1);
      if (!album) {
        return { album: null };
      }
      return {
        album: toAlbumDto(album),
        signedUrlExpiresInSeconds:
          album.audience === "public"
            ? ALBUM_PUBLIC_SIGNED_URL_SECONDS
            : ALBUM_SELECTED_SIGNED_URL_SECONDS,
      };
    }),
};
