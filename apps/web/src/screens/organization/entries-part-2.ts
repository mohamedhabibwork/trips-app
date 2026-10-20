import type { ScreenEntry } from "@/screens/types";

import { DealDetailAndNegotiation } from "./staffing/deal-detail-and-negotiation";
import { BookingsAndTravelers } from "./bookings/bookings-and-travelers";
import { BookingDetail } from "./bookings/booking-detail";
import { SeatMapAndSeatAssignment } from "./bookings/seat-map-and-seat-assignment";
import { ProgramEnrollmentReport } from "./bookings/program-enrollment-report";
import { CouponsList } from "./coupons/coupons-list";
import { CouponEditor } from "./coupons/coupon-editor";
import { CouponAnalytics } from "./coupons/coupon-analytics";
import { TripAccounting } from "./accounting/trip-accounting";
import { LedgerAndExports } from "./accounting/ledger-and-exports";
import { Settlements } from "./accounting/settlements";
import { SubscriptionAndBilling } from "./billing/subscription-and-billing";
import { EmployeesList } from "./people/employees-list";
import { EmployeeInvitationAndPermissions } from "./people/employee-invitation-and-permissions";
import { CrmAndWebhooks } from "./people/crm-and-webhooks";
import { InvoicesList } from "./billing/invoices-list";
import { IssueInvoiceB2bOrB2c } from "./billing/issue-invoice-b2b-or-b2c";
import { AnalyticsAndReports } from "./operations/analytics-and-reports";
import { LiveOperations } from "./operations/live-operations";
import { TripReportReview } from "./operations/trip-report-review";
import { ChildSafetyReports } from "./operations/child-safety-reports";
import { serverQueryOptions } from "@/utils/server-rpc";

/** SCR-ORG-22 to SCR-ORG-42, in spec order. */
export const ORGANIZATION_SCREENS_PART_B: readonly ScreenEntry[] = [
  {
    id: "SCR-ORG-22",
    slug: "deal-detail-and-negotiation",
    titleKey: "screen.registry.organization.dealDetailAndNegotiation.title",
    surface: "organization",
    component: DealDetailAndNegotiation,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
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
    id: "SCR-ORG-23",
    slug: "bookings-and-travelers",
    titleKey: "screen.registry.organization.bookingsAndTravelers.title",
    surface: "organization",
    component: BookingsAndTravelers,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.booking.listOrganizationBookings,
            "booking/listOrganizationBookings",
            { input: {} },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-24",
    slug: "booking-detail",
    titleKey: "screen.registry.organization.bookingDetail.title",
    surface: "organization",
    component: BookingDetail,
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
            serverQueryOptions(orpc.payments.listPayments, "payments/listPayments", {
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
    id: "SCR-ORG-25",
    slug: "seat-map-and-seat-assignment",
    titleKey: "screen.registry.organization.seatMapAndSeatAssignment.title",
    surface: "organization",
    component: SeatMapAndSeatAssignment,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
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
    id: "SCR-ORG-26",
    slug: "program-enrollment-report",
    titleKey: "screen.registry.organization.programEnrollmentReport.title",
    surface: "organization",
    component: ProgramEnrollmentReport,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
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
    id: "SCR-ORG-27",
    slug: "coupons-list",
    titleKey: "screen.registry.organization.couponsList.title",
    surface: "organization",
    component: CouponsList,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.coupons.listOrganizationCoupons,
              "coupons/listOrganizationCoupons",
              { input: {} },
            ),
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
    id: "SCR-ORG-28",
    slug: "coupon-editor",
    titleKey: "screen.registry.organization.couponEditor.title",
    surface: "organization",
    component: CouponEditor,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.coupons.listOrganizationCoupons,
              "coupons/listOrganizationCoupons",
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
    id: "SCR-ORG-29",
    slug: "coupon-analytics",
    titleKey: "screen.registry.organization.couponAnalytics.title",
    surface: "organization",
    component: CouponAnalytics,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          serverQueryOptions(
            orpc.coupons.listOrganizationCoupons,
            "coupons/listOrganizationCoupons",
            { input: {} },
          ),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-30",
    slug: "trip-accounting",
    titleKey: "screen.registry.organization.tripAccounting.title",
    surface: "organization",
    component: TripAccounting,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.accounting.getOrganizationSummary,
              "accounting/getOrganizationSummary",
              { input: undefined },
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
    id: "SCR-ORG-31",
    slug: "ledger-and-exports",
    titleKey: "screen.registry.organization.ledgerAndExports.title",
    surface: "organization",
    component: LedgerAndExports,
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
    id: "SCR-ORG-32",
    slug: "settlements",
    titleKey: "screen.registry.organization.settlements.title",
    surface: "organization",
    component: Settlements,
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
    id: "SCR-ORG-33",
    slug: "subscription-and-billing",
    titleKey: "screen.registry.organization.subscriptionAndBilling.title",
    surface: "organization",
    component: SubscriptionAndBilling,
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
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
              input: {},
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.employees.list, "employees/list", { input: {} }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(
              orpc.coupons.listOrganizationCoupons,
              "coupons/listOrganizationCoupons",
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
    id: "SCR-ORG-34",
    slug: "employees-list",
    titleKey: "screen.registry.organization.employeesList.title",
    surface: "organization",
    component: EmployeesList,
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
    id: "SCR-ORG-35",
    slug: "employee-invitation-and-permissions",
    titleKey: "screen.registry.organization.employeeInvitationAndPermissions.title",
    surface: "organization",
    component: EmployeeInvitationAndPermissions,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.employees.list, "employees/list", { input: {} }),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-36",
    slug: "crm-and-webhooks",
    titleKey: "screen.registry.organization.crmAndWebhooks.title",
    surface: "organization",
    component: CrmAndWebhooks,
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
    id: "SCR-ORG-37",
    slug: "invoices-list",
    titleKey: "screen.registry.organization.invoicesList.title",
    surface: "organization",
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
    id: "SCR-ORG-38",
    slug: "issue-invoice-b2b-or-b2c",
    titleKey: "screen.registry.organization.issueInvoiceB2bOrB2c.title",
    surface: "organization",
    component: IssueInvoiceB2bOrB2c,
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
    id: "SCR-ORG-39",
    slug: "analytics-and-reports",
    titleKey: "screen.registry.organization.analyticsAndReports.title",
    surface: "organization",
    component: AnalyticsAndReports,
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
    id: "SCR-ORG-40",
    slug: "live-operations",
    titleKey: "screen.registry.organization.liveOperations.title",
    surface: "organization",
    component: LiveOperations,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
              input: {},
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.fleet.listVehicles, "fleet/listVehicles", { input: {} }),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-41",
    slug: "trip-report-review",
    titleKey: "screen.registry.organization.tripReportReview.title",
    surface: "organization",
    component: TripReportReview,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
              input: {},
            }),
          ),
          queryClient.prefetchQuery(
            serverQueryOptions(orpc.fleet.listVehicles, "fleet/listVehicles", { input: {} }),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-42",
    slug: "child-safety-reports",
    titleKey: "screen.registry.organization.childSafetyReports.title",
    surface: "organization",
    component: ChildSafetyReports,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
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
