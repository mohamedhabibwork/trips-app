import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
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

interface ExceptionRow {
  id: string;
  reference: string;
  amount: string;
  type: "missing" | "mismatch";
  state: "open" | "resolved";
}

const EXCEPTION_ROWS: readonly ExceptionRow[] = [
  {
    id: "exc-1",
    reference: "[Gateway reference]",
    amount: "[Amount]",
    type: "missing",
    state: "open",
  },
  {
    id: "exc-2",
    reference: "[Gateway reference]",
    amount: "[Amount]",
    type: "mismatch",
    state: "open",
  },
];

const TYPE_PRESENTATION: Record<ExceptionRow["type"], AdminStatusPresentation> = {
  missing: { tone: "warning", icon: "alert", label: "Missing from ledger" },
  mismatch: { tone: "danger", icon: "alert", label: "Amount mismatch" },
};

const STATE_PRESENTATION: Record<ExceptionRow["state"], AdminStatusPresentation> = {
  open: { tone: "warning", icon: "clock", label: "Open" },
  resolved: { tone: "success", icon: "check", label: "Resolved" },
};

const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "Any state" },
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
];

const COLUMNS: readonly TeDataTableColumn<ExceptionRow>[] = [
  { key: "reference", header: "Gateway reference" },
  { key: "amount", header: "Amount" },
  {
    key: "type",
    header: "Type",
    render: (row) => <AdminStatus status={TYPE_PRESENTATION[row.type]} />,
  },
  {
    key: "state",
    header: "State",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  {
    key: "open",
    header: "Action",
    render: (row) => (
      <TeButton variant="secondary" aria-label={`Resolve exception ${row.reference}`}>
        Resolve
      </TeButton>
    ),
  },
];

export function ReconciliationExceptions() {
  const [note, setNote] = useState("");
  const canResolve = note.trim() !== "";

  return (
    <AdminPage>
      <TePageHeader
        title="Reconciliation exceptions"
        description="Gateway records that do not match the ledger."
      />
      <StatePreview
        emptyTitle="No exceptions"
        emptyDescription="Gateway records match the ledger."
        loadingLabel="Loading the exceptions."
      >
        <TeInlineAlert tone="info" title="Schedule">
          Reconciliation runs daily (D-29).
        </TeInlineAlert>
        <AdminFilters>
          <AdminFilterSelect label="State" options={STATE_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Exceptions">
          <TeDataTable
            columns={COLUMNS}
            rows={EXCEPTION_ROWS}
            getRowKey={(row) => row.id}
            caption="Reconciliation exceptions"
            emptyTitle="No exceptions"
            emptyDescription="Gateway records match the ledger."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
        <AdminPanel title="Resolve selected exception">
          <TeInput
            label="Resolution note (required)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="[What was checked and why this is resolved]"
          />
          <AdminActions>
            <AdminScreenLink slug="platform-financial-view" variant="secondary">
              Back to financial view
            </AdminScreenLink>
            <TeButton disabled={!canResolve}>Resolve exception</TeButton>
          </AdminActions>
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
