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

/** SCR-ORG-22 to SCR-ORG-42, in spec order. */
export const ORGANIZATION_SCREENS_PART_B: readonly ScreenEntry[] = [
  {
    id: "SCR-ORG-22",
    slug: "deal-detail-and-negotiation",
    title: "Deal detail and negotiation",
    surface: "organization",
    component: DealDetailAndNegotiation,
  },
  {
    id: "SCR-ORG-23",
    slug: "bookings-and-travelers",
    title: "Bookings and travelers",
    surface: "organization",
    component: BookingsAndTravelers,
  },
  {
    id: "SCR-ORG-24",
    slug: "booking-detail",
    title: "Booking detail",
    surface: "organization",
    component: BookingDetail,
  },
  {
    id: "SCR-ORG-25",
    slug: "seat-map-and-seat-assignment",
    title: "Seat map and seat assignment",
    surface: "organization",
    component: SeatMapAndSeatAssignment,
  },
  {
    id: "SCR-ORG-26",
    slug: "program-enrollment-report",
    title: "Program enrollment report",
    surface: "organization",
    component: ProgramEnrollmentReport,
  },
  {
    id: "SCR-ORG-27",
    slug: "coupons-list",
    title: "Coupons list",
    surface: "organization",
    component: CouponsList,
  },
  {
    id: "SCR-ORG-28",
    slug: "coupon-editor",
    title: "Coupon editor",
    surface: "organization",
    component: CouponEditor,
  },
  {
    id: "SCR-ORG-29",
    slug: "coupon-analytics",
    title: "Coupon analytics",
    surface: "organization",
    component: CouponAnalytics,
  },
  {
    id: "SCR-ORG-30",
    slug: "trip-accounting",
    title: "Trip accounting",
    surface: "organization",
    component: TripAccounting,
  },
  {
    id: "SCR-ORG-31",
    slug: "ledger-and-exports",
    title: "Ledger and exports",
    surface: "organization",
    component: LedgerAndExports,
  },
  {
    id: "SCR-ORG-32",
    slug: "settlements",
    title: "Settlements",
    surface: "organization",
    component: Settlements,
  },
  {
    id: "SCR-ORG-33",
    slug: "subscription-and-billing",
    title: "Subscription and billing",
    surface: "organization",
    component: SubscriptionAndBilling,
  },
  {
    id: "SCR-ORG-34",
    slug: "employees-list",
    title: "Employees list",
    surface: "organization",
    component: EmployeesList,
  },
  {
    id: "SCR-ORG-35",
    slug: "employee-invitation-and-permissions",
    title: "Employee invitation and permissions",
    surface: "organization",
    component: EmployeeInvitationAndPermissions,
  },
  {
    id: "SCR-ORG-36",
    slug: "crm-and-webhooks",
    title: "CRM and webhooks",
    surface: "organization",
    component: CrmAndWebhooks,
  },
  {
    id: "SCR-ORG-37",
    slug: "invoices-list",
    title: "Invoices list",
    surface: "organization",
    component: InvoicesList,
  },
  {
    id: "SCR-ORG-38",
    slug: "issue-invoice-b2b-or-b2c",
    title: "Issue invoice (B2B or B2C)",
    surface: "organization",
    component: IssueInvoiceB2bOrB2c,
  },
  {
    id: "SCR-ORG-39",
    slug: "analytics-and-reports",
    title: "Analytics and reports",
    surface: "organization",
    component: AnalyticsAndReports,
  },
  {
    id: "SCR-ORG-40",
    slug: "live-operations",
    title: "Live operations",
    surface: "organization",
    component: LiveOperations,
  },
  {
    id: "SCR-ORG-41",
    slug: "trip-report-review",
    title: "Trip report review",
    surface: "organization",
    component: TripReportReview,
  },
  {
    id: "SCR-ORG-42",
    slug: "child-safety-reports",
    title: "Child-safety reports",
    surface: "organization",
    component: ChildSafetyReports,
  },
];
