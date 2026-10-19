import type { ScreenEntry } from "@/screens/types";
import { ScrShr01PlanLimitUpgradePrompt } from "./scr-shr-01-plan-limit-upgrade-prompt";
import { ScrShr02PermissionDenied } from "./scr-shr-02-permission-denied";
import { ScrShr03NotFound } from "./scr-shr-03-not-found";
import { ScrShr04Unauthorized } from "./scr-shr-04-unauthorized";
import { ScrShr05ServerError } from "./scr-shr-05-server-error";
import { ScrShr06ServiceUnavailable } from "./scr-shr-06-service-unavailable";
import { ScrShr07MaintenancePage } from "./scr-shr-07-maintenance-page";
import { ScrShr08OfflineBanner } from "./scr-shr-08-offline-banner";
import { ScrShr09ConfirmationDialog } from "./scr-shr-09-confirmation-dialog";
import { ScrShr10LanguageSwitchAndRtl } from "./scr-shr-10-language-switch-and-rtl";
import { ScrShr11NotificationCentre } from "./scr-shr-11-notification-centre";
import { ScrShr12ReceiptAndInvoiceView } from "./scr-shr-12-receipt-and-invoice-view";
import { ScrShr13RoleAndOrganizationSwitcher } from "./scr-shr-13-role-and-organization-switcher";
import { ScrShr14OtpEntry } from "./scr-shr-14-otp-entry";
import { ScrShr15SeatMap } from "./scr-shr-15-seat-map";
import { ScrShr16DocumentAndPhotoUpload } from "./scr-shr-16-document-and-photo-upload";

export const SHARED_SCREENS: readonly ScreenEntry[] = [
  {
    id: "SCR-SHR-01",
    slug: "plan-limit-upgrade-prompt",
    titleKey: "screen.registry.shared.planLimitUpgradePrompt.title",
    surface: "shared",
    component: ScrShr01PlanLimitUpgradePrompt,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-SHR-02",
    slug: "permission-denied",
    titleKey: "screen.registry.shared.permissionDenied.title",
    surface: "shared",
    component: ScrShr02PermissionDenied,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-SHR-03",
    slug: "not-found",
    titleKey: "screen.registry.shared.notFound.title",
    surface: "shared",
    component: ScrShr03NotFound,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-SHR-04",
    slug: "unauthorized",
    titleKey: "screen.registry.shared.unauthorized.title",
    surface: "shared",
    component: ScrShr04Unauthorized,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-SHR-05",
    slug: "server-error",
    titleKey: "screen.registry.shared.serverError.title",
    surface: "shared",
    component: ScrShr05ServerError,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-SHR-06",
    slug: "service-unavailable",
    titleKey: "screen.registry.shared.serviceUnavailable.title",
    surface: "shared",
    component: ScrShr06ServiceUnavailable,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-SHR-07",
    slug: "maintenance-page",
    titleKey: "screen.registry.shared.maintenancePage.title",
    surface: "shared",
    component: ScrShr07MaintenancePage,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-SHR-08",
    slug: "offline-banner",
    titleKey: "screen.registry.shared.offlineBanner.title",
    surface: "shared",
    component: ScrShr08OfflineBanner,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-SHR-09",
    slug: "confirmation-dialog",
    titleKey: "screen.registry.shared.confirmationDialog.title",
    surface: "shared",
    component: ScrShr09ConfirmationDialog,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-SHR-10",
    slug: "language-switch-and-rtl",
    titleKey: "screen.registry.shared.languageSwitchAndRtl.title",
    surface: "shared",
    component: ScrShr10LanguageSwitchAndRtl,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-SHR-11",
    slug: "notification-centre",
    titleKey: "screen.registry.shared.notificationCentre.title",
    surface: "shared",
    component: ScrShr11NotificationCentre,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(orpc.notifications.listInbox.queryOptions({ input: {} }));
      } catch {
        // Graceful handling for SSR
      }
    },
  },
  {
    id: "SCR-SHR-12",
    slug: "receipt-and-invoice-view",
    titleKey: "screen.registry.shared.receiptAndInvoiceView.title",
    surface: "shared",
    component: ScrShr12ReceiptAndInvoiceView,
    loader: async ({ queryClient, orpc, auth, params }) => {
      if (!auth.accessToken() || !params.receiptId) return;
      try {
        await queryClient.ensureQueryData(
          orpc.payments.getReceipt.queryOptions({ input: { paymentId: params.receiptId } }),
        );
      } catch {
        // A missing or foreign receipt is shown by the screen itself (not found or failed).
      }
    },
  },
  {
    id: "SCR-SHR-13",
    slug: "role-and-organization-switcher",
    titleKey: "screen.registry.shared.roleAndOrganizationSwitcher.title",
    surface: "shared",
    component: ScrShr13RoleAndOrganizationSwitcher,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(
            orpc.auth.listMyRolesAndOrganizations.queryOptions({ input: undefined }),
          ),
          queryClient.ensureQueryData(
            orpc.organization.getOrganizationSettings.queryOptions({ input: {} }),
          ),
        ]);
      } catch {
        // Graceful handling for SSR
      }
    },
  },
  {
    id: "SCR-SHR-14",
    slug: "otp-entry",
    titleKey: "screen.registry.shared.otpEntry.title",
    surface: "shared",
    component: ScrShr14OtpEntry,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-SHR-15",
    slug: "seat-map",
    titleKey: "screen.registry.shared.seatMap.title",
    surface: "shared",
    component: ScrShr15SeatMap,
    loader: async ({ queryClient, orpc }) => {
      try {
        const trips = await queryClient.ensureQueryData(
          orpc.trips.browsePublicTrips.queryOptions({ input: {} }),
        );
        const firstTrip = trips?.items?.[0];
        if (firstTrip) {
          await queryClient.ensureQueryData(
            orpc.seats.getSeatMap.queryOptions({ input: { tripId: firstTrip.id } }),
          );
        }
      } catch {
        // Graceful handling for SSR
      }
    },
  },
  {
    id: "SCR-SHR-16",
    slug: "document-and-photo-upload",
    titleKey: "screen.registry.shared.documentAndPhotoUpload.title",
    surface: "shared",
    component: ScrShr16DocumentAndPhotoUpload,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(orpc.media.listFiles.queryOptions({ input: {} }));
      } catch {
        // Graceful handling for SSR
      }
    },
  },
];
