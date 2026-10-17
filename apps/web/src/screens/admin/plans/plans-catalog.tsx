import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminPage,
  AdminPanel,
  AdminStatus,
  AdminTabs,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface PlanRow {
  id: string;
  tier: string;
  state: "active" | "draft";
  subscriptions: string;
}

const PLAN_ROWS: readonly PlanRow[] = [
  { id: "plan-1", tier: "[Tier name]", state: "active", subscriptions: "0" },
  { id: "plan-2", tier: "[Tier name]", state: "draft", subscriptions: "0" },
];

const STATE_PRESENTATION: Record<PlanRow["state"], AdminStatusPresentation> = {
  active: { tone: "success", icon: "check", label: "Active" },
  draft: { tone: "neutral", icon: "file", label: "Draft" },
};

const ROLE_TABS = [
  { id: "organization", label: "Organization" },
  { id: "driver", label: "Platform driver" },
  { id: "photographer", label: "Platform photographer" },
  { id: "traveler", label: "Traveler" },
];

const COLUMNS: readonly TeDataTableColumn<PlanRow>[] = [
  { key: "tier", header: "Tier" },
  {
    key: "state",
    header: "Status",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  { key: "subscriptions", header: "Active subscriptions", align: "end" },
  {
    key: "edit",
    header: "Action",
    render: (row) => (
      <AdminScreenLink slug="plan-editor" variant="secondary" ariaLabel={`Edit plan ${row.tier}`}>
        Edit plan
      </AdminScreenLink>
    ),
  },
];

export function PlansCatalog() {
  return (
    <AdminPage>
      <TePageHeader
        title="Plans catalog"
        description="Plans for each role, by tier."
        actions={
          <AdminActions>
            <AdminScreenLink slug="subscriptions-and-overrides" variant="secondary">
              Subscriptions and overrides
            </AdminScreenLink>
            <AdminScreenLink slug="plan-editor" variant="primary">
              Create tier
            </AdminScreenLink>
          </AdminActions>
        }
      />
      <StatePreview
        emptyTitle="No plans for this role"
        emptyDescription="Create the first tier for this role."
        loadingLabel="Loading the plans."
      >
        <AdminTabs tabs={ROLE_TABS} ariaLabel="Role" />
        <AdminPanel title="Tiers">
          <TeDataTable
            columns={COLUMNS}
            rows={PLAN_ROWS}
            getRowKey={(row) => row.id}
            caption="Plans for this role"
            emptyTitle="No plans for this role"
            emptyDescription="Create the first tier for this role."
          />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
