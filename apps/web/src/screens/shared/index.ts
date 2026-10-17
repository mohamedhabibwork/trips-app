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
    title: "Plan-limit upgrade prompt",
    surface: "shared",
    component: ScrShr01PlanLimitUpgradePrompt,
  },
  {
    id: "SCR-SHR-02",
    slug: "permission-denied",
    title: "Permission denied (403)",
    surface: "shared",
    component: ScrShr02PermissionDenied,
  },
  {
    id: "SCR-SHR-03",
    slug: "not-found",
    title: "Not found (404)",
    surface: "shared",
    component: ScrShr03NotFound,
  },
  {
    id: "SCR-SHR-04",
    slug: "unauthorized",
    title: "Unauthorized (401)",
    surface: "shared",
    component: ScrShr04Unauthorized,
  },
  {
    id: "SCR-SHR-05",
    slug: "server-error",
    title: "Server error (500)",
    surface: "shared",
    component: ScrShr05ServerError,
  },
  {
    id: "SCR-SHR-06",
    slug: "service-unavailable",
    title: "Service unavailable (503)",
    surface: "shared",
    component: ScrShr06ServiceUnavailable,
  },
  {
    id: "SCR-SHR-07",
    slug: "maintenance-page",
    title: "Maintenance page",
    surface: "shared",
    component: ScrShr07MaintenancePage,
  },
  {
    id: "SCR-SHR-08",
    slug: "offline-banner",
    title: "Offline banner",
    surface: "shared",
    component: ScrShr08OfflineBanner,
  },
  {
    id: "SCR-SHR-09",
    slug: "confirmation-dialog",
    title: "Confirmation dialog",
    surface: "shared",
    component: ScrShr09ConfirmationDialog,
  },
  {
    id: "SCR-SHR-10",
    slug: "language-switch-and-rtl",
    title: "Language switch and RTL",
    surface: "shared",
    component: ScrShr10LanguageSwitchAndRtl,
  },
  {
    id: "SCR-SHR-11",
    slug: "notification-centre",
    title: "Notification centre",
    surface: "shared",
    component: ScrShr11NotificationCentre,
  },
  {
    id: "SCR-SHR-12",
    slug: "receipt-and-invoice-view",
    title: "Receipt and invoice view",
    surface: "shared",
    component: ScrShr12ReceiptAndInvoiceView,
  },
  {
    id: "SCR-SHR-13",
    slug: "role-and-organization-switcher",
    title: "Role and organization switcher",
    surface: "shared",
    component: ScrShr13RoleAndOrganizationSwitcher,
  },
  {
    id: "SCR-SHR-14",
    slug: "otp-entry",
    title: "OTP entry",
    surface: "shared",
    component: ScrShr14OtpEntry,
  },
  {
    id: "SCR-SHR-15",
    slug: "seat-map",
    title: "Seat map",
    surface: "shared",
    component: ScrShr15SeatMap,
  },
  {
    id: "SCR-SHR-16",
    slug: "document-and-photo-upload",
    title: "Document and photo upload",
    surface: "shared",
    component: ScrShr16DocumentAndPhotoUpload,
  },
];
