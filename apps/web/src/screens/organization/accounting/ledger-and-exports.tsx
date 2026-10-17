import { useState } from "react";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TePlanGate } from "@trips-app/ui/components/te-plan-gate";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface LedgerRow {
  id: string;
  eventType: string;
  amount: string;
  linked: string;
  gatewayReference: string;
  date: string;
}

const LEDGER_ROWS: readonly LedgerRow[] = [
  {
    id: "ledger-1",
    eventType: "[Event type]",
    amount: "[Amount and currency]",
    linked: "[Booking or deal]",
    gatewayReference: "[Gateway reference]",
    date: "[Date]",
  },
];

const COLUMNS: readonly TeDataTableColumn<LedgerRow>[] = [
  { key: "eventType", header: "Event" },
  { key: "amount", header: "Amount", align: "end" },
  { key: "linked", header: "Booking or deal" },
  { key: "gatewayReference", header: "Gateway reference" },
  { key: "date", header: "Date" },
];

export function LedgerAndExports() {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = LEDGER_ROWS.filter((row) =>
    row.eventType.toLowerCase().includes(normalizedQuery),
  );

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "trip-accounting", label: "Back to trip accounting" }} />
        <TePageHeader title="Ledger and exports" />
        <div className="grid gap-4 sm:grid-cols-3">
          <TeInput label="From" placeholder="YYYY-MM-DD" />
          <TeInput label="To" placeholder="YYYY-MM-DD" />
          <TeSearchField
            label="Filter by event"
            value={query}
            onValueChange={setQuery}
            clearLabel="Clear filter"
          />
        </div>
        <OrgSection title="Ledger lines">
          <TeDataTable
            columns={COLUMNS}
            rows={visibleRows}
            getRowKey={(row) => row.id}
            caption="Ledger lines"
            emptyTitle="No ledger lines"
            emptyDescription="Lines appear here as payments, refunds and costs are recorded."
          />
        </OrgSection>
        <OrgSection title="Export">
          <TePlanGate
            plan="Enterprise"
            lockedLabel="CSV and PDF exports that reconcile with the ledger are available on the Enterprise plan."
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
