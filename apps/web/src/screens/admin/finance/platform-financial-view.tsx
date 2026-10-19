// SCR-ADM-25 Platform financial view (docs/design/web/admin/SCR-ADM-25.dc.html): six period totals
// (subscription revenue, commission, deal audit summary, coupon redemptions, disputes, payouts),
// each with its currency, and links to the finance detail pages.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminLink } from "../common/admin-actions";
import { AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminQueryState } from "../common/admin-states";
import { AdminCard, AdminGrid, AdminKpi, AdminPage } from "../common/admin-ui";
import { combineQueries, formatTotals, totalsByCurrency } from "./finance-format";

type Period = "month" | "quarter" | "year";

const MONTHS_PER_QUARTER = 3;
const NOT_RECORDED = "—";

const periodOptions = (): readonly AdminOption[] => [
  { value: "month", label: t("screen.admin.finance.platformFinancialView.thisMonth") },
  { value: "quarter", label: t("screen.admin.finance.platformFinancialView.thisQuarter") },
  { value: "year", label: t("screen.admin.finance.platformFinancialView.thisYear") },
];

function isPeriod(value: string): value is Period {
  return value === "month" || value === "quarter" || value === "year";
}

/** First moment of the current month, quarter or year (local time). */
function periodStart(period: Period, now: Date = new Date()): Date {
  if (period === "year") return new Date(now.getFullYear(), 0, 1);
  if (period === "quarter") {
    const firstMonth = Math.floor(now.getMonth() / MONTHS_PER_QUARTER) * MONTHS_PER_QUARTER;
    return new Date(now.getFullYear(), firstMonth, 1);
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/** "EGP, finalized deals" for one currency; the bare caption when there are none or several. */
function currencyCaption(currencies: readonly string[], withCurrency: string, plain: string) {
  return currencies.length === 1 ? withCurrency : plain;
}

export function PlatformFinancialView() {
  const { status: authStatus, locale } = useAuth();
  const [period, setPeriod] = useState<Period>("month");
  const enabled = authStatus === "authenticated";

  const couponsQuery = useQuery({
    ...orpc.coupons.listPlatformCoupons.queryOptions({ input: {} }),
    enabled,
  });
  const dealsQuery = useQuery({
    ...orpc.negotiation.listOrganizationNegotiations.queryOptions({ input: {} }),
    enabled,
  });

  const since = periodStart(period);
  const finalizedDeals = (dealsQuery.data?.items ?? []).filter(
    (deal) =>
      deal.status === "accepted" &&
      deal.agreedPriceMinor !== null &&
      new Date(deal.respondedAt ?? deal.updatedAt) >= since,
  );
  const dealTotals = totalsByCurrency(
    finalizedDeals.map((deal) => ({
      amountMinor: deal.agreedPriceMinor ?? 0,
      currency: deal.currencyCode,
    })),
  );
  const dealCurrencies = dealTotals.map((total) => total.currency);
  const redemptions = (couponsQuery.data?.items ?? []).reduce(
    (sum, coupon) => sum + (coupon.redemptionsCount ?? 0),
    0,
  );

  return (
    <AdminPage
      title={t("screen.admin.finance.platformFinancialView.title")}
      description={t("screen.admin.finance.platformFinancialView.description")}
      actions={
        <AdminSelect
          label={t("screen.admin.finance.platformFinancialView.period")}
          options={periodOptions()}
          value={period}
          onValueChange={(value) => isPeriod(value) && setPeriod(value)}
        />
      }
    >
      <AdminQueryState
        query={combineQueries([couponsQuery, dealsQuery])}
        loadingLabel={t("screen.admin.finance.platformFinancialView.loading")}
      >
        <AdminGrid columns={3}>
          <AdminKpi
            label={t("screen.admin.finance.platformFinancialView.subscriptionRevenue")}
            value={NOT_RECORDED}
            caption={t("screen.admin.finance.platformFinancialView.periodTotal")}
          />
          <AdminKpi
            label={t("screen.admin.finance.platformFinancialView.commission")}
            value={NOT_RECORDED}
            caption={t("screen.admin.finance.platformFinancialView.periodTotal")}
          />
          <AdminKpi
            label={t("screen.admin.finance.platformFinancialView.dealAuditSummary")}
            value={formatTotals(dealTotals, locale)}
            caption={currencyCaption(
              dealCurrencies,
              t("screen.admin.finance.platformFinancialView.currencyFinalizedDeals", {
                currency: dealCurrencies[0] ?? "",
              }),
              t("screen.admin.finance.platformFinancialView.finalizedDeals"),
            )}
          />
          <AdminKpi
            label={t("screen.admin.finance.platformFinancialView.couponRedemptions")}
            value={redemptions.toLocaleString(locale)}
            caption={t("screen.admin.finance.platformFinancialView.amountDiscounted", {
              amount: NOT_RECORDED,
            })}
          />
          <AdminKpi
            label={t("screen.admin.finance.platformFinancialView.disputes")}
            value={NOT_RECORDED}
            caption={t("screen.admin.finance.platformFinancialView.amountInRefunds", {
              amount: NOT_RECORDED,
            })}
          />
          <AdminKpi
            label={t("screen.admin.finance.platformFinancialView.payouts")}
            value={NOT_RECORDED}
            caption={t("screen.admin.finance.platformFinancialView.paidToSuppliers")}
          />
        </AdminGrid>
      </AdminQueryState>
      <AdminCard title={t("screen.admin.finance.platformFinancialView.goToDetail")}>
        <div className="flex flex-wrap gap-3">
          <AdminLink screen="SCR-ADM-26" variant="secondary">
            {t("screen.admin.finance.platformFinancialView.payoutRuns")}
          </AdminLink>
          <AdminLink screen="SCR-ADM-27" variant="secondary">
            {t("screen.admin.finance.platformFinancialView.reconciliationExceptions")}
          </AdminLink>
          <AdminLink screen="SCR-ADM-28" variant="secondary">
            {t("screen.admin.finance.platformFinancialView.settlementsTracker")}
          </AdminLink>
        </div>
      </AdminCard>
    </AdminPage>
  );
}
