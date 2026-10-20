// Photographer studio screens in spec order: SCR-PHO-01..12 (10 has no URL; see the routes table).
import type { ScreenEntry } from "@/screens/types";
import { serverQueryOptions } from "@/utils/server-rpc";

import { AlbumPrivacy } from "./albums/album-privacy";
import { AlbumUpload } from "./albums/album-upload";
import { TripAlbums } from "./albums/trip-albums";
import { DealRequests } from "./deals/deal-requests";
import { StudioEarnings } from "./earnings/studio-earnings";
import { StudioHome } from "./home/studio-home";
import { PortfolioManager } from "./portfolio/portfolio-manager";
import { StudioProfile } from "./profile/studio-profile";
import { RatesAvailability } from "./rates/rates-availability";
import { StudioCoupons } from "./coupons/studio-coupons";
import { TripBrief } from "./briefs/trip-brief";

/** Loader guard every protected studio screen shares: no token, no prefetch on the server. */
async function sessionLoader({ auth }: { auth: { accessToken(): string | null } }): Promise<void> {
  if (typeof window === "undefined" && !auth.accessToken()) return;
}

export const STUDIO_SCREENS: readonly ScreenEntry[] = [
  {
    id: "SCR-PHO-01",
    slug: "studio-home",
    titleKey: "screen.registry.studio.studioHome.title",
    surface: "studio",
    component: StudioHome,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.photographer.getProfile, "photographer/getProfile", {
              input: undefined,
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.negotiation.listSupplierOffers,
              "negotiation/listSupplierOffers",
              {
                input: {},
              },
            ),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.availability.listMyBlocks, "availability/listMyBlocks", {
              input: undefined,
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.photographer.listTripAlbums, "photographer/listTripAlbums", {
              input: {},
            }),
          ),
        ]);
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
  {
    id: "SCR-PHO-02",
    slug: "portfolio-manager",
    titleKey: "screen.registry.studio.portfolioManager.title",
    surface: "studio",
    component: PortfolioManager,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.photographer.getProfile, "photographer/getProfile", {
              input: undefined,
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.plans.getMySubscription, "plans/getMySubscription", {
              input: undefined,
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", {
              input: { role: "platform_photographer" },
            }),
          ),
        ]);
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
  {
    id: "SCR-PHO-03",
    slug: "studio-profile",
    titleKey: "screen.registry.studio.studioProfile.title",
    surface: "studio",
    component: StudioProfile,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.photographer.getProfile, "photographer/getProfile", {
              input: undefined,
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.traveler.getProfile, "traveler/getProfile", {
              input: undefined,
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", {
              input: { role: "platform_photographer" },
            }),
          ),
        ]);
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
  {
    id: "SCR-PHO-04",
    slug: "rates-availability",
    titleKey: "screen.registry.studio.ratesAvailability.title",
    surface: "studio",
    component: RatesAvailability,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.prefetchQuery(
          serverQueryOptions(orpc.availability.listMyBlocks, "availability/listMyBlocks", {
            input: undefined,
          }),
        );
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
  {
    id: "SCR-PHO-05",
    slug: "deal-requests",
    titleKey: "screen.registry.studio.dealRequests.title",
    surface: "studio",
    component: DealRequests,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.prefetchQuery(
          serverQueryOptions(
            orpc.negotiation.listSupplierOffers,
            "negotiation/listSupplierOffers",
            {
              input: {},
            },
          ),
        );
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
  {
    id: "SCR-PHO-06",
    slug: "trip-brief",
    titleKey: "screen.registry.studio.tripBrief.title",
    surface: "studio",
    component: TripBrief,
    loader: async ({ queryClient, orpc, auth, params }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      const tripId = params.tripId;
      if (!tripId) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.trips.getPublicTripDetail, "trips/getPublicTripDetail", {
              input: { tripId },
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.programs.listPublicTripPrograms,
              "programs/listPublicTripPrograms",
              {
                input: { tripId },
              },
            ),
          ),
        ]);
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
  {
    id: "SCR-PHO-07",
    slug: "trip-albums",
    titleKey: "screen.registry.studio.tripAlbums.title",
    surface: "studio",
    component: TripAlbums,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.prefetchQuery(
          serverQueryOptions(orpc.photographer.listTripAlbums, "photographer/listTripAlbums", {
            input: {},
          }),
        );
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
  {
    id: "SCR-PHO-08",
    slug: "album-upload",
    titleKey: "screen.registry.studio.albumUpload.title",
    surface: "studio",
    component: AlbumUpload,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.prefetchQuery(
          serverQueryOptions(orpc.photographer.listTripAlbums, "photographer/listTripAlbums", {
            input: {},
          }),
        );
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
  {
    id: "SCR-PHO-09",
    slug: "album-privacy",
    titleKey: "screen.registry.studio.albumPrivacy.title",
    surface: "studio",
    component: AlbumPrivacy,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.photographer.listTripAlbums, "photographer/listTripAlbums", {
              input: {},
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", {
              input: { role: "platform_photographer" },
            }),
          ),
        ]);
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
  {
    // Watermark settings: the canvas folds this screen into the privacy page (SCR-PHO-09), so it
    // is registered as a component without a URL.
    id: "SCR-PHO-10",
    slug: "watermark-settings",
    titleKey: "screen.registry.studio.watermarkSettings.title",
    surface: "studio",
    component: AlbumPrivacy,
    loader: sessionLoader,
  },
  {
    id: "SCR-PHO-11",
    slug: "studio-earnings",
    titleKey: "screen.registry.studio.studioEarnings.title",
    surface: "studio",
    component: StudioEarnings,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.negotiation.listSupplierOffers,
              "negotiation/listSupplierOffers",
              {
                input: {},
              },
            ),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", {
              input: { role: "platform_photographer" },
            }),
          ),
        ]);
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
  {
    id: "SCR-PHO-12",
    slug: "studio-coupons",
    titleKey: "screen.registry.studio.studioCoupons.title",
    surface: "studio",
    component: StudioCoupons,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", {
              input: { role: "platform_photographer" },
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.plans.getMySubscription, "plans/getMySubscription", {
              input: undefined,
            }),
          ),
        ]);
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
];
