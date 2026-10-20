// Traveler app screens in spec order: SCR-TRV-01 to SCR-TRV-21.
import type { ScreenEntry } from "@/screens/types";
import { Trv01TripBrowse } from "@/surfaces/traveler/screens/trv-01-trip-browse";
import { Trv02TripDetail } from "@/surfaces/traveler/screens/trv-02-trip-detail";
import { Trv03BookingPrograms } from "@/surfaces/traveler/screens/trv-03-booking-programs";
import { Trv04BookingSeats } from "@/surfaces/traveler/screens/trv-04-booking-seats";
import { Trv05BookingReview } from "@/surfaces/traveler/screens/trv-05-booking-review";
import { Trv06PaymentHandoff } from "@/surfaces/traveler/screens/trv-06-pay";
import { Trv07PaymentPending } from "@/surfaces/traveler/screens/trv-07-payment-pending";
import { Trv08PaymentFailed } from "@/surfaces/traveler/screens/trv-08-payment-failed";
import { Trv09BookingConfirmed } from "@/surfaces/traveler/screens/trv-09-booking-confirmed";
import { Trv10MyBookings } from "@/surfaces/traveler/screens/trv-10-my-bookings";
import { Trv11BookingDetail } from "@/surfaces/traveler/screens/trv-11-booking-detail";
import { Trv12CancelBooking } from "@/surfaces/traveler/screens/trv-12-cancel";
import { Trv13TripDay } from "@/surfaces/traveler/screens/trv-13-trip-day";
import { Trv14Receipts } from "@/surfaces/traveler/screens/trv-14-receipts";
import { Trv15HistoryAlbums } from "@/surfaces/traveler/screens/trv-15-history-albums";
import { Trv16AlbumViewer } from "@/surfaces/traveler/screens/trv-16-album-viewer";
import { Trv17SharedAlbum } from "@/surfaces/traveler/screens/trv-17-shared-album";
import { Trv18Plans } from "@/surfaces/traveler/screens/trv-18-plans";
import { Trv19Profile } from "@/surfaces/traveler/screens/trv-19-profile";
import { Trv20Privacy } from "@/surfaces/traveler/screens/trv-20-privacy";
import { Trv21BecomeSupplier } from "@/surfaces/traveler/screens/trv-21-become-supplier";
import { serverQueryOptions } from "@/utils/server-rpc";

export const TRAVELER_SCREENS: readonly ScreenEntry[] = [
  {
    id: "SCR-TRV-01",
    slug: "trip-browse",
    titleKey: "screen.registry.traveler.tripBrowse.title",
    surface: "traveler",
    component: Trv01TripBrowse,
    loader: async ({ queryClient, orpc }) => {
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", {
            input: {},
          }),
        );
      } catch {
        // The screen's query renders its own error state.
      }
    },
  },
  {
    id: "SCR-TRV-02",
    slug: "trip-detail",
    titleKey: "screen.registry.traveler.tripDetail.title",
    surface: "traveler",
    component: Trv02TripDetail,
    loader: async ({ queryClient, orpc, params, search }) => {
      const tripId = (search.tripId as string | undefined) ?? (params.tripId as string | undefined);
      if (!tripId) return;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.trips.getPublicTripDetail, "trips/getPublicTripDetail", {
              input: { tripId },
            }),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(
              orpc.programs.listPublicTripPrograms,
              "programs/listPublicTripPrograms",
              { input: { tripId } },
            ),
          ),
        ]);
      } catch {
        // The screen's query renders its own error state.
      }
    },
  },
  {
    id: "SCR-TRV-03",
    slug: "booking-programs",
    titleKey: "screen.registry.traveler.bookingPrograms.title",
    surface: "traveler",
    component: Trv03BookingPrograms,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-04",
    slug: "booking-seats",
    titleKey: "screen.registry.traveler.bookingSeats.title",
    surface: "traveler",
    component: Trv04BookingSeats,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-05",
    slug: "booking-review",
    titleKey: "screen.registry.traveler.bookingReview.title",
    surface: "traveler",
    component: Trv05BookingReview,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-06",
    slug: "payment-handoff",
    titleKey: "screen.registry.traveler.paymentHandoff.title",
    surface: "traveler",
    component: Trv06PaymentHandoff,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-07",
    slug: "payment-pending",
    titleKey: "screen.registry.traveler.paymentPending.title",
    surface: "traveler",
    component: Trv07PaymentPending,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-08",
    slug: "payment-failed",
    titleKey: "screen.registry.traveler.paymentFailed.title",
    surface: "traveler",
    component: Trv08PaymentFailed,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-09",
    slug: "booking-confirmed",
    titleKey: "screen.registry.traveler.bookingConfirmed.title",
    surface: "traveler",
    component: Trv09BookingConfirmed,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-10",
    slug: "my-bookings",
    titleKey: "screen.registry.traveler.myBookings.title",
    surface: "traveler",
    component: Trv10MyBookings,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-11",
    slug: "booking-detail",
    titleKey: "screen.registry.traveler.bookingDetail.title",
    surface: "traveler",
    component: Trv11BookingDetail,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-12",
    slug: "cancel-booking",
    titleKey: "screen.registry.traveler.cancelBooking.title",
    surface: "traveler",
    component: Trv12CancelBooking,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-13",
    slug: "trip-day",
    titleKey: "screen.registry.traveler.tripDay.title",
    surface: "traveler",
    component: Trv13TripDay,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-14",
    slug: "receipts",
    titleKey: "screen.registry.traveler.receipts.title",
    surface: "traveler",
    component: Trv14Receipts,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-15",
    slug: "history-albums",
    titleKey: "screen.registry.traveler.historyAlbums.title",
    surface: "traveler",
    component: Trv15HistoryAlbums,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-16",
    slug: "album-viewer",
    titleKey: "screen.registry.traveler.albumViewer.title",
    surface: "traveler",
    component: Trv16AlbumViewer,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-17",
    slug: "shared-album",
    titleKey: "screen.registry.traveler.sharedAlbum.title",
    surface: "traveler",
    component: Trv17SharedAlbum,
    loader: async ({ queryClient, orpc, params, search }) => {
      const token = (search.token as string | undefined) ?? (params.token as string | undefined);
      if (!token) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.traveler.albums.resolveSharedLink,
            "traveler/albums/resolveSharedLink",
            { input: { token } },
          ),
        );
      } catch {
        // A revoked or unknown token renders as the screen's not-found state.
      }
    },
  },
  {
    id: "SCR-TRV-18",
    slug: "plans",
    titleKey: "screen.registry.traveler.plans.title",
    surface: "traveler",
    component: Trv18Plans,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(
            serverQueryOptions(
              orpc.traveler.account.getPlanComparison,
              "traveler/account/getPlanComparison",
              { input: undefined },
            ),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.traveler.getProfile, "traveler/getProfile", {
              input: undefined,
            }),
          ),
        ]);
      } catch {
        // The screen's queries render their own error state.
      }
    },
  },
  {
    id: "SCR-TRV-19",
    slug: "profile",
    titleKey: "screen.registry.traveler.profile.title",
    surface: "traveler",
    component: Trv19Profile,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-20",
    slug: "privacy",
    titleKey: "screen.registry.traveler.privacy.title",
    surface: "traveler",
    component: Trv20Privacy,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-TRV-21",
    slug: "become-supplier",
    titleKey: "screen.registry.traveler.becomeSupplier.title",
    surface: "traveler",
    component: Trv21BecomeSupplier,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
];
