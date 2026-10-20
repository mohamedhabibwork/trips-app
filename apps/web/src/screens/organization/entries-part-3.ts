import type { ScreenEntry } from "@/screens/types";

import { CompanyAnalytics } from "./operations/company-analytics";
import { TripAnalytics } from "./operations/trip-analytics";
import { CustomerAnalytics } from "./operations/customer-analytics";
import { ProviderAnalytics } from "./operations/provider-analytics";
import { PageAnalytics } from "./operations/page-analytics";
import { ApiKeys } from "./integrations/api-keys";
import { WebhooksList } from "./integrations/webhooks";
import { WebhookNew } from "./integrations/webhook-new";
import { WebhookDetail } from "./integrations/webhook-detail";
import { MyOrganizations } from "./workspace/my-organizations";
import { ChooseWorkspace } from "./workspace/choose-workspace";
import { Support } from "./workspace/support";
import { RolesPermissions } from "./people/roles-permissions";
import { PassengerRoster } from "./trips/passenger-roster";
import { serverQueryOptions } from "@/utils/server-rpc";

/**
 * Second design batch (docs/design/web artboards SCR-ORG-43..47 and 57..65). Every loader
 * prefetches behind the unauthenticated SSR guard, like every other organization screen.
 */
export const ORGANIZATION_SCREENS_PART_C: readonly ScreenEntry[] = [
  {
    id: "SCR-ORG-43",
    slug: "company-analytics",
    titleKey: "screen.registry.trips-enjoy.companyAnalytics.title",
    surface: "organization",
    component: CompanyAnalytics,
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
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
              input: {},
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.coupons.listOrganizationCoupons,
              "coupons/listOrganizationCoupons",
              { input: {} },
            ),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.accounting.getOrganizationSummary,
              "accounting/getOrganizationSummary",
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
    id: "SCR-ORG-44",
    slug: "trip-analytics",
    titleKey: "screen.registry.organization.tripAnalytics.title",
    surface: "organization",
    component: TripAnalytics,
    loader: async ({ queryClient, orpc, auth, params }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      const tripId = params.tripId;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
              input: {},
            }),
          ),
          tripId
            ? queryClient.prefetchQuery(
                serverQueryOptions(
                  orpc.booking.listOrganizationBookings,
                  "booking/listOrganizationBookings",
                  { input: { tripId } },
                ),
              )
            : Promise.resolve(),
          tripId
            ? queryClient.prefetchQuery(
                serverQueryOptions(orpc.programs.listTripPrograms, "programs/listTripPrograms", {
                  input: { tripId },
                }),
              )
            : Promise.resolve(),
          tripId
            ? queryClient.prefetchQuery(
                serverQueryOptions(orpc.staffing.listTripStaffing, "staffing/listTripStaffing", {
                  input: { tripId },
                }),
              )
            : Promise.resolve(),
          tripId
            ? queryClient.prefetchQuery(
                serverQueryOptions(orpc.checkIn.listTripManifest, "checkIn/listTripManifest", {
                  input: { tripId },
                }),
              )
            : Promise.resolve(),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-45",
    slug: "customer-analytics",
    titleKey: "screen.registry.organization.customerAnalytics.title",
    surface: "organization",
    component: CustomerAnalytics,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
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
    id: "SCR-ORG-46",
    slug: "provider-analytics",
    titleKey: "screen.registry.organization.providerAnalytics.title",
    surface: "organization",
    component: ProviderAnalytics,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.onboarding.listOrganizationSuppliers,
              "onboarding/listOrganizationSuppliers",
              { input: {} },
            ),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.negotiation.listOrganizationNegotiations,
              "negotiation/listOrganizationNegotiations",
              { input: {} },
            ),
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
  {
    id: "SCR-ORG-47",
    slug: "page-analytics",
    titleKey: "screen.registry.organization.pageAnalytics.title",
    surface: "organization",
    component: PageAnalytics,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
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
    id: "SCR-ORG-57",
    slug: "api-keys",
    titleKey: "screen.registry.organization.apiKeys.title",
    surface: "organization",
    component: ApiKeys,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
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
    id: "SCR-ORG-58",
    slug: "webhooks",
    titleKey: "screen.registry.organization.webhooks.title",
    surface: "organization",
    component: WebhooksList,
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
    id: "SCR-ORG-59",
    slug: "webhook-new",
    titleKey: "screen.registry.organization.webhookNew.title",
    surface: "organization",
    component: WebhookNew,
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
    id: "SCR-ORG-60",
    slug: "webhook-detail",
    titleKey: "screen.registry.organization.webhookDetail.title",
    surface: "organization",
    component: WebhookDetail,
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
    id: "SCR-ORG-61",
    slug: "my-organizations",
    titleKey: "screen.registry.organization.myOrganizations.title",
    surface: "organization",
    component: MyOrganizations,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.auth.listMyRolesAndOrganizations,
            "auth/listMyRolesAndOrganizations",
            { input: undefined },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-62",
    slug: "choose-workspace",
    titleKey: "screen.registry.organization.chooseWorkspace.title",
    surface: "organization",
    component: ChooseWorkspace,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.auth.listMyRolesAndOrganizations,
            "auth/listMyRolesAndOrganizations",
            { input: undefined },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-63",
    slug: "support",
    titleKey: "screen.registry.organization.support.title",
    surface: "organization",
    component: Support,
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
    id: "SCR-ORG-64",
    slug: "roles-permissions",
    titleKey: "screen.registry.organization.rolesPermissions.title",
    surface: "organization",
    component: RolesPermissions,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(orpc.employees.list, "employees/list", { input: {} }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-65",
    slug: "passenger-roster",
    titleKey: "screen.registry.organization.passengerRoster.title",
    surface: "organization",
    component: PassengerRoster,
    loader: async ({ queryClient, orpc, auth, params }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      const tripId = params.tripId;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
              input: {},
            }),
          ),
          tripId
            ? queryClient.prefetchQuery(
                serverQueryOptions(
                  orpc.booking.listOrganizationBookings,
                  "booking/listOrganizationBookings",
                  { input: { tripId } },
                ),
              )
            : Promise.resolve(),
          tripId
            ? queryClient.prefetchQuery(
                serverQueryOptions(orpc.programs.listTripPrograms, "programs/listTripPrograms", {
                  input: { tripId },
                }),
              )
            : Promise.resolve(),
          tripId
            ? queryClient.prefetchQuery(
                serverQueryOptions(orpc.checkIn.listTripManifest, "checkIn/listTripManifest", {
                  input: { tripId },
                }),
              )
            : Promise.resolve(),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
];
