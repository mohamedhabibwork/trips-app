import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

type CaseStatus = "open" | "routed";

interface CaseRow {
  id: string;
  reference: string;
  time: string;
  trip: string;
  vehicle: string;
  status: CaseStatus;
}

const CASE_ROWS: readonly CaseRow[] = [
  {
    id: "case-1",
    reference: "[Case reference]",
    time: "[Time]",
    trip: "[Trip name]",
    vehicle: "[Vehicle plate]",
    status: "open",
  },
  {
    id: "case-2",
    reference: "[Case reference]",
    time: "[Time]",
    trip: "[Trip name]",
    vehicle: "[Vehicle plate]",
    status: "routed",
  },
];

const CASE_COLUMNS: readonly TeDataTableColumn<CaseRow>[] = [
  { key: "reference", header: "Case" },
  { key: "time", header: "Time" },
  { key: "trip", header: "Trip" },
  { key: "vehicle", header: "Vehicle" },
  {
    key: "status",
    header: "Status",
    render: (row) =>
      row.status === "open" ? (
        <StateBadge tone="warning" icon="alert" label="Case open" />
      ) : (
        <StateBadge tone="info" icon="arrow" label="Routed to escalation contact" />
      ),
  },
];

export function ChildSafetyReports() {
  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "live-operations", label: "Back to live operations" }} />
        <TePageHeader title="Child-safety reports" actions={<TeButton>New report</TeButton>} />
        <TeInlineAlert tone="info" title="Escalation contact">
          Reports are routed to: [Escalation contact, to be decided].
        </TeInlineAlert>
        <OrgSection title="Cases">
          <TeDataTable
            columns={CASE_COLUMNS}
            rows={CASE_ROWS}
            getRowKey={(row) => row.id}
            caption="Child-safety cases"
            emptyTitle="No cases"
            emptyDescription="Cases you submit for trips you run appear here."
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
