import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminSearch,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface DealRow {
  id: string;
  organization: string;
  supplier: string;
  vehicle: string;
  state: "open" | "finalized" | "rejected";
  counters: string;
  finalAmount: string;
}

const DEAL_ROWS: readonly DealRow[] = [
  {
    id: "deal-1",
    organization: "[Organization name]",
    supplier: "[Supplier name]",
    vehicle: "[Vehicle or trip reference]",
    state: "open",
    counters: "0",
    finalAmount: "[Amount]",
  },
  {
    id: "deal-2",
    organization: "[Organization name]",
    supplier: "[Supplier name]",
    vehicle: "[Vehicle or trip reference]",
    state: "finalized",
    counters: "0",
    finalAmount: "[Amount]",
  },
];

const STATE_PRESENTATION: Record<DealRow["state"], AdminStatusPresentation> = {
  open: { tone: "info", icon: "clock", label: "Open" },
  finalized: { tone: "success", icon: "check", label: "Finalized" },
  rejected: { tone: "danger", icon: "close", label: "Rejected" },
};

const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "Any state" },
  { value: "open", label: "Open" },
  { value: "finalized", label: "Finalized" },
  { value: "rejected", label: "Rejected" },
];

const COLUMNS: readonly TeDataTableColumn<DealRow>[] = [
  { key: "organization", header: "Organization" },
  { key: "supplier", header: "Supplier" },
  { key: "vehicle", header: "Vehicle or trip" },
  {
    key: "state",
    header: "State",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  { key: "counters", header: "Counter offers", align: "end" },
  { key: "finalAmount", header: "Final amount" },
  {
    key: "open",
    header: "Action",
    render: (row) => (
      <span className="flex flex-wrap gap-2">
        <AdminScreenLink
          slug="deal-audit-detail"
          variant="secondary"
          ariaLabel={`Open deal for ${row.supplier}`}
        >
          Open deal
        </AdminScreenLink>
        <TeButton variant="ghost" aria-label={`Flag deal for ${row.supplier} for review`}>
          Flag for review
        </TeButton>
      </span>
    ),
  },
];

export function DealAuditList() {
  return (
    <AdminPage>
      <TePageHeader title="Deal audit list" description="Find deals and see their state." />
      <StatePreview
        emptyTitle="No deals"
        emptyDescription="No deals match these filters."
        loadingLabel="Loading the deals."
      >
        <AdminFilters>
          <AdminSearch
            label="Organization or supplier"
            placeholder="Name or deal reference"
            clearLabel="Clear search"
          />
          <AdminFilterSelect label="State" options={STATE_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Deals">
          <TeDataTable
            columns={COLUMNS}
            rows={DEAL_ROWS}
            getRowKey={(row) => row.id}
            caption="Deal audit list"
            emptyTitle="No deals"
            emptyDescription="No deals match these filters."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
