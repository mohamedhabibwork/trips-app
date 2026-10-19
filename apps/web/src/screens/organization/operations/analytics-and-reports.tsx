// SCR-ORG-39 Analytics and reports: program enrollment, coupon redemption and revenue for a period.
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgSelect } from "../common/org-form";
import { OrgButtonLink } from "../common/org-link";
import type { OrgSlug } from "../common/org-routes";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgError,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import {
  downloadCsv,
  formatTotals,
  periodStart,
  rowsOf,
  sumByCurrency,
  type BookingView,
  type Period,
} from "../accounting/finance-format";

const PAID_BOOKING_STATES: readonly string[] = ["confirmed", "checked_in", "completed"];

interface ReportCardProps {
  title: string;
  figure: string;
  caption: string;
  slug: OrgSlug;
}

function ReportCard({ title, figure, caption, slug }: ReportCardProps): ReactNode {
  return (
    <OrgCard className="flex-1" title={title}>
      <b className="text-[28px] leading-9 font-semibold">{figure}</b>
      <p className="te-caption m-0 text-[var(--te-ink-muted)]">{caption}</p>
      <div>
        <OrgButtonLink slug={slug} variant="text" className="-ms-2">
          {t("screen.organization.operations.analyticsAndReports.openReport")}
        </OrgButtonLink>
      </div>
    </OrgCard>
  );
}

function planViewLabel(tier: string | undefined): string | null {
  switch (tier) {
    case "starter":
      return t("screen.organization.operations.analyticsAndReports.starterLockedPreview");
    case "growth":
      return t("screen.organization.operations.analyticsAndReports.growthBasicView");
    case "enterprise":
      return t("screen.organization.operations.analyticsAndReports.enterpriseFullView");
    default:
      return null;
  }
}

export function AnalyticsAndReports() {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const [period, setPeriod] = useState<Period>("all");

  const bookingsQuery = useQuery(
    orpc.booking.listOrganizationBookings.queryOptions({ input: {}, enabled }),
  );
  const couponsQuery = useQuery(
    orpc.coupons.listOrganizationCoupons.queryOptions({ input: {}, enabled }),
  );
  const summaryQuery = useQuery(
    orpc.accounting.getOrganizationSummary.queryOptions({ input: undefined, enabled }),
  );
  const subscriptionQuery = useQuery(
    orpc.plans.getOrganizationSubscription.queryOptions({ input: undefined, enabled }),
  );

  const since = periodStart(period, new Date());
  const bookings = rowsOf<BookingView>(bookingsQuery.data).filter(
    (booking) =>
      PAID_BOOKING_STATES.includes(booking.status) &&
      (!since || new Date(booking.createdAt) >= since),
  );
  const loaded = bookingsQuery.isSuccess;
  const enrolled = bookings.filter((booking) => booking.programsTotalMinor > 0);
  const enrolledTravelers = enrolled.reduce((sum, booking) => sum + booking.passengersCount, 0);
  const enrolledTrips = new Set(enrolled.map((booking) => booking.tripId)).size;
  const redemptions = bookings.filter((booking) => booking.couponId).length;
  const activeCoupons = couponsQuery.isSuccess
    ? (couponsQuery.data?.items ?? []).filter((coupon) => coupon.status === "active").length
    : null;
  const revenue = formatTotals(
    sumByCurrency(
      bookings.map((booking) => ({
        minor: booking.totalAmountMinor,
        currency: booking.currencyCode,
      })),
    ),
    locale,
  );

  const enrollmentFigure = loaded
    ? t("screen.organization.operations.analyticsAndReports.nTravelers", { n: enrolledTravelers })
    : NO_VALUE;
  const redemptionFigure = loaded
    ? t("screen.organization.operations.analyticsAndReports.nRedemptions", { n: redemptions })
    : NO_VALUE;
  const planView = planViewLabel(subscriptionQuery.data?.tier);

  const periodOptions = [
    { value: "all", label: t("screen.organization.operations.analyticsAndReports.allTime") },
    { value: "month", label: t("screen.organization.operations.analyticsAndReports.thisMonth") },
    { value: "30d", label: t("screen.organization.operations.analyticsAndReports.last30Days") },
    { value: "year", label: t("screen.organization.operations.analyticsAndReports.thisYear") },
  ];

  const exportCsv = () =>
    downloadCsv("analytics.csv", [
      [
        t("screen.organization.operations.analyticsAndReports.programEnrollment"),
        t("screen.organization.operations.analyticsAndReports.couponRedemption"),
        t("screen.organization.operations.analyticsAndReports.revenue"),
      ],
      [String(enrolledTravelers), String(redemptions), revenue],
    ]);

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.operations.analyticsAndReports.title")}
        caption={
          <span className="flex flex-wrap items-center gap-3">
            {planView ? <OrgBadge tone="info">{planView}</OrgBadge> : null}
            {t("screen.organization.operations.analyticsAndReports.caption")}
          </span>
        }
        actions={
          <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
            <OrgSelect
              label={t("screen.organization.operations.analyticsAndReports.dateRange")}
              fieldClassName="w-full sm:w-auto sm:min-w-[220px]"
              options={periodOptions}
              value={period}
              onValueChange={(value) => setPeriod(value as Period)}
            />
            <OrgButton variant="secondary" disabled={!loaded} onClick={exportCsv}>
              {t("screen.organization.operations.analyticsAndReports.export")}
            </OrgButton>
          </div>
        }
      />
      {bookingsQuery.isError || summaryQuery.isError ? (
        <OrgError
          onRetry={() => {
            void bookingsQuery.refetch();
            void summaryQuery.refetch();
          }}
        />
      ) : null}
      <OrgRow>
        <ReportCard
          title={t("screen.organization.operations.analyticsAndReports.programEnrollment")}
          figure={enrollmentFigure}
          caption={t("screen.organization.operations.analyticsAndReports.acrossNTrips", {
            trips: loaded ? enrolledTrips : NO_VALUE,
          })}
          slug="program-enrollment-report"
        />
        <ReportCard
          title={t("screen.organization.operations.analyticsAndReports.couponRedemption")}
          figure={redemptionFigure}
          caption={t("screen.organization.operations.analyticsAndReports.nActiveCoupons", {
            n: activeCoupons ?? NO_VALUE,
          })}
          slug="coupons-list"
        />
        <ReportCard
          title={t("screen.organization.operations.analyticsAndReports.revenue")}
          figure={loaded ? revenue : NO_VALUE}
          caption={t("screen.organization.operations.analyticsAndReports.netOfCoupons")}
          slug="trip-accounting"
        />
      </OrgRow>
      <OrgAlert
        tone="info"
        title={t("screen.organization.operations.analyticsAndReports.planViewsDiffer")}
      >
        {t("screen.organization.operations.analyticsAndReports.starterShowsALockedPreview")}
      </OrgAlert>
    </OrgPage>
  );
}
