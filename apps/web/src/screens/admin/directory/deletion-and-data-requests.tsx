import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
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
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface RequestRow {
  id: string;
  type: "Account deletion" | "Data copy";
  account: string;
  requested: string;
  dueOrGrace: string;
  state: "grace" | "overdue";
}

const REQUEST_ROWS: readonly RequestRow[] = [
  {
    id: "req-1",
    type: "Account deletion",
    account: "[Account name]",
    requested: "[Date]",
    dueOrGrace: "[Grace end date]",
    state: "grace",
  },
  {
    id: "req-2",
    type: "Data copy",
    account: "[Account name]",
    requested: "[Date]",
    dueOrGrace: "[Due date]",
    state: "overdue",
  },
];

const STATE_PRESENTATION: Record<RequestRow["state"], AdminStatusPresentation> = {
  grace: { tone: "info", icon: "clock", label: "Grace period" },
  overdue: { tone: "danger", icon: "alert", label: "Overdue" },
};

const TYPE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All types" },
  { value: "deletion", label: "Account deletion" },
  { value: "data-copy", label: "Data copy" },
];
const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "Any status" },
  { value: "grace", label: "Grace period" },
  { value: "overdue", label: "Overdue" },
];

const COLUMNS: readonly TeDataTableColumn<RequestRow>[] = [
  { key: "type", header: "Request type" },
  { key: "account", header: "Account" },
  { key: "requested", header: "Requested" },
  { key: "dueOrGrace", header: "Grace end or due date" },
  {
    key: "state",
    header: "Status",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  {
    key: "open",
    header: "Action",
    render: (row) => (
      <AdminScreenLink
        slug="entity-detail"
        variant="secondary"
        ariaLabel={`Open account for ${row.account}`}
      >
        Open account
      </AdminScreenLink>
    ),
  },
];

export function DeletionAndDataRequests() {
  return (
    <AdminPage>
      <TePageHeader
        title="Deletion and data requests"
        description="Work account deletion and data copy requests."
      />
      <StatePreview
        emptyTitle="No requests"
        emptyDescription="No deletion or data copy requests are open."
        loadingLabel="Loading the requests."
      >
        <TeInlineAlert tone="info" title="Retention rules">
          Accounts are purged on day 31 after the deletion request (D-38). A data copy past its due
          date is flagged overdue (D-162).
        </TeInlineAlert>
        <AdminFilters>
          <AdminFilterSelect label="Request type" options={TYPE_OPTIONS} />
          <AdminFilterSelect label="Status" options={STATE_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Requests">
          <TeDataTable
            columns={COLUMNS}
            rows={REQUEST_ROWS}
            getRowKey={(row) => row.id}
            caption="Deletion and data requests"
            emptyTitle="No requests"
            emptyDescription="No deletion or data copy requests are open."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
