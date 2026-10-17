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

interface DisputeRow {
  id: string;
  parties: string;
  reference: string;
  type: string;
  age: string;
  state: "awaiting" | "acknowledged" | "resolved";
}

const DISPUTE_ROWS: readonly DisputeRow[] = [
  {
    id: "dispute-1",
    parties: "[Party A] and [Party B]",
    reference: "[Booking or trip reference]",
    type: "[Dispute type]",
    age: "0 working days",
    state: "awaiting",
  },
  {
    id: "dispute-2",
    parties: "[Party A] and [Party B]",
    reference: "[Booking or trip reference]",
    type: "[Dispute type]",
    age: "0 working days",
    state: "acknowledged",
  },
];

const STATE_PRESENTATION: Record<DisputeRow["state"], AdminStatusPresentation> = {
  awaiting: { tone: "warning", icon: "clock", label: "Awaiting acknowledgement" },
  acknowledged: { tone: "info", icon: "check", label: "Acknowledged" },
  resolved: { tone: "success", icon: "check", label: "Resolved" },
};

const TYPE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All types" },
  { value: "placeholder", label: "[Dispute types, pending D-251]" },
];
const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "Any state" },
  { value: "awaiting", label: "Awaiting acknowledgement" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "resolved", label: "Resolved" },
];

const COLUMNS: readonly TeDataTableColumn<DisputeRow>[] = [
  { key: "parties", header: "Parties" },
  { key: "reference", header: "Booking or trip" },
  { key: "type", header: "Type" },
  { key: "age", header: "Age", align: "end" },
  {
    key: "state",
    header: "State",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  {
    key: "open",
    header: "Action",
    render: (row) => (
      <AdminScreenLink
        slug="dispute-detail-and-refund-decision"
        variant="secondary"
        ariaLabel={`Open dispute ${row.reference}`}
      >
        Open dispute
      </AdminScreenLink>
    ),
  },
];

export function DisputesQueue() {
  return (
    <AdminPage>
      <TePageHeader title="Disputes queue" description="Work disputes between parties." />
      <StatePreview
        emptyTitle="No open disputes"
        emptyDescription="No disputes match these filters."
        loadingLabel="Loading the disputes."
      >
        <TeInlineAlert tone="info" title="Deadlines">
          Acknowledge a dispute within 2 working days. Resolve it within 10 working days (D-32).
        </TeInlineAlert>
        <AdminFilters>
          <AdminFilterSelect label="Type" options={TYPE_OPTIONS} />
          <AdminFilterSelect label="State" options={STATE_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Disputes">
          <TeDataTable
            columns={COLUMNS}
            rows={DISPUTE_ROWS}
            getRowKey={(row) => row.id}
            caption="Disputes queue"
            emptyTitle="No open disputes"
            emptyDescription="No disputes match these filters."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
