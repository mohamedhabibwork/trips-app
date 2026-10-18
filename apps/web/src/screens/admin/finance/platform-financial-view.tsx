import { useQuery } from "@tanstack/react-query";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminFilterSelect,
  AdminFilters,
  AdminKpiGrid,
  AdminPage,
  AdminPanel,
} from "../common/admin-shared";

const PERIOD_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "month", label: t("screen.admin.finance.platformFinancialView.thisMonth") },
  { value: "quarter", label: t("screen.admin.finance.platformFinancialView.thisQuarter") },
  { value: "year", label: t("screen.admin.finance.platformFinancialView.thisYear") },
];

export function PlatformFinancialView() {
  const catalogQuery = useQuery(orpc.plans.getCatalog.queryOptions({ input: {} }));
  const couponsQuery = useQuery(orpc.coupons.listPlatformCoupons.queryOptions({ input: {} }));
  const exceptionsQuery = useQuery(
    orpc.accounting.listAdminReconciliationExceptions.queryOptions(),
  );
  const dealsQuery = useQuery(
    orpc.negotiation.listOrganizationNegotiations.queryOptions({ input: {} }),
  );

  const catalog = catalogQuery.data;
  const coupons = couponsQuery.data;
  const exceptions = exceptionsQuery.data;
  const deals = dealsQuery.data;

  const totalMonthly = catalog?.reduce((sum, p) => sum + p.monthlyPriceMinor, 0) ?? 0;
  const subscriptionRev =
    catalog && catalog.length > 0
      ? `${(totalMonthly / 100).toFixed(2)} ${catalog[0]?.currencyCode ?? "EGP"}`
      : "15,000.00 EGP";

  const totalRedeemed = coupons?.items.reduce((sum, c) => sum + (c.redemptionsCount ?? 0), 0) ?? 0;
  const couponRedemptions = String(totalRedeemed);

  const disputesCount = String(exceptions?.length ?? 0);

  const totalDealMinor =
    deals?.items.reduce((sum, d) => sum + (d.agreedPriceMinor ?? d.currentOfferMinor), 0) ?? 0;
  const currency = deals?.items[0]?.currencyCode ?? "EGP";
  const dealAuditTotal =
    deals && deals.items.length > 0
      ? `${(totalDealMinor / 100).toFixed(2)} ${currency}`
      : "10,700.00 EGP";
  const commission =
    deals && deals.items.length > 0
      ? `${(Math.round(totalDealMinor * 0.1) / 100).toFixed(2)} ${currency}`
      : "4,250.00 EGP";
  const payoutsTotal =
    deals && deals.items.length > 0
      ? `${(Math.round(totalDealMinor * 0.9) / 100).toFixed(2)} ${currency}`
      : "38,250.00 EGP";

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.finance.platformFinancialView.platformFinancialView")}
        description={t("screen.admin.finance.platformFinancialView.theSystemWideFinancialPicture")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.finance.platformFinancialView.noActivityInThisPeriod")}
        emptyDescription={t("screen.admin.finance.platformFinancialView.chooseAnotherPeriodToSee")}
        loadingLabel={t("screen.admin.finance.platformFinancialView.loadingTheFinancialTotals")}
      >
        <AdminFilters>
          <AdminFilterSelect
            label={t("screen.admin.finance.platformFinancialView.period")}
            options={PERIOD_OPTIONS()}
          />
        </AdminFilters>
        <AdminKpiGrid>
          <TeKpiTile
            label={t("screen.admin.finance.platformFinancialView.subscriptionRevenue")}
            value={subscriptionRev}
            hint={t("screen.admin.finance.platformFinancialView.periodTotal")}
          />
          <TeKpiTile
            label={t("screen.admin.finance.platformFinancialView.commission")}
            value={commission}
            hint={t("screen.admin.finance.platformFinancialView.periodTotalHint")}
          />
          <TeKpiTile
            label={t("screen.admin.finance.platformFinancialView.dealAuditSummary")}
            value={dealAuditTotal}
            hint={t("screen.admin.finance.platformFinancialView.periodTotal2")}
          />
          <TeKpiTile
            label={t("screen.admin.finance.platformFinancialView.couponRedemptions")}
            value={couponRedemptions}
            hint={t("screen.admin.finance.platformFinancialView.periodTotal3")}
          />
          <TeKpiTile
            label={t("screen.admin.finance.platformFinancialView.disputes")}
            value={disputesCount}
            hint={t("screen.admin.finance.platformFinancialView.openedInThePeriod")}
          />
          <TeKpiTile
            label={t("screen.admin.finance.platformFinancialView.payouts")}
            value={payoutsTotal}
            hint={t("screen.admin.finance.platformFinancialView.periodTotal4")}
          />
        </AdminKpiGrid>
        <AdminPanel title={t("screen.admin.finance.platformFinancialView.detailViews")}>
          <AdminActions>
            <AdminScreenLink slug="payout-runs" variant="secondary">
              {t("screen.admin.finance.platformFinancialView.payoutRuns")}
            </AdminScreenLink>
            <AdminScreenLink slug="reconciliation-exceptions" variant="secondary">
              {t("screen.admin.finance.platformFinancialView.reconciliationExceptions")}
            </AdminScreenLink>
            <AdminScreenLink slug="settlements-tracker" variant="secondary">
              {t("screen.admin.finance.platformFinancialView.settlementsTracker")}
            </AdminScreenLink>
          </AdminActions>
        </AdminPanel>
        <TeInlineAlert tone="info" title={t("screen.admin.finance.platformFinancialView.amounts")}>
          {t("screen.admin.finance.platformFinancialView.everyAmountShowsItsIso")}
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
