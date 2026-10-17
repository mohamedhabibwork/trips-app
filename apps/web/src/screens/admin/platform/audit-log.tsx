import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { StatePreview } from "../common/admin-state-preview";
import {
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminSearch,
} from "../common/admin-shared";

interface AuditRow {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  before: string;
  after: string;
  requestId: string;
}

const AUDIT_ROWS: readonly AuditRow[] = [
  {
    id: "audit-1",
    time: "[Date and time]",
    actor: "[Admin name]",
    action: "[Action]",
    target: "[Target]",
    before: "[Before value]",
    after: "[After value]",
    requestId: "[Request ID]",
  },
  {
    id: "audit-2",
    time: "[Date and time]",
    actor: "[Admin name]",
    action: "[Action]",
    target: "[Target]",
    before: "[Before value]",
    after: "[After value]",
    requestId: "[Request ID]",
  },
];

const RANGE_OPTIONS: readonly TeSelectOption[] = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom range" },
];
const ACTION_OPTIONS: readonly TeSelectOption[] = [{ value: "all", label: "Any action" }];

const COLUMNS: readonly TeDataTableColumn<AuditRow>[] = [
  { key: "time", header: "Time" },
  { key: "actor", header: "Actor" },
  { key: "action", header: "Action" },
  { key: "target", header: "Target" },
  { key: "before", header: "Before" },
  { key: "after", header: "After" },
  { key: "requestId", header: "Request ID" },
];

export function AuditLog() {
  return (
    <AdminPage>
      <TePageHeader
        title="Audit log"
        description="Every admin action and permission change. Read only."
      />
      <StatePreview
        emptyTitle="No entries"
        emptyDescription="No audit entries match these filters."
        loadingLabel="Loading the audit entries."
      >
        <TeInlineAlert tone="info" title="Read only">
          Entries cannot be edited or deleted. The log is kept for 7 years (D-04).
        </TeInlineAlert>
        <AdminFilters>
          <AdminSearch label="Actor" placeholder="Name or email" clearLabel="Clear actor" />
          <AdminFilterSelect label="Action" options={ACTION_OPTIONS} />
          <AdminSearch label="Target" placeholder="Name or reference" clearLabel="Clear target" />
          <AdminFilterSelect label="Time range" options={RANGE_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Entries">
          <TeDataTable
            columns={COLUMNS}
            rows={AUDIT_ROWS}
            getRowKey={(row) => row.id}
            caption="Audit log entries"
            emptyTitle="No entries"
            emptyDescription="No audit entries match these filters."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
