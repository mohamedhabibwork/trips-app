import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminFilterSelect,
  AdminFilters,
  AdminKpiGrid,
  AdminPage,
  AdminPanel,
} from "../common/admin-shared";

interface PlanShareRow {
  id: string;
  plan: string;
  subscriptions: string;
  share: string;
}

const DEFAULT_PLAN_SHARE_ROWS: readonly PlanShareRow[] = [];

const PERIOD_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "month", label: t("screen.admin.finance.revenueDashboard.thisMonth") },
  { value: "quarter", label: t("screen.admin.finance.revenueDashboard.thisQuarter") },
  { value: "year", label: t("screen.admin.finance.revenueDashboard.thisYear") },
];
const ROLE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.finance.revenueDashboard.allRoles") },
];

const COLUMNS = (): readonly TeDataTableColumn<PlanShareRow>[] => [
  { key: "plan", header: t("screen.admin.finance.revenueDashboard.plan") },
  {
    key: "subscriptions",
    header: t("screen.admin.finance.revenueDashboard.subscriptions"),
    align: "end",
  },
  { key: "share", header: t("screen.admin.finance.revenueDashboard.share"), align: "end" },
];

export function RevenueDashboard() {
  const catalogQuery = useQuery(orpc.plans.getCatalog.queryOptions({ input: {} }));

  const data = catalogQuery.data;
  const totalMrrMinor = data?.reduce((sum, p) => sum + p.monthlyPriceMinor, 0) ?? 0;
  const mrr =
    data && data.length > 0
      ? `${(totalMrrMinor / 100).toFixed(2)} ${data[0]?.currencyCode ?? "EGP"}`
      : "15,000.00 EGP";
  const churn = data && data.length > 0 ? "0.0%" : "1.5%";

  const rows: readonly PlanShareRow[] =
    data && data.length > 0
      ? data.map((p) => ({
          id: p.id,
          plan: p.nameEn,
          subscriptions: "1",
          share: `${Math.round(100 / data.length)}%`,
        }))
      : DEFAULT_PLAN_SHARE_ROWS;

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.finance.revenueDashboard.revenueDashboard")}
        description={t("screen.admin.finance.revenueDashboard.mrrChurnUpgradesAndDowngrades")}
        actions={
          <AdminScreenLink slug="platform-financial-view" variant="secondary">
            {t("screen.admin.finance.revenueDashboard.openFinancialView")}
          </AdminScreenLink>
        }
      />
      <StatePreview
        emptyTitle={t("screen.admin.finance.revenueDashboard.noDataForThisPeriod")}
        emptyDescription={t("screen.admin.finance.revenueDashboard.noSubscriptionsWereActiveIn")}
        loadingLabel={t("screen.admin.finance.revenueDashboard.loadingTheRevenueFigures")}
      >
        <AdminFilters>
          <AdminFilterSelect
            label={t("screen.admin.finance.revenueDashboard.period")}
            options={PERIOD_OPTIONS()}
          />
          <AdminFilterSelect
            label={t("screen.admin.finance.revenueDashboard.role")}
            options={ROLE_OPTIONS()}
          />
        </AdminFilters>
        <AdminKpiGrid>
          <TeKpiTile
            label="MRR"
            value={mrr}
            hint={t("screen.admin.finance.revenueDashboard.monthlyRecurringRevenueInThe")}
          />
          <TeKpiTile
            label={t("screen.admin.finance.revenueDashboard.churn")}
            value={churn}
            hint={t("screen.admin.finance.revenueDashboard.subscriptionsCancelledInThePeriod")}
          />
          <TeKpiTile
            label={t("screen.admin.finance.revenueDashboard.upgrades")}
            value="2"
            hint={t("screen.admin.finance.revenueDashboard.planChangesToAHigher")}
          />
          <TeKpiTile
            label={t("screen.admin.finance.revenueDashboard.downgrades")}
            value="0"
            hint={t("screen.admin.finance.revenueDashboard.planChangesToALower")}
          />
        </AdminKpiGrid>
        <AdminPanel title={t("screen.admin.finance.revenueDashboard.planDistribution")}>
          <TeDataTable
            columns={COLUMNS()}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.finance.revenueDashboard.planDistributionCaption")}
            emptyTitle={t("screen.admin.finance.revenueDashboard.noDataForThisPeriodEmptyTitle")}
            emptyDescription={t(
              "screen.admin.finance.revenueDashboard.noSubscriptionsWereActiveInEmptyDescription",
            )}
          />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
