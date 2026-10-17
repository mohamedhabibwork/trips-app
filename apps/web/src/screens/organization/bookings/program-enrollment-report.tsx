import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface EnrollmentRow {
  id: string;
  reference: string;
  quantity: string;
  revenue: string;
}

const PROGRAM_OPTIONS: readonly TeSelectOption[] = [
  { value: "program-1", label: "[Program name]" },
];

const ENROLLMENT_ROWS: readonly EnrollmentRow[] = [
  {
    id: "enrollment-1",
    reference: "[Booking reference]",
    quantity: "0",
    revenue: "[Amount and currency]",
  },
];

const COLUMNS: readonly TeDataTableColumn<EnrollmentRow>[] = [
  { key: "reference", header: "Booking" },
  { key: "quantity", header: "Quantity", align: "end" },
  { key: "revenue", header: "Revenue", align: "end" },
];

export function ProgramEnrollmentReport() {
  const [programId, setProgramId] = useState("program-1");

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink parent={{ slug: "analytics-and-reports", label: "Back to analytics" }} />
        <TePageHeader
          title="Program enrollment report"
          actions={<TeButton variant="secondary">Export</TeButton>}
        />
        <TeSelect
          label="Program"
          options={PROGRAM_OPTIONS}
          value={programId}
          onValueChange={setProgramId}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile label="Total quantity" value="0" />
          <TeKpiTile label="Total revenue" value="[Amount and currency]" />
        </div>
        <OrgSection title="Enrollments">
          <TeDataTable
            columns={COLUMNS}
            rows={ENROLLMENT_ROWS}
            getRowKey={(row) => row.id}
            caption="Enrollments for the selected program"
            emptyTitle="No enrollments yet"
            emptyDescription="Travelers who select this program appear here."
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
