// SCR-ORG-43 Company analytics: revenue, bookings and occupancy for the whole organization,
// derived from the bookings, trips, coupons and accounting the dashboard already reads.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgSelect } from "../common/org-form";
import { OrgButtonLink } from "../common/org-link";
import { tripTitle } from "../common/org-shared";
import {
  NO_VALUE,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { toBookingRecords, type BookingRecord } from "../bookings/booking-parts";
import {
  downloadCsv,
  formatMinor,
  formatTotals,
  periodStart,
  sumByCurrency,
  type Period,
} from "../accounting/finance-format";
import {
  AnalyticsTabs,
  BarRow,
  LineChart,
  NoSourceEmpty,
  PlanViewBadge,
  usePlanViewLabel,
  type LinePoint,
} from "./analytics-parts";

const PAID_STATES = ["confirmed", "checked_in", "completed"];
const K = "screen.organization.operations.companyAnalytics";

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const MONTH_NAMES_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Last `count` month buckets ending this month, oldest first. */
function recentMonths(count: number, now: Date): { key: string; label: string }[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    return { key: monthKey(date), label: MONTH_NAMES_EN[date.getMonth()] ?? "" };
  });
}

function revenuePoints(
  bookings: readonly BookingRecord[],
  months: readonly { key: string; label: string }[],
): LinePoint[] {
  const byMonth = new Map<string, number>();
  for (const booking of bookings) {
    const key = monthKey(new Date(booking.createdAt));
    byMonth.set(key, (byMonth.get(key) ?? 0) + booking.totalAmountMinor / 100);
  }
  return months.map((month) => ({ label: month.label, value: byMonth.get(month.key) ?? 0 }));
}

export function CompanyAnalytics() {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const [period, setPeriod] = useState<Period>("all");

  const bookingsQuery = useQuery({
    ...serverQueryOptions(
      orpc.booking.listOrganizationBookings,
      "booking/listOrganizationBookings",
      { input: {} },
    ),
    enabled,
  });
  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
      input: {},
    }),
    enabled,
  });
  const couponsQuery = useQuery({
    ...serverQueryOptions(orpc.coupons.listOrganizationCoupons, "coupons/listOrganizationCoupons", {
      input: {},
    }),
    enabled,
  });
  const summaryQuery = useQuery({
    ...serverQueryOptions(
      orpc.accounting.getOrganizationSummary,
      "accounting/getOrganizationSummary",
      { input: undefined },
    ),
    enabled,
  });

  const since = periodStart(period, new Date());
  const allBookings = toBookingRecords(bookingsQuery.data);
  const bookings = allBookings.filter((booking) => !since || new Date(booking.createdAt) >= since);
  const paid = bookings.filter((booking) => PAID_STATES.includes(booking.status));
  const cancelled = bookings.filter((booking) => booking.status === "cancelled");
  const refundMinor = cancelled.reduce((sum, booking) => sum + booking.refundAmountMinor, 0);
  const seatsSold = paid.reduce((sum, booking) => sum + booking.passengersCount, 0);
  const trips = tripsQuery.data?.items ?? [];
  const planView = usePlanViewLabel();

  const revenueTotals = sumByCurrency(
    paid.map((booking) => ({ minor: booking.totalAmountMinor, currency: booking.currencyCode })),
  );
  const revenue = formatTotals(revenueTotals, locale);
  const primaryCurrency = [...revenueTotals.keys()][0] ?? "SAR";
  const primaryRevenueMinor = revenueTotals.get(primaryCurrency) ?? 0;
  const programsMinor = paid.reduce((sum, booking) => sum + booking.programsTotalMinor, 0);
  const seatsMinor = Math.max(0, primaryRevenueMinor - programsMinor);
  const seatsPercent =
    primaryRevenueMinor > 0 ? Math.round((seatsMinor / primaryRevenueMinor) * 100) : 0;
  const averageBooking = paid.length > 0 ? primaryRevenueMinor / paid.length / 100 : 0;
  const cancelRate =
    bookings.length > 0 ? Math.round((cancelled.length / bookings.length) * 1000) / 10 : 0;
  const loaded = bookingsQuery.isSuccess;

  const months = recentMonths(12, new Date());
  const points = revenuePoints(paid, months);
  const formatChartValue = (value: number) =>
    formatMinor(Math.round(value * 100), primaryCurrency, locale);

  const bookingsByTrip = [...trips]
    .map((trip) => ({
      trip,
      count: paid.filter((booking) => booking.tripId === trip.id).length,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxTripBookings = bookingsByTrip[0]?.count ?? 1;

  const occupancyRows = trips
    .map((trip) => ({
      trip,
      sold: trip.confirmedSeatsCount,
      capacity: trip.totalCapacity || 0,
    }))
    .filter((row) => row.capacity > 0)
    .sort((a, b) => b.sold / b.capacity - a.sold / a.capacity)
    .slice(0, 6);

  const couponUses = new Map<string, number>();
  for (const booking of paid) {
    if (!booking.couponId) continue;
    couponUses.set(booking.couponId, (couponUses.get(booking.couponId) ?? 0) + 1);
  }
  const couponRows = (couponsQuery.data?.items ?? [])
    .map((coupon) => ({ coupon, uses: couponUses.get(coupon.id) ?? 0 }))
    .filter((row) => row.uses > 0)
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 5);

  const exportCsv = () =>
    downloadCsv("company-analytics.csv", [
      [t(`${K}.revenue`), t(`${K}.kpiBookings`), t(`${K}.kpiSeats`), t(`${K}.kpiCancellation`)],
      [revenue, String(paid.length), String(seatsSold), `${cancelRate}%`],
    ]);

  const errors =
    bookingsQuery.isError || tripsQuery.isError || couponsQuery.isError || summaryQuery.isError;
  const summary = summaryQuery.data;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={
          <span className="flex flex-wrap items-center gap-3">
            <PlanViewBadge label={planView} />
            {t(`${K}.caption`)}
          </span>
        }
        actions={
          <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
            <OrgSelect
              label={t(`${K}.dateRange`)}
              fieldClassName="w-full sm:w-auto sm:min-w-[200px]"
              options={[
                { value: "all", label: t(`${K}.periodAll`) },
                { value: "month", label: t(`${K}.periodMonth`) },
                { value: "30d", label: t(`${K}.period30d`) },
                { value: "year", label: t(`${K}.periodYear`) },
              ]}
              value={period}
              onValueChange={(value) => setPeriod(value as Period)}
            />
            <OrgButton variant="secondary" disabled={!loaded} onClick={exportCsv}>
              {t(`${K}.export`)}
            </OrgButton>
          </div>
        }
      />
      <AnalyticsTabs activeSlug="company-analytics" />
      {errors ? (
        <OrgError
          onRetry={() => {
            void bookingsQuery.refetch();
            void tripsQuery.refetch();
            void couponsQuery.refetch();
            void summaryQuery.refetch();
          }}
        />
      ) : null}
      <OrgKpiRow>
        <OrgKpi
          label={t(`${K}.kpiRevenue`)}
          value={loaded ? revenue : NO_VALUE}
          hint={
            summary
              ? t(`${K}.settledBalance`, {
                  amount: formatMinor(summary.availableBalanceMinor, summary.currencyCode, locale),
                })
              : undefined
          }
        />
        <OrgKpi
          label={t(`${K}.kpiBookings`)}
          value={loaded ? paid.length : NO_VALUE}
          hint={t(`${K}.nCancelled`, { n: cancelled.length })}
        />
        <OrgKpi
          label={t(`${K}.kpiSeats`)}
          value={loaded ? seatsSold : NO_VALUE}
          hint={
            paid.length > 0
              ? t(`${K}.seatsPerBooking`, {
                  n: (seatsSold / paid.length).toFixed(2),
                })
              : undefined
          }
        />
        <OrgKpi
          label={t(`${K}.kpiAverage`)}
          value={
            loaded
              ? formatMinor(Math.round(averageBooking * 100), primaryCurrency, locale)
              : NO_VALUE
          }
          hint={t(`${K}.paidBookingsOnly`)}
        />
        <OrgKpi
          label={t(`${K}.kpiCancellation`)}
          value={loaded ? `${cancelRate}%` : NO_VALUE}
          hint={
            loaded
              ? t(`${K}.refundedAmount`, {
                  amount: formatMinor(refundMinor, primaryCurrency, locale),
                })
              : undefined
          }
        />
      </OrgKpiRow>
      <OrgRow align="start">
        <OrgCard title={t(`${K}.revenueByMonth`)} className="lg:flex-[2]">
          {loaded && points.length > 1 ? (
            <LineChart
              points={points}
              areaLabel={t(`${K}.revenueByMonthChart`, { currency: primaryCurrency })}
              valueFormatter={formatChartValue}
            />
          ) : (
            <OrgLoading rows={4} />
          )}
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t(`${K}.revenueByMonthNote`, { currency: primaryCurrency })}
          </p>
        </OrgCard>
        <OrgCard title={t(`${K}.revenueMix`)} className="lg:flex-1">
          {loaded ? (
            <div className="flex flex-col gap-3">
              <BarRow
                label={t(`${K}.mixSeats`)}
                value={`${seatsPercent}%`}
                percent={seatsPercent}
              />
              <BarRow
                label={t(`${K}.mixPrograms`)}
                value={`${100 - seatsPercent}%`}
                percent={100 - seatsPercent}
                tone="accent"
              />
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">
                {t(`${K}.mixProgramsAmount`, {
                  amount: formatMinor(programsMinor, primaryCurrency, locale),
                })}
              </p>
            </div>
          ) : (
            <OrgLoading rows={3} />
          )}
        </OrgCard>
      </OrgRow>
      <OrgRow align="start">
        <OrgCard title={t(`${K}.bookingsByTrip`)} className="lg:flex-1">
          {loaded && bookingsByTrip.length > 0 ? (
            <div className="flex flex-col gap-3">
              {bookingsByTrip.map((row) => (
                <BarRow
                  key={row.trip.id}
                  label={tripTitle(row.trip, locale) || NO_VALUE}
                  value={row.count}
                  percent={(row.count / maxTripBookings) * 100}
                />
              ))}
            </div>
          ) : loaded ? (
            <NoSourceEmpty body={t(`${K}.noBookingsYet`)} />
          ) : (
            <OrgLoading rows={3} />
          )}
        </OrgCard>
        <OrgCard title={t(`${K}.couponRoi`)} className="lg:flex-1">
          {loaded && couponRows.length > 0 ? (
            <div className="flex flex-col gap-3">
              {couponRows.map((row) => (
                <BarRow
                  key={row.coupon.id}
                  label={row.coupon.code}
                  value={t(`${K}.nUses`, { n: row.uses })}
                  percent={(row.uses / couponRows[0].uses) * 100}
                />
              ))}
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.couponRoiNote`)}</p>
            </div>
          ) : loaded ? (
            <NoSourceEmpty body={t(`${K}.noCouponUses`)} />
          ) : (
            <OrgLoading rows={3} />
          )}
        </OrgCard>
      </OrgRow>
      <OrgCard
        title={t(`${K}.occupancyByTrip`)}
        actions={
          occupancyRows[0] ? (
            <OrgButtonLink
              slug="trip-analytics"
              params={{ tripId: occupancyRows[0].trip.id }}
              variant="text"
            >
              {t(`${K}.openTripAnalytics`)}
            </OrgButtonLink>
          ) : undefined
        }
      >
        {loaded && occupancyRows.length > 0 ? (
          <div className="flex flex-col gap-3">
            {occupancyRows.map((row) => {
              const percent = Math.round((row.sold / row.capacity) * 100);
              return (
                <div key={row.trip.id} className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm leading-5">
                    <span className="flex items-center gap-2 font-semibold">
                      {tripTitle(row.trip, locale) || NO_VALUE}
                      {percent < 70 ? (
                        <OrgBadge tone="warn" icon={false}>
                          {t(`${K}.belowTarget`)}
                        </OrgBadge>
                      ) : null}
                    </span>
                    <span className="text-[var(--te-ink-muted)]">
                      {t(`${K}.nOfCapacity`, { n: row.sold, capacity: row.capacity })}
                    </span>
                  </div>
                  <BarRow
                    label=""
                    value={`${percent}%`}
                    percent={percent}
                    tone={percent < 70 ? "accent" : "ink"}
                  />
                </div>
              );
            })}
          </div>
        ) : loaded ? (
          <NoSourceEmpty body={t(`${K}.noTripsYet`)} />
        ) : (
          <OrgLoading rows={3} />
        )}
      </OrgCard>
      <OrgCard title={t(`${K}.repeatRate`)}>
        <NoSourceEmpty body={t(`${K}.repeatRateNoSource`)} />
      </OrgCard>
    </OrgPage>
  );
}
