import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface ModeratorReportRow {
  id: string;
  vehicle: string;
  headcount: string;
  checkedIn: string;
  incidents: string;
  submittedAt: string;
}

const REPORT_ROWS: readonly ModeratorReportRow[] = [
  {
    id: "report-1",
    vehicle: "[Vehicle plate]",
    headcount: "0",
    checkedIn: "0",
    incidents: "0",
    submittedAt: "[Time]",
  },
];

const REPORT_COLUMNS: readonly TeDataTableColumn<ModeratorReportRow>[] = [
  { key: "vehicle", header: "Vehicle" },
  { key: "headcount", header: "Final headcount", align: "end" },
  { key: "checkedIn", header: "Checked in", align: "end" },
  {
    key: "match",
    header: "Headcount",
    render: (row) =>
      row.headcount === row.checkedIn ? (
        <StateBadge tone="success" icon="check" label="Matches check-in" />
      ) : (
        <StateBadge tone="warning" icon="alert" label="Mismatch" />
      ),
  },
  { key: "incidents", header: "Incidents", align: "end" },
  { key: "submittedAt", header: "Submitted" },
];

export function TripReportReview() {
  const [note, setNote] = useState("");

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "trip-command-view", label: "Back to trip" }} />
        <TePageHeader title="Trip report review" description="[Trip name]" />
        <OrgSection title="Moderator reports">
          <TeDataTable
            columns={REPORT_COLUMNS}
            rows={REPORT_ROWS}
            getRowKey={(row) => row.id}
            caption="Moderator reports per vehicle"
            emptyTitle="No reports yet"
            emptyDescription="Reports appear here after each moderator submits one."
          />
        </OrgSection>
        <OrgSection title="Organization note">
          <TeCard>
            <div className="flex flex-col gap-4">
              <TeInput
                label="Note"
                placeholder="[Note]"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                supportingText="You can add a note. Submitted reports cannot be edited."
                dir="auto"
              />
              <div className="flex justify-end">
                <TeButton disabled={note.trim().length === 0}>Add note</TeButton>
              </div>
            </div>
          </TeCard>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
