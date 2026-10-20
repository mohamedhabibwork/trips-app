import type { ScreenEntry } from "@/screens/types";

import { Campaigns } from "./crm/campaigns";
import { CampaignNew } from "./crm/campaign-new";
import { Customers } from "./crm/customers";
import { CustomerDetail } from "./crm/customer-detail";
import { Leads } from "./crm/leads";
import { LeadDetail } from "./crm/lead-detail";
import { Inbox } from "./crm/inbox";
import { Reviews } from "./crm/reviews";
import { Segments } from "./crm/segments";
import { ChoosePlan } from "./billing/choose-plan";
import { BillingCheckout } from "./billing/checkout";
import { PlanEnded } from "./billing/plan-ended";
import { B2bInvoice } from "./billing/b2b-invoice";
import { SettlementStatement } from "./accounting/settlement-statement";
import { serverQueryOptions } from "@/utils/server-rpc";

/**
 * Third design batch (docs/design/web artboards SCR-ORG-48..56 and 66..70). Every loader
 * prefetches behind the unauthenticated SSR guard, like every other organization screen.
 */
export const ORGANIZATION_SCREENS_PART_D: readonly ScreenEntry[] = [
  {
    id: "SCR-ORG-48",
    slug: "crm-campaigns",
    titleKey: "screen.registry.organization.crmCampaigns.title",
    surface: "organization",
    component: Campaigns,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.organization.getOrganizationSettings,
            "organization/getOrganizationSettings",
            { input: {} },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-49",
    slug: "crm-campaign-new",
    titleKey: "screen.registry.organization.crmCampaignNew.title",
    surface: "organization",
    component: CampaignNew,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.organization.getOrganizationSettings,
            "organization/getOrganizationSettings",
            { input: {} },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-50",
    slug: "crm-customers",
    titleKey: "screen.registry.organization.crmCustomers.title",
    surface: "organization",
    component: Customers,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.booking.listOrganizationBookings,
              "booking/listOrganizationBookings",
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
    id: "SCR-ORG-51",
    slug: "crm-customer",
    titleKey: "screen.registry.organization.crmCustomer.title",
    surface: "organization",
    component: CustomerDetail,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.booking.listOrganizationBookings,
              "booking/listOrganizationBookings",
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
    id: "SCR-ORG-52",
    slug: "crm-leads",
    titleKey: "screen.registry.organization.crmLeads.title",
    surface: "organization",
    component: Leads,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.organization.getOrganizationSettings,
            "organization/getOrganizationSettings",
            { input: {} },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-53",
    slug: "crm-lead",
    titleKey: "screen.registry.organization.crmLead.title",
    surface: "organization",
    component: LeadDetail,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.organization.getOrganizationSettings,
            "organization/getOrganizationSettings",
            { input: {} },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-54",
    slug: "crm-inbox",
    titleKey: "screen.registry.organization.crmInbox.title",
    surface: "organization",
    component: Inbox,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.notifications.listInbox, "notifications/listInbox", {
            input: {},
          }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-55",
    slug: "crm-reviews",
    titleKey: "screen.registry.organization.crmReviews.title",
    surface: "organization",
    component: Reviews,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.organization.getOrganizationSettings,
            "organization/getOrganizationSettings",
            { input: {} },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-56",
    slug: "crm-segments",
    titleKey: "screen.registry.organization.crmSegments.title",
    surface: "organization",
    component: Segments,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.organization.getOrganizationSettings,
            "organization/getOrganizationSettings",
            { input: {} },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-66",
    slug: "choose-plan",
    titleKey: "screen.registry.organization.choosePlan.title",
    surface: "organization",
    component: ChoosePlan,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", {
              input: { role: "organization" },
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.plans.getOrganizationSubscription,
              "plans/getOrganizationSubscription",
              { input: undefined },
            ),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-67",
    slug: "billing-checkout",
    titleKey: "screen.registry.organization.billingCheckout.title",
    surface: "organization",
    component: BillingCheckout,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", {
              input: { role: "organization" },
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.plans.getOrganizationSubscription,
              "plans/getOrganizationSubscription",
              { input: undefined },
            ),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-68",
    slug: "plan-ended",
    titleKey: "screen.registry.organization.planEnded.title",
    surface: "organization",
    component: PlanEnded,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", {
              input: { role: "organization" },
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.plans.getOrganizationSubscription,
              "plans/getOrganizationSubscription",
              { input: undefined },
            ),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-69",
    slug: "b2b-invoice",
    titleKey: "screen.registry.organization.b2bInvoice.title",
    surface: "organization",
    component: B2bInvoice,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
              input: {},
            }),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(
              orpc.organization.getOrganizationSettings,
              "organization/getOrganizationSettings",
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
    id: "SCR-ORG-70",
    slug: "settlement-statement",
    titleKey: "screen.registry.organization.settlementStatement.title",
    surface: "organization",
    component: SettlementStatement,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
              input: {},
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
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
