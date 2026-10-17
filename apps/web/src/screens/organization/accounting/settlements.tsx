import { useState } from "react";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";

import { WorkspaceBackLink } from "../common/org-link";
import { StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

type SettlementState = "open" | "settled";

interface SettlementRow {
  id: string;
  counterparty: string;
  amount: string;
  state: SettlementState;
  date: string;
}

const SETTLEMENT_ROWS: readonly SettlementRow[] = [
  {
    id: "settlement-1",
    counterparty: "[Supplier name]",
    amount: "[Amount and currency]",
    state: "open",
    date: "[Date]",
  },
  {
    id: "settlement-2",
    counterparty: "[Platform]",
    amount: "[Amount and currency]",
    state: "settled",
    date: "[Date]",
  },
];

const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All settlements" },
  { value: "open", label: "Open" },
  { value: "settled", label: "Settled" },
];

const COLUMNS: readonly TeDataTableColumn<SettlementRow>[] = [
  { key: "counterparty", header: "Counterparty" },
  { key: "amount", header: "Amount", align: "end" },
  {
    key: "state",
    header: "State",
    render: (row) =>
      row.state === "open" ? (
        <StateBadge tone="warning" icon="clock" label="Open" />
      ) : (
        <StateBadge tone="success" icon="check" label="Settled" />
      ),
  },
  { key: "date", header: "Date" },
];

export function Settlements() {
  const [stateFilter, setStateFilter] = useState("all");

  const visibleRows = SETTLEMENT_ROWS.filter(
    (row) => stateFilter === "all" || row.state === stateFilter,
  );

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink parent={{ slug: "trip-accounting", label: "Back to trip accounting" }} />
        <TePageHeader title="Settlements" />
        <TeInlineAlert tone="info">
          Provider payouts are made weekly on Monday at 06:00.
        </TeInlineAlert>
        <div className="grid gap-4 sm:grid-cols-2">
          <TeSelect
            label="State"
            options={STATE_OPTIONS}
            value={stateFilter}
            onValueChange={setStateFilter}
          />
        </div>
        <TeDataTable
          columns={COLUMNS}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption="Settlements"
          emptyTitle="No settlements"
          emptyDescription="Amounts owed between the organization, suppliers and the platform appear here."
        />
      </div>
    </StatePreview>
  );
}
