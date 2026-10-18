import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminPage,
  AdminPanel,
  AdminStatus,
  AdminTabs,
  setSelectedAdminPlanId,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface PlanRow {
  id: string;
  tier: string;
  state: "active" | "draft";
  subscriptions: string;
}

const DEFAULT_PLAN_ROWS: readonly PlanRow[] = [];

const STATE_PRESENTATION = (): Record<PlanRow["state"], AdminStatusPresentation> => ({
  active: { tone: "success", icon: "check", label: t("screen.admin.plans.plansCatalog.active") },
  draft: { tone: "neutral", icon: "file", label: t("screen.admin.plans.plansCatalog.draft") },
});

const ROLE_TABS = () => [
  { id: "organization", label: t("screen.admin.plans.plansCatalog.organization") },
  { id: "driver", label: t("screen.admin.plans.plansCatalog.platformDriver") },
  { id: "photographer", label: t("screen.admin.plans.plansCatalog.platformPhotographer") },
  { id: "traveler", label: t("screen.admin.plans.plansCatalog.traveler") },
];

const COLUMNS = (): readonly TeDataTableColumn<PlanRow>[] => [
  { key: "tier", header: t("screen.admin.plans.plansCatalog.tier") },
  {
    key: "state",
    header: t("screen.admin.plans.plansCatalog.status"),
    render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
  },
  {
    key: "subscriptions",
    header: t("screen.admin.plans.plansCatalog.activeSubscriptions"),
    align: "end",
  },
  {
    key: "edit",
    header: t("screen.admin.plans.plansCatalog.action"),
    render: (row) => (
      <span onClick={() => setSelectedAdminPlanId(row.id)}>
        <AdminScreenLink
          slug="plan-editor"
          variant="secondary"
          ariaLabel={t("screen.admin.plans.plansCatalog.editPlan", { tier: row.tier })}
        >
          {t("screen.admin.plans.plansCatalog.editPlan2")}
        </AdminScreenLink>
      </span>
    ),
  },
];

export function PlansCatalog() {
  const catalogQuery = useQuery({
    ...orpc.plans.getCatalog.queryOptions({ input: {} }),
  });

  const rows: readonly PlanRow[] =
    catalogQuery.data && catalogQuery.data.length > 0
      ? catalogQuery.data.map((plan) => ({
          id: plan.id,
          tier: plan.nameEn,
          state: "active",
          subscriptions: plan.monthlyPriceMinor === 0 ? "1" : "0",
        }))
      : DEFAULT_PLAN_ROWS;

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.plans.plansCatalog.plansCatalog")}
        description={t("screen.admin.plans.plansCatalog.plansForEachRoleBy")}
        actions={
          <AdminActions>
            <AdminScreenLink slug="subscriptions-and-overrides" variant="secondary">
              {t("screen.admin.plans.plansCatalog.subscriptionsAndOverrides")}
            </AdminScreenLink>
            <AdminScreenLink slug="plan-editor" variant="primary">
              {t("screen.admin.plans.plansCatalog.createTier")}
            </AdminScreenLink>
          </AdminActions>
        }
      />
      <StatePreview
        emptyTitle={t("screen.admin.plans.plansCatalog.noPlansForThisRole")}
        emptyDescription={t("screen.admin.plans.plansCatalog.createTheFirstTierFor")}
        loadingLabel={t("screen.admin.plans.plansCatalog.loadingThePlans")}
      >
        <AdminTabs tabs={ROLE_TABS()} ariaLabel={t("screen.admin.plans.plansCatalog.role")} />
        <AdminPanel title={t("screen.admin.plans.plansCatalog.tiers")}>
          <TeDataTable
            columns={COLUMNS()}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.plans.plansCatalog.plansForThisRole")}
            emptyTitle={t("screen.admin.plans.plansCatalog.noPlansForThisRoleEmptyTitle")}
            emptyDescription={t(
              "screen.admin.plans.plansCatalog.createTheFirstTierForEmptyDescription",
            )}
          />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
