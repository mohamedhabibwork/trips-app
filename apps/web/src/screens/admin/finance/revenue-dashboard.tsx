import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
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

const PLAN_SHARE_ROWS: readonly PlanShareRow[] = [
  { id: "share-1", plan: "[Plan name]", subscriptions: "0", share: "[Percent]" },
  { id: "share-2", plan: "[Plan name]", subscriptions: "0", share: "[Percent]" },
];

const PERIOD_OPTIONS: readonly TeSelectOption[] = [
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
  { value: "year", label: "This year" },
];
const ROLE_OPTIONS: readonly TeSelectOption[] = [{ value: "all", label: "All roles" }];

const COLUMNS: readonly TeDataTableColumn<PlanShareRow>[] = [
  { key: "plan", header: "Plan" },
  { key: "subscriptions", header: "Subscriptions", align: "end" },
  { key: "share", header: "Share", align: "end" },
];

export function RevenueDashboard() {
  return (
    <AdminPage>
      <TePageHeader
        title="Revenue dashboard"
        description="MRR, churn, upgrades and downgrades for the selected period."
        actions={
          <AdminScreenLink slug="platform-financial-view" variant="secondary">
            Open financial view
          </AdminScreenLink>
        }
      />
      <StatePreview
        emptyTitle="No data for this period"
        emptyDescription="No subscriptions were active in the selected period."
        loadingLabel="Loading the revenue figures."
      >
        <AdminFilters>
          <AdminFilterSelect label="Period" options={PERIOD_OPTIONS} />
          <AdminFilterSelect label="Role" options={ROLE_OPTIONS} />
        </AdminFilters>
        <AdminKpiGrid>
          <TeKpiTile
            label="MRR"
            value="[Amount]"
            hint="Monthly recurring revenue, in the ISO currency code"
          />
          <TeKpiTile label="Churn" value="[Percent]" hint="Subscriptions cancelled in the period" />
          <TeKpiTile label="Upgrades" value="0" hint="Plan changes to a higher tier" />
          <TeKpiTile label="Downgrades" value="0" hint="Plan changes to a lower tier" />
        </AdminKpiGrid>
        <AdminPanel title="Plan distribution">
          <TeDataTable
            columns={COLUMNS}
            rows={PLAN_SHARE_ROWS}
            getRowKey={(row) => row.id}
            caption="Plan distribution"
            emptyTitle="No data for this period"
            emptyDescription="No subscriptions were active in the selected period."
          />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
