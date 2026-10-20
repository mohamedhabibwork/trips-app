// SCR-ADM-34 Platform analytics (docs/design/web/AdmAnalytics.dc.html): marketplace, subscription
// and user KPIs over a date range, with GMV by month, bookings by country, active users by role,
// MRR mix, the traveller conversion funnel and supply-vs-demand health. GMV and take rate derive
// from the ledger entries and seats from the public trip list; active users, MRR mix, funnel and
// per-country bookings have no source yet, so those cards say so instead of inventing numbers.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

import { HealthBarChart, HealthLineChart, type ChartBar } from "../operations/health-charts";
import { AdminBadge, AdminCard, AdminGrid, AdminKpi, AdminPage } from "../common/admin-ui";
import { formatMinor, totalsByCurrency } from "../finance/finance-format";
import {
  AnalyticsHeaderActions,
  AnalyticsNavTabs,
  MarketPills,
  NoSourceCard,
  useEnabledMarkets,
} from "./analytics-parts";

const K = "screen.admin.analytics.platformAnalytics";

const RANGE_OPTIONS = (): readonly { value: string; label: string }[] => [
  { value: "30d", label: t(`${K}.rangeLast30Days`) },
  { value: "quarter", label: t(`${K}.rangeThisQuarter`) },
  { value: "ytd", label: t(`${K}.rangeYearToDate`) },
  { value: "12m", label: t(`${K}.rangeLast12Months`) },
];

const RANGE_MONTHS: Record<string, number> = { "30d": 1, quarter: 3, ytd: 12, "12m": 12 };

export function PlatformAnalytics() {
  const { status: authStatus, locale } = useAuth();
  const [range, setRange] = useState("12m");
  const [market, setMarket] = useState("all");

  const markets = useEnabledMarkets();
  const ledgerQuery = useQuery({
    ...serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });
  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });

  const months = RANGE_MONTHS[range] ?? 12;
  const cutoff = useMemo(() => {
    const date = new Date();
    date.setUTCMonth(date.getUTCMonth() - months);
    return date.getTime();
  }, [months]);

  const entries = useMemo(
    () =>
      (ledgerQuery.data ?? []).filter((entry) => new Date(entry.occurredAt).getTime() >= cutoff),
    [ledgerQuery.data, cutoff],
  );
  const revenue = entries.filter(
    (entry) => entry.entryType === "booking_revenue" && entry.direction === "credit",
  );
  const gmvTotals = totalsByCurrency(
    revenue.map((entry) => ({ currency: entry.currencyCode, amountMinor: entry.grossAmountMinor })),
  );
  const commissionTotals = totalsByCurrency(
    revenue.map((entry) => ({
      currency: entry.currencyCode,
      amountMinor: entry.commissionAmountMinor,
    })),
  );
  const mainCurrency = [...gmvTotals].sort((a, b) => b.amountMinor - a.amountMinor)[0];
  const mainCommission = commissionTotals.find(
    (total) => total.currency === mainCurrency?.currency,
  );
  const takeRate =
    mainCurrency && mainCommission && mainCurrency.amountMinor > 0
      ? (mainCommission.amountMinor / mainCurrency.amountMinor) * 100
      : null;

  // GMV by month in the leading currency only: amounts in different currencies never merge.
  const monthlyBars = useMemo(() => {
    if (!mainCurrency) return [];
    const buckets = new Map<string, number>();
    for (const entry of revenue) {
      if (entry.currencyCode !== mainCurrency.currency) continue;
      const key = new Date(entry.occurredAt).toISOString().slice(0, 7);
      buckets.set(key, (buckets.get(key) ?? 0) + entry.grossAmountMinor);
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amountMinor]) => ({
        key: month,
        label: month,
        value: amountMinor / 100,
      }));
  }, [revenue, mainCurrency]);

  const trips = tripsQuery.data?.items ?? [];
  const seatsListed = trips.reduce((sum, trip) => sum + trip.totalCapacity, 0);
  const seatsSold = trips.reduce((sum, trip) => sum + trip.confirmedSeatsCount, 0);
  const sellThrough = seatsListed > 0 ? (seatsSold / seatsListed) * 100 : null;

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
      <AnalyticsNavTabs activeSlug="platform-analytics" />
      <MarketPills markets={markets} value={market} onChange={setMarket} />

      <AdminGrid columns={3}>
        <AdminKpi
          label={t(`${K}.kpiGmv`)}
          value={
            gmvTotals.length > 0
              ? formatMinor(mainCurrency?.amountMinor ?? 0, mainCurrency?.currency ?? "", locale)
              : "—"
          }
          caption={
            gmvTotals.length > 0
              ? undefined
              : t("screen.admin.analytics.analyticsParts.noSourceShort")
          }
        />
        <AdminKpi
          label={t(`${K}.kpiTakeRate`)}
          value={takeRate !== null ? `${takeRate.toFixed(1)}%` : "—"}
          caption={
            mainCurrency
              ? formatMinor(mainCommission?.amountMinor ?? 0, mainCurrency.currency, locale)
              : undefined
          }
        />
        <AdminKpi
          label={t(`${K}.kpiBookings`)}
          value={revenue.length > 0 ? revenue.length : "—"}
          caption={
            revenue.length > 0
              ? t(`${K}.kpiBookingsCaption`)
              : t("screen.admin.analytics.analyticsParts.noSourceShort")
          }
        />
        <AdminKpi
          label={t(`${K}.kpiActiveUsers`)}
          value="—"
          caption={t(`${K}.kpiActiveUsersCaption`)}
        />
        <AdminKpi label={t(`${K}.kpiMrr`)} value="—" caption={t(`${K}.kpiMrrCaption`)} />
        <AdminKpi
          label={t(`${K}.kpiConversion`)}
          value="—"
          caption={t(`${K}.kpiConversionCaption`)}
        />
      </AdminGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <AdminCard
          title={t(`${K}.gmvByMonth`)}
          caption={
            mainCurrency
              ? t(`${K}.gmvCurrencyCaption`, { currency: mainCurrency.currency })
              : t(`${K}.gmvNeedsLedger`)
          }
        >
          {monthlyBars.length > 1 ? (
            <HealthLineChart
              label={t(`${K}.gmvChartLabel`, { currency: mainCurrency?.currency ?? "" })}
              points={monthlyBars.map((bar) => bar.value)}
            />
          ) : (
            <p className="te-body px-1 py-6 text-[var(--te-ink-muted)]">
              {ledgerQuery.isSuccess ? t(`${K}.gmvNotEnoughMonths`) : t(`${K}.gmvNeedsLedger`)}
            </p>
          )}
        </AdminCard>
        <NoSourceCard
          title={t(`${K}.bookingsByCountry`)}
          caption={t(`${K}.bookingsByCountryCaption`)}
          body={t(`${K}.bookingsByCountryNoSource`)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <NoSourceCard title={t(`${K}.activeUsersByRole`)} body={t(`${K}.activeUsersNoSource`)} />
        <NoSourceCard title={t(`${K}.mrrByRole`)} body={t(`${K}.mrrNoSource`)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NoSourceCard
          title={t(`${K}.conversionFunnel`)}
          caption={t(`${K}.conversionFunnelCaption`)}
        />
        <AdminCard title={t(`${K}.supplyDemandHealth`)} caption={t(`${K}.supplyDemandCaption`)}>
          {tripsQuery.isSuccess && trips.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <span className="te-body">{t(`${K}.seatsListed`)}</span>
                <AdminBadge tone="ok" icon={false}>
                  {seatsListed.toLocaleString(locale)}
                </AdminBadge>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--te-hairline)] py-2.5">
                <span className="te-body">{t(`${K}.seatsSold`)}</span>
                <AdminBadge tone="info" icon={false}>
                  {seatsSold.toLocaleString(locale)}
                </AdminBadge>
              </div>
              {sellThrough !== null ? (
                <HealthBarChart
                  label={t(`${K}.sellThroughChartLabel`, { percent: Math.round(sellThrough) })}
                  bars={
                    [
                      {
                        key: "sellThrough",
                        label: t(`${K}.sellThrough`),
                        value: Math.round(sellThrough),
                      },
                    ] satisfies readonly ChartBar[]
                  }
                />
              ) : null}
            </>
          ) : (
            <p className="te-body px-1 py-6 text-[var(--te-ink-muted)]">
              {t(`${K}.supplyDemandEmpty`)}
            </p>
          )}
        </AdminCard>
      </div>
    </AdminPage>
  );
}
