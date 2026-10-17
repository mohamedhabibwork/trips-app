import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface SettlementRow {
  id: string;
  from: string;
  to: string;
  amount: string;
  date: string;
  state: "open" | "settled";
}

const SETTLEMENT_ROWS: readonly SettlementRow[] = [
  {
    id: "set-1",
    from: "[Party]",
    to: "[Party]",
    amount: "[Amount]",
    date: "[Date]",
    state: "open",
  },
  {
    id: "set-2",
    from: "[Party]",
    to: "[Party]",
    amount: "[Amount]",
    date: "[Date]",
    state: "settled",
  },
];

const STATE_PRESENTATION: Record<SettlementRow["state"], AdminStatusPresentation> = {
  open: { tone: "warning", icon: "clock", label: "Open" },
  settled: { tone: "success", icon: "check", label: "Settled" },
};

const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "Any state" },
  { value: "open", label: "Open" },
  { value: "settled", label: "Settled" },
];

const COLUMNS: readonly TeDataTableColumn<SettlementRow>[] = [
  { key: "from", header: "From" },
  { key: "to", header: "To" },
  { key: "amount", header: "Amount" },
  { key: "date", header: "Date" },
  {
    key: "state",
    header: "State",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  {
    key: "action",
    header: "Action",
    render: (row) => (
      <TeButton
        variant="secondary"
        aria-label={`Mark settlement from ${row.from} to ${row.to} as settled`}
      >
        Mark settled
      </TeButton>
    ),
  },
];

export function SettlementsTracker() {
  const [reference, setReference] = useState("");
  const canMark = reference.trim() !== "";

  return (
    <AdminPage>
      <TePageHeader
        title="Settlements tracker"
        description="Amounts owed between organizations, suppliers and the platform, until settled."
        actions={
          <AdminScreenLink slug="platform-financial-view" variant="ghost">
            Back to financial view
          </AdminScreenLink>
        }
      />
      <StatePreview
        emptyTitle="No settlements"
        emptyDescription="No amounts are owed right now."
        loadingLabel="Loading the settlements."
      >
        <AdminFilters>
          <AdminFilterSelect label="State" options={STATE_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Settlements">
          <TeDataTable
            columns={COLUMNS}
            rows={SETTLEMENT_ROWS}
            getRowKey={(row) => row.id}
            caption="Settlements"
            emptyTitle="No settlements"
            emptyDescription="No amounts are owed right now."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
        <AdminPanel title="Mark settled">
          <TeInput
            label="Recorded payment reference (required)"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="[Payment reference]"
          />
          <TeInput label="Payment date" placeholder="YYYY-MM-DD" />
          <AdminActions>
            <AdminScreenLink slug="platform-financial-view" variant="secondary">
              Cancel
            </AdminScreenLink>
            <TeButton disabled={!canMark}>Mark as settled</TeButton>
          </AdminActions>
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
