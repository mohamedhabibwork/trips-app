import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";

import { OrgButtonLink, OrgLink } from "../common/org-link";
import { OrgSection, TripWizardFrame } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface TripProgramRow {
  id: string;
  name: string;
  pricingModel: string;
  typeFlags: string;
  cap: string;
}

const PROGRAM_ROWS: readonly TripProgramRow[] = [
  {
    id: "program-1",
    name: "[Program name]",
    pricingModel: "[Pricing model]",
    typeFlags: "[Type flags]",
    cap: "[Cap]",
  },
];

const COLUMNS: readonly TeDataTableColumn<TripProgramRow>[] = [
  {
    key: "name",
    header: "Program",
    render: (row) => <OrgLink slug="program-editor">{row.name}</OrgLink>,
  },
  { key: "pricingModel", header: "Pricing model" },
  { key: "typeFlags", header: "Type flags" },
  { key: "cap", header: "Cap", align: "end" },
];

export function TripWizardStep5Programs() {
  return (
    <StatePreview>
      <TripWizardFrame
        title="Trip wizard step 5: programs"
        stepId="programs"
        previousSlug="trip-wizard-step-4-staffing"
        nextSlug="trip-wizard-step-6-seating"
      >
        <TeKpiTile
          label="Programs on this trip"
          value="0 of 15"
          hint="Growth plan limit per trip"
        />
        <OrgSection
          title="Programs"
          actions={
            <OrgButtonLink slug="program-editor" variant="secondary">
              Add program
            </OrgButtonLink>
          }
        >
          <TeDataTable
            columns={COLUMNS}
            rows={PROGRAM_ROWS}
            getRowKey={(row) => row.id}
            caption="Programs on this trip"
            emptyTitle="No programs yet"
            emptyDescription="Add a program, or continue without one."
          />
        </OrgSection>
      </TripWizardFrame>
    </StatePreview>
  );
}
