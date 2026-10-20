import type { ScreenEntry } from "@/screens/types";

import { PlatformAnalytics } from "./analytics/platform-analytics";
import { CompaniesAnalytics } from "./analytics/companies-analytics";
import { ProvidersAnalytics } from "./analytics/providers-analytics";
import { TripsAnalytics } from "./analytics/trips-analytics";
import { PagesAnalytics } from "./analytics/pages-analytics";
import { CountriesMarkets } from "./platform/countries-markets";
import { ContentModeration } from "./platform/content-moderation";
import { SupportInbox } from "./platform/support-inbox";
import { WebhooksApi } from "./platform/webhooks-api";
import { InvoicesList } from "./finance/invoices-list";
import { InvoiceDetail } from "./finance/invoice-detail";
import { PlanAccessPolicy } from "./plans/plan-access-policy";
import { TripOversightDetail } from "./trips/trip-oversight-detail";
import { serverQueryOptions } from "@/utils/server-rpc";

/**
 * Third design batch (docs/design/web Adm* artboards SCR-ADM-34..46). Every loader prefetches
 * behind the unauthenticated SSR guard, like every other admin screen.
 */
export const ADMIN_SCREENS_PART_3: readonly ScreenEntry[] = [
  {
    id: "SCR-ADM-34",
    slug: "platform-analytics",
    titleKey: "screen.registry.admin.platformAnalytics.title",
    surface: "admin",
    component: PlatformAnalytics,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
              input: {},
            }),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", {
              input: {},
            }),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.admin.getSystemSettings, "admin/getSystemSettings", {
              input: undefined,
            }),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-35",
    slug: "companies-analytics",
    titleKey: "screen.registry.admin.companiesAnalytics.title",
    surface: "admin",
    component: CompaniesAnalytics,
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
    id: "SCR-ADM-36",
    slug: "providers-analytics",
    titleKey: "screen.registry.admin.providersAnalytics.title",
    surface: "admin",
    component: ProvidersAnalytics,
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
    id: "SCR-ADM-37",
    slug: "trips-analytics",
    titleKey: "screen.registry.admin.tripsAnalytics.title",
    surface: "admin",
    component: TripsAnalytics,
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
    id: "SCR-ADM-38",
    slug: "pages-analytics",
    titleKey: "screen.registry.admin.pagesAnalytics.title",
    surface: "admin",
    component: PagesAnalytics,
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
    id: "SCR-ADM-39",
    slug: "countries-markets",
    titleKey: "screen.registry.admin.countriesMarkets.title",
    surface: "admin",
    component: CountriesMarkets,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.admin.getSystemSettings, "admin/getSystemSettings", {
              input: undefined,
            }),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.lookups.getByTypeCodes, "lookups/getByTypeCodes", {
              input: { codes: ["COUNTRY"] },
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
    id: "SCR-ADM-40",
    slug: "content-moderation",
    titleKey: "screen.registry.admin.contentModeration.title",
    surface: "admin",
    component: ContentModeration,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.tracking.listSafetyAlerts, "tracking/listSafetyAlerts", {
            input: undefined,
          }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-41",
    slug: "support-inbox",
    titleKey: "screen.registry.admin.supportInbox.title",
    surface: "admin",
    component: SupportInbox,
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
    id: "SCR-ADM-42",
    slug: "webhooks-api",
    titleKey: "screen.registry.admin.webhooksApi.title",
    surface: "admin",
    component: WebhooksApi,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.admin.getSystemSettings, "admin/getSystemSettings", {
              input: undefined,
            }),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.lookups.getByTypeCodes, "lookups/getByTypeCodes", {
              input: { codes: ["WEBHOOK_EVENT_TYPE"] },
            }),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-43",
    slug: "invoices-list",
    titleKey: "screen.registry.admin.invoicesList.title",
    surface: "admin",
    component: InvoicesList,
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
    id: "SCR-ADM-44",
    slug: "invoice-detail",
    titleKey: "screen.registry.admin.invoiceDetail.title",
    surface: "admin",
    component: InvoiceDetail,
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
    id: "SCR-ADM-45",
    slug: "plan-access-policy",
    titleKey: "screen.registry.admin.planAccessPolicy.title",
    surface: "admin",
    component: PlanAccessPolicy,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", { input: {} }),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.admin.getSystemSettings, "admin/getSystemSettings", {
              input: undefined,
            }),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ADM-46",
    slug: "trip-oversight-detail",
    titleKey: "screen.registry.admin.tripOversightDetail.title",
    surface: "admin",
    component: TripOversightDetail,
    loader: async ({ queryClient, orpc, auth, params }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      const tripId = params.tripId;
      try {
        await Promise.allSettled([
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", {
              input: {},
            }),
          ),
          queryClient.ensureQueryData(
            serverQueryOptions(orpc.tracking.listSafetyAlerts, "tracking/listSafetyAlerts", {
              input: undefined,
            }),
          ),
          tripId
            ? queryClient.ensureQueryData(
                serverQueryOptions(
                  orpc.tracking.getTripLiveTracking,
                  "tracking/getTripLiveTracking",
                  { input: { tripId } },
                ),
              )
            : Promise.resolve(),
          tripId
            ? queryClient.ensureQueryData(
                serverQueryOptions(
                  orpc.accounting.listLedgerEntries,
                  "accounting/listLedgerEntries",
                  { input: { tripId } },
                ),
              )
            : Promise.resolve(),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
];
