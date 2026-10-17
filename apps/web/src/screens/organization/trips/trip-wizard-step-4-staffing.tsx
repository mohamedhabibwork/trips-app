import { useState } from "react";

import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";

import { OrgButtonLink } from "../common/org-link";
import { StateBadge, TripWizardFrame } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const DRIVER_OPTIONS: readonly TeSelectOption[] = [
  { value: "none", label: "Not assigned" },
  { value: "organization", label: "Organization-owned" },
  { value: "platform", label: "Platform (through a deal)" },
];

const MODERATOR_OPTIONS: readonly TeSelectOption[] = [
  { value: "none", label: "Not assigned" },
  { value: "organization", label: "Organization-owned" },
];

const PHOTOGRAPHER_OPTIONS: readonly TeSelectOption[] = [
  { value: "none", label: "Not assigned" },
  { value: "organization", label: "Organization-owned" },
  { value: "platform", label: "Platform (through a deal)" },
];

interface VehicleStaffingCardProps {
  vehicleLabel: string;
}

function VehicleStaffingCard({ vehicleLabel }: VehicleStaffingCardProps) {
  const [driver, setDriver] = useState("none");
  const [moderator, setModerator] = useState("none");
  const [photographer, setPhotographer] = useState("none");

  const missingLabels = [
    driver === "none" ? "Driver missing" : null,
    moderator === "none" ? "Moderator missing" : null,
  ].filter((label): label is string => label !== null);

  const gapBadge =
    missingLabels.length > 0 ? (
      <StateBadge tone="warning" icon="alert" label={missingLabels.join(", ")} />
    ) : (
      <StateBadge tone="success" icon="check" label="Ready" />
    );

  return (
    <TeCard
      header={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="te-h3">{vehicleLabel}</h3>
          {gapBadge}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <TeSelect
            label="Driver"
            options={DRIVER_OPTIONS}
            value={driver}
            onValueChange={setDriver}
          />
          <TeSelect
            label="Moderator"
            options={MODERATOR_OPTIONS}
            value={moderator}
            onValueChange={setModerator}
          />
          <TeSelect
            label="Photographer"
            options={PHOTOGRAPHER_OPTIONS}
            value={photographer}
            onValueChange={setPhotographer}
          />
        </div>
        <div className="flex justify-end">
          <OrgButtonLink slug="platform-supplier-search-and-deal-start" variant="ghost">
            Find platform supplier
          </OrgButtonLink>
        </div>
      </div>
    </TeCard>
  );
}

export function TripWizardStep4Staffing() {
  return (
    <StatePreview>
      <TripWizardFrame
        title="Trip wizard step 4: staffing"
        stepId="staffing"
        previousSlug="trip-wizard-step-3-vehicles"
        nextSlug="trip-wizard-step-5-programs"
      >
        <TeInlineAlert tone="info">
          A platform driver or photographer is assigned only after the deal is finalized.
        </TeInlineAlert>
        <VehicleStaffingCard vehicleLabel="Vehicle [plate]" />
      </TripWizardFrame>
    </StatePreview>
  );
}
