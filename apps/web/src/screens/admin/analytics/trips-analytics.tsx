// SCR-ADM-37 Trip analytics (docs/design/web/AdmTripAnalytics.dc.html): the trips marketplace —
// categories, regions, sell-through by departure week, seat prices, lead time and cancellations.
// Category, region, sell-through and price derive from the public trip list; lead time needs
// booking dates and cancellations need a cancellation store, so those cards say so.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

import { AdminButton } from "../common/admin-actions";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminCard, AdminGrid, AdminKpi, AdminPage } from "../common/admin-ui";
import { formatMinor } from "../finance/finance-format";
import { AnalyticsHeaderActions, AnalyticsNavTabs, NoSourceCard } from "./analytics-parts";
import { BarRow } from "./chart-parts";

const K = "screen.admin.analytics.tripsAnalytics";

const RANGE_OPTIONS = (): readonly { value: string; label: string }[] => [
  { value: "30d", label: t(`${K}.rangeOctoberToDate`) },
  { value: "30d", label: t(`${K}.rangeLast30Days`) },
  { value: "90d", label: t(`${K}.rangeLast12Weeks`) },
  { value: "365d", label: t(`${K}.rangeLast12Months`) },
];

interface GroupRow {
  key: string;
  label: string;
  trips: number;
  listed: number;
  sold: number;
  sellThrough: number | null;
  avgPriceMinor: number | null;
  currency: string | null;
}

function sellThroughOf(listed: number, sold: number): number | null {
  return listed > 0 ? (sold / listed) * 100 : null;
}

function groupTrips(
  trips: readonly {
    categoryLookupCode: string;
    originLabel: string;
    totalCapacity: number;
    confirmedSeatsCount: number;
    basePriceMinor: number;
    currencyCode: string;
  }[],
  keyOf: (trip: { categoryLookupCode: string; originLabel: string }) => string,
): readonly GroupRow[] {
  const buckets = new Map<
    string,
    { trips: number; listed: number; sold: number; priceSum: number; currency: string }
  >();
  for (const trip of trips) {
    const key = keyOf(trip);
    const bucket = buckets.get(key) ?? {
      trips: 0,
      listed: 0,
      sold: 0,
      priceSum: 0,
      currency: trip.currencyCode,
    };
    bucket.trips += 1;
    bucket.listed += trip.totalCapacity;
    bucket.sold += trip.confirmedSeatsCount;
    bucket.priceSum += trip.basePriceMinor;
    buckets.set(key, bucket);
  }
  return [...buckets.entries()]
    .map(([key, bucket]) => ({
      key,
      label: key,
      trips: bucket.trips,
      listed: bucket.listed,
      sold: bucket.sold,
      sellThrough: sellThroughOf(bucket.listed, bucket.sold),
      avgPriceMinor: bucket.trips > 0 ? Math.round(bucket.priceSum / bucket.trips) : null,
      currency: bucket.currency,
    }))
    .sort((a, b) => b.trips - a.trips);
}

export function TripsAnalytics() {
  const { status: authStatus, locale } = useAuth();
  const [range, setRange] = useState("30d");

  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });

  const trips = useMemo(
    () =>
      (tripsQuery.data?.items ?? []).map((trip) => ({
        categoryLookupCode: trip.categoryLookupCode,
        originLabel: trip.origin?.nameEn || trip.origin?.nameAr || "—",
        totalCapacity: trip.totalCapacity,
        confirmedSeatsCount: trip.confirmedSeatsCount,
        basePriceMinor: trip.basePriceMinor,
        currencyCode: trip.currencyCode,
        childTrackingEnabled: trip.childTrackingEnabled,
      })),
    [tripsQuery.data],
  );

  const byCategory = useMemo(() => groupTrips(trips, (trip) => trip.categoryLookupCode), [trips]);
  const byRegion = useMemo(() => groupTrips(trips, (trip) => trip.originLabel), [trips]);

  const listed = trips.reduce((sum, trip) => sum + trip.totalCapacity, 0);
  const sold = trips.reduce((sum, trip) => sum + trip.confirmedSeatsCount, 0);
  const sellThrough = sellThroughOf(listed, sold);
  const childTrips = trips.filter((trip) => trip.childTrackingEnabled).length;
  const avgPrice =
    trips.length > 0
      ? Math.round(trips.reduce((sum, trip) => sum + trip.basePriceMinor, 0) / trips.length)
      : null;
  const priceCurrency = trips[0]?.currencyCode;

  return (
    <AdminPage
      title={t(`${K}.title`)}
      description={t(`${K}.description`)}
      actions={
        <AnalyticsHeaderActions
          range={range}
          onRangeChange={setRange}
          rangeOptions={RANGE_OPTIONS()}
          exportLabel={t(`${K}.exportCsv`)}
        />
      }
    >
      <AnalyticsNavTabs activeSlug="trips-analytics" />

      <AdminGrid columns={3}>
        <AdminKpi
          label={t(`${K}.kpiTripsListed`)}
          value={tripsQuery.isSuccess ? trips.length : "—"}
          caption={t(`${K}.kpiTripsListedCaption`)}
        />
        <AdminKpi
          label={t(`${K}.kpiSellThrough`)}
          value={sellThrough !== null ? `${sellThrough.toFixed(0)}%` : "—"}
          caption={t(`${K}.kpiSellThroughCaption`, { sold, listed })}
        />
        <AdminKpi
          label={t(`${K}.kpiAvgSeatPrice`)}
          value={
            avgPrice !== null && priceCurrency ? formatMinor(avgPrice, priceCurrency, locale) : "—"
          }
          caption={t(`${K}.kpiAvgSeatPriceCaption`)}
        />
      </AdminGrid>

      <AdminQueryState query={tripsQuery} loadingLabel={t(`${K}.loading`)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AdminCard title={t(`${K}.byCategory`)} caption={t(`${K}.byCategoryCaption`)}>
            {byCategory.length > 0 ? (
              byCategory.map((row) => (
                <BarRow
                  key={row.key}
                  label={row.label}
                  value={t(`${K}.groupValue`, {
                    trips: row.trips,
                    percent: Math.round(row.sellThrough ?? 0),
                  })}
                  percent={row.sellThrough ?? 0}
                />
              ))
            ) : (
              <AdminEmpty title={t(`${K}.emptyTitle`)} description={t(`${K}.emptyBody`)} />
            )}
          </AdminCard>
          <AdminCard title={t(`${K}.byRegion`)} caption={t(`${K}.byRegionCaption`)}>
            {byRegion.length > 0 ? (
              byRegion.map((row) => (
                <BarRow
                  key={row.key}
                  label={row.label}
                  value={t(`${K}.groupValue`, {
                    trips: row.trips,
                    percent: Math.round(row.sellThrough ?? 0),
                  })}
                  percent={row.sellThrough ?? 0}
                />
              ))
            ) : (
              <AdminEmpty title={t(`${K}.emptyTitle`)} description={t(`${K}.emptyBody`)} />
            )}
          </AdminCard>
        </div>
      </AdminQueryState>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NoSourceCard
          title={t(`${K}.sellThroughByWeek`)}
          caption={t(`${K}.sellThroughByWeekCaption`)}
          body={t(`${K}.sellThroughByWeekNoSource`)}
        />
        <NoSourceCard
          title={t(`${K}.leadTime`)}
          caption={t(`${K}.leadTimeCaption`)}
          body={t(`${K}.leadTimeNoSource`)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NoSourceCard
          title={t(`${K}.cancellations`)}
          caption={t(`${K}.cancellationsCaption`)}
          body={t(`${K}.cancellationsNoSource`)}
        />
        <AdminCard title={t(`${K}.childTracking`)} caption={t(`${K}.childTrackingCaption`)}>
          {tripsQuery.isSuccess ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--te-hairline)] py-2.5">
                <span className="te-body">{t(`${K}.childTripsEnabled`)}</span>
                <span className="te-label">
                  {t(`${K}.childTripsValue`, { enabled: childTrips, total: trips.length })}
                </span>
              </div>
              <AdminButton variant="link" disabled title={t(`${K}.noParentsSource`)}>
                {t(`${K}.parentsLinked`)}
              </AdminButton>
              <p className="te-caption">{t(`${K}.childTrackingNote`)}</p>
            </>
          ) : (
            <AdminEmpty title={t(`${K}.emptyTitle`)} description={t(`${K}.emptyBody`)} />
          )}
        </AdminCard>
      </div>
    </AdminPage>
  );
}
