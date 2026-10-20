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
import { serverQueryOptions } from "@/utils/server-rpc";

export const ADMIN_SCREENS_PART_2: readonly ScreenEntry[] = [
  {
    id: "SCR-ADM-17",
    slug: "subscriptions-and-overrides",
    titleKey: "screen.registry.admin.subscriptionsAndOverrides.title",
    surface: "admin",
    component: SubscriptionsAndOverrides,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.onboarding.listReviewQueue, "onboarding/listReviewQueue", {
              input: {},
            }),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", { input: {} }),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-18",
    slug: "revenue-dashboard",
    titleKey: "screen.registry.admin.revenueDashboard.title",
    surface: "admin",
    component: RevenueDashboard,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", { input: {} }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-19",
    slug: "platform-coupons",
    titleKey: "screen.registry.admin.platformCoupons.title",
    surface: "admin",
    component: PlatformCoupons,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.coupons.listPlatformCoupons, "coupons/listPlatformCoupons", {
            input: {},
          }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-20",
    slug: "platform-coupon-editor",
    titleKey: "screen.registry.admin.platformCouponEditor.title",
    surface: "admin",
    component: PlatformCouponEditor,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
    },
  },
  {
    id: "SCR-ADM-21",
    slug: "deal-audit-list",
    titleKey: "screen.registry.admin.dealAuditList.title",
    surface: "admin",
    component: DealAuditList,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.negotiation.listOrganizationNegotiations,
            "negotiation/listOrganizationNegotiations",
            { input: {} },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-22",
    slug: "deal-audit-detail",
    titleKey: "screen.registry.admin.dealAuditDetail.title",
    surface: "admin",
    component: DealAuditDetail,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.negotiation.listOrganizationNegotiations,
            "negotiation/listOrganizationNegotiations",
            { input: {} },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-23",
    slug: "disputes-queue",
    titleKey: "screen.registry.admin.disputesQueue.title",
    surface: "admin",
    component: DisputesQueue,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.accounting.listAdminReconciliationExceptions,
            "accounting/listAdminReconciliationExceptions",
            { input: undefined },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-24",
    slug: "dispute-detail-and-refund-decision",
    titleKey: "screen.registry.admin.disputeDetailAndRefundDecision.title",
    surface: "admin",
    component: DisputeDetailAndRefundDecision,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.accounting.listAdminReconciliationExceptions,
            "accounting/listAdminReconciliationExceptions",
            { input: undefined },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-25",
    slug: "platform-financial-view",
    titleKey: "screen.registry.admin.platformFinancialView.title",
    surface: "admin",
    component: PlatformFinancialView,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.coupons.listPlatformCoupons, "coupons/listPlatformCoupons", {
              input: {},
            }),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(
              orpc.negotiation.listOrganizationNegotiations,
              "negotiation/listOrganizationNegotiations",
              { input: {} },
            ),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-26",
    slug: "payout-runs",
    titleKey: "screen.registry.admin.payoutRuns.title",
    surface: "admin",
    component: PayoutRuns,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
            input: {},
          }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-27",
    slug: "reconciliation-exceptions",
    titleKey: "screen.registry.admin.reconciliationExceptions.title",
    surface: "admin",
    component: ReconciliationExceptions,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.accounting.listAdminReconciliationExceptions,
            "accounting/listAdminReconciliationExceptions",
            { input: undefined },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-28",
    slug: "settlements-tracker",
    titleKey: "screen.registry.admin.settlementsTracker.title",
    surface: "admin",
    component: SettlementsTracker,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
            input: {},
          }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-29",
    slug: "trip-oversight",
    titleKey: "screen.registry.admin.tripOversight.title",
    surface: "admin",
    component: TripOversight,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", {
            input: {},
          }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-30",
    slug: "audit-log",
    titleKey: "screen.registry.admin.auditLog.title",
    surface: "admin",
    component: AuditLog,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      // Rows arrive with an audit-log read procedure; nothing to prefetch yet.
    },
  },
  {
    id: "SCR-ADM-31",
    slug: "notification-templates",
    titleKey: "screen.registry.admin.notificationTemplates.title",
    surface: "admin",
    component: NotificationTemplates,
    loader: async ({ auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      // Templates arrive with a template-management procedure; nothing to prefetch yet.
    },
  },
  {
    id: "SCR-ADM-32",
    slug: "feature-flags-and-platform-configuration",
    titleKey: "screen.registry.admin.featureFlagsAndPlatformConfiguration.title",
    surface: "admin",
    component: FeatureFlagsAndPlatformConfiguration,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.admin.getSystemSettings, "admin/getSystemSettings", {
            input: undefined,
          }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-33",
    slug: "operations-health-dashboard",
    titleKey: "screen.registry.admin.operationsHealthDashboard.title",
    surface: "admin",
    component: OperationsHealthDashboard,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", {
              input: {},
            }),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.notifications.listInbox, "notifications/listInbox", {
              input: {},
            }),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
];
