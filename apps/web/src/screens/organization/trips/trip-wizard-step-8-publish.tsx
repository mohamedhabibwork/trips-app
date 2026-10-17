import { useState } from "react";

import { TeChecklist, type TeChecklistItem } from "@trips-app/ui/components/te-checklist";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";

import { OrgSection, TripWizardFrame } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const REQUIRED_STEPS: readonly TeChecklistItem[] = [
  { id: "basics", label: "Basics", checked: true },
  { id: "schedule", label: "Schedule and route", checked: true },
  { id: "vehicles", label: "Vehicles", checked: true },
  { id: "staffing", label: "Staffing", checked: true },
  { id: "programs", label: "Programs", checked: true },
  { id: "seating", label: "Seating", checked: true },
  { id: "pricing", label: "Pricing and capacity", checked: true },
];

const PUBLISH_MODE_OPTIONS: readonly TeSelectOption[] = [
  { value: "draft", label: "Save as draft" },
  { value: "public", label: "Publish to everyone" },
  { value: "targeted", label: "Publish to a targeted audience list" },
];

export function TripWizardStep8Publish() {
  const [publishMode, setPublishMode] = useState("public");

  return (
    <StatePreview>
      <TripWizardFrame
        title="Trip wizard step 8: publish"
        stepId="publish"
        previousSlug="trip-wizard-step-7-pricing-and-capacity"
        nextSlug="trip-command-view"
        primaryLabel="Publish"
        secondaryLabel="Save draft"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile
            label="Trips published this month"
            value="0"
            hint="Monthly limit: [plan limit]"
          />
        </div>
        <OrgSection title="Readiness">
          <TeChecklist items={REQUIRED_STEPS} ariaLabel="Required steps" />
        </OrgSection>
        <OrgSection title="Publish mode">
          <div className="grid gap-4 sm:grid-cols-2">
            <TeSelect
              label="Publish mode"
              options={PUBLISH_MODE_OPTIONS}
              value={publishMode}
              onValueChange={setPublishMode}
            />
            <TeInput
              label="Audience list"
              placeholder="[Audience list]"
              supportingText="Used only when publishing to a targeted audience."
            />
          </div>
        </OrgSection>
      </TripWizardFrame>
    </StatePreview>
  );
}
