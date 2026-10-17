import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function VehicleEditor() {
  const goTo = useOrgNavigate();
  const [removeOpen, setRemoveOpen] = useState(false);

  const handleRemove = () => {
    setRemoveOpen(false);
    void goTo("vehicle-registry");
  };

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "vehicle-registry", label: "Back to vehicles" }} />
        <TePageHeader
          title="Vehicle editor"
          actions={<TeButton onClick={() => void goTo("vehicle-registry")}>Save</TeButton>}
        />
        <OrgSection title="Vehicle">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput label="Plate" placeholder="[Plate]" dir="auto" />
              <TeInput label="Model" placeholder="[Model]" dir="auto" />
              <TeInput label="Year" placeholder="[Year]" inputMode="numeric" />
              <TeInput label="Vehicle type" placeholder="[Vehicle type]" />
              <TeInput
                label="Seat count"
                placeholder="[Seat count]"
                inputMode="numeric"
                supportingText="Must match the seat count of the vehicle type."
              />
              <TeInput label="Registration status" placeholder="[Registration status]" />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Remove vehicle">
          <TeInlineAlert tone="info" title="Removal is blocked while bookings are confirmed">
            This vehicle has 0 confirmed bookings. A vehicle with confirmed bookings cannot be
            removed.
          </TeInlineAlert>
          <div className="flex justify-start">
            <TeButton variant="ghost" onClick={() => setRemoveOpen(true)}>
              Remove vehicle
            </TeButton>
          </div>
        </OrgSection>
        <TeDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          title="Remove this vehicle?"
          description="The vehicle leaves the registry and future trips. It cannot be removed while bookings are confirmed."
          primaryLabel="Remove vehicle"
          onPrimary={handleRemove}
          secondaryLabel="Keep vehicle"
          onSecondary={() => setRemoveOpen(false)}
          tone="danger"
        />
      </div>
    </StatePreview>
  );
}
