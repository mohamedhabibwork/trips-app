import { useState } from "react";

import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeSwitch } from "@trips-app/ui/components/te-switch";

import { TripWizardFrame } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function TripWizardStep7PricingAndCapacity() {
  const [childTracking, setChildTracking] = useState(false);

  return (
    <StatePreview>
      <TripWizardFrame
        title="Trip wizard step 7: pricing and capacity"
        stepId="pricing"
        previousSlug="trip-wizard-step-6-seating"
        nextSlug="trip-wizard-step-8-publish"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TeInput label="Base price" placeholder="[Amount]" inputMode="decimal" />
          <TeInput label="Currency" placeholder="[Currency code]" />
        </div>
        <TeInput
          label="Capacity per vehicle"
          placeholder="[Seat count]"
          readOnly
          supportingText="Set by the seat count of each vehicle type."
        />
        <TeSwitch
          checked={childTracking}
          onCheckedChange={setChildTracking}
          label="Child tracking"
          onLabel="On"
          offLabel="Off"
        />
        <TeInlineAlert tone="info">
          Child tracking needs a parent on Explorer or VIP and an organization on Growth or
          Enterprise.
        </TeInlineAlert>
      </TripWizardFrame>
    </StatePreview>
  );
}
