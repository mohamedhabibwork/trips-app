import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminPage,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface RunRow {
  id: string;
  week: string;
  suppliers: string;
  total: string;
  state: "completed" | "failed";
}

interface SupplierRow {
  id: string;
  supplier: string;
  amount: string;
  state: "completed" | "failed";
}

const RUN_ROWS: readonly RunRow[] = [
  { id: "run-1", week: "[Week of date]", suppliers: "0", total: "[Amount]", state: "completed" },
  { id: "run-2", week: "[Week of date]", suppliers: "0", total: "[Amount]", state: "failed" },
];

const SUPPLIER_ROWS: readonly SupplierRow[] = [
  { id: "sup-1", supplier: "[Supplier name]", amount: "[Amount]", state: "completed" },
];

const STATE_PRESENTATION: Record<RunRow["state"], AdminStatusPresentation> = {
  completed: { tone: "success", icon: "check", label: "Completed" },
  failed: { tone: "danger", icon: "alert", label: "Failed" },
};

const RUN_COLUMNS: readonly TeDataTableColumn<RunRow>[] = [
  { key: "week", header: "Week" },
  { key: "suppliers", header: "Suppliers", align: "end" },
  { key: "total", header: "Total" },
  {
    key: "state",
    header: "State",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  {
    key: "open",
    header: "Action",
    render: (row) => (
      <TeButton variant="secondary" aria-label={`Open payout run for ${row.week}`}>
        Open run
      </TeButton>
    ),
  },
];

const SUPPLIER_COLUMNS: readonly TeDataTableColumn<SupplierRow>[] = [
  { key: "supplier", header: "Supplier" },
  { key: "amount", header: "Amount" },
  {
    key: "state",
    header: "State",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
];

export function PayoutRuns() {
  return (
    <AdminPage>
      <TePageHeader
        title="Payout runs"
        description="Create and track weekly payout runs for suppliers."
        actions={<TeButton>Create payout run</TeButton>}
      />
      <StatePreview
        emptyTitle="No payout runs"
        emptyDescription="Create the first payout run for this week."
        loadingLabel="Loading the payout runs."
      >
        <TeInlineAlert tone="info" title="Schedule">
          Payout runs are created weekly, on Monday at 06:00 (D-28). Each supplier sees only their
          own amount.
        </TeInlineAlert>
        <AdminPanel title="Runs">
          <TeDataTable
            columns={RUN_COLUMNS}
            rows={RUN_ROWS}
            getRowKey={(row) => row.id}
            caption="Payout runs"
            emptyTitle="No payout runs"
            emptyDescription="Create the first payout run for this week."
          />
        </AdminPanel>
        <AdminPanel title="Run detail: [Week of date]">
          <TeDataTable
            columns={SUPPLIER_COLUMNS}
            rows={SUPPLIER_ROWS}
            getRowKey={(row) => row.id}
            caption="Amount per supplier in this run"
            emptyTitle="No suppliers in this run"
            emptyDescription="This run has no supplier amounts."
          />
        </AdminPanel>
        <AdminActions>
          <AdminScreenLink slug="platform-financial-view" variant="ghost">
            Back to financial view
          </AdminScreenLink>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
