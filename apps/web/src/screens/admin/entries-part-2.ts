import type { ScreenEntry } from "@/screens/types";
import { SubscriptionsAndOverrides } from "./plans/subscriptions-and-overrides";
import { RevenueDashboard } from "./finance/revenue-dashboard";
import { PlatformCoupons } from "./coupons/platform-coupons";
import { PlatformCouponEditor } from "./coupons/platform-coupon-editor";
import { DealAuditList } from "./deals-and-disputes/deal-audit-list";
import { DealAuditDetail } from "./deals-and-disputes/deal-audit-detail";
import { DisputesQueue } from "./deals-and-disputes/disputes-queue";
import { DisputeDetailAndRefundDecision } from "./deals-and-disputes/dispute-detail-and-refund-decision";
import { PlatformFinancialView } from "./finance/platform-financial-view";
import { PayoutRuns } from "./finance/payout-runs";
import { ReconciliationExceptions } from "./finance/reconciliation-exceptions";
import { SettlementsTracker } from "./finance/settlements-tracker";
import { TripOversight } from "./trips/trip-oversight";
import { AuditLog } from "./platform/audit-log";
import { NotificationTemplates } from "./platform/notification-templates";
import { FeatureFlagsAndPlatformConfiguration } from "./platform/feature-flags-and-platform-configuration";
import { OperationsHealthDashboard } from "./operations/operations-health-dashboard";

export const ADMIN_SCREENS_PART_2: readonly ScreenEntry[] = [
  {
    id: "SCR-ADM-17",
    slug: "subscriptions-and-overrides",
    title: "Subscriptions and overrides",
    surface: "admin",
    component: SubscriptionsAndOverrides,
  },
  {
    id: "SCR-ADM-18",
    slug: "revenue-dashboard",
    title: "Revenue dashboard",
    surface: "admin",
    component: RevenueDashboard,
  },
  {
    id: "SCR-ADM-19",
    slug: "platform-coupons",
    title: "Platform coupons",
    surface: "admin",
    component: PlatformCoupons,
  },
  {
    id: "SCR-ADM-20",
    slug: "platform-coupon-editor",
    title: "Platform coupon editor",
    surface: "admin",
    component: PlatformCouponEditor,
  },
  {
    id: "SCR-ADM-21",
    slug: "deal-audit-list",
    title: "Deal audit list",
    surface: "admin",
    component: DealAuditList,
  },
  {
    id: "SCR-ADM-22",
    slug: "deal-audit-detail",
    title: "Deal audit detail",
    surface: "admin",
    component: DealAuditDetail,
  },
  {
    id: "SCR-ADM-23",
    slug: "disputes-queue",
    title: "Disputes queue",
    surface: "admin",
    component: DisputesQueue,
  },
  {
    id: "SCR-ADM-24",
    slug: "dispute-detail-and-refund-decision",
    title: "Dispute detail and refund decision",
    surface: "admin",
    component: DisputeDetailAndRefundDecision,
  },
  {
    id: "SCR-ADM-25",
    slug: "platform-financial-view",
    title: "Platform financial view",
    surface: "admin",
    component: PlatformFinancialView,
  },
  {
    id: "SCR-ADM-26",
    slug: "payout-runs",
    title: "Payout runs",
    surface: "admin",
    component: PayoutRuns,
  },
  {
    id: "SCR-ADM-27",
    slug: "reconciliation-exceptions",
    title: "Reconciliation exceptions",
    surface: "admin",
    component: ReconciliationExceptions,
  },
  {
    id: "SCR-ADM-28",
    slug: "settlements-tracker",
    title: "Settlements tracker",
    surface: "admin",
    component: SettlementsTracker,
  },
  {
    id: "SCR-ADM-29",
    slug: "trip-oversight",
    title: "Trip oversight",
    surface: "admin",
    component: TripOversight,
  },
  {
    id: "SCR-ADM-30",
    slug: "audit-log",
    title: "Audit log",
    surface: "admin",
    component: AuditLog,
  },
  {
    id: "SCR-ADM-31",
    slug: "notification-templates",
    title: "Notification templates",
    surface: "admin",
    component: NotificationTemplates,
  },
  {
    id: "SCR-ADM-32",
    slug: "feature-flags-and-platform-configuration",
    title: "Feature flags and platform configuration",
    surface: "admin",
    component: FeatureFlagsAndPlatformConfiguration,
  },
  {
    id: "SCR-ADM-33",
    slug: "operations-health-dashboard",
    title: "Operations health dashboard",
    surface: "admin",
    component: OperationsHealthDashboard,
  },
];
