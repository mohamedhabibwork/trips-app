import { useState } from "react";

import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeSwitch } from "@trips-app/ui/components/te-switch";

import { TripWizardFrame } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function TripWizardStep6Seating() {
  const [selfSelect, setSelfSelect] = useState(false);

  return (
    <StatePreview>
      <TripWizardFrame
        title="Trip wizard step 6: seating"
        stepId="seating"
        previousSlug="trip-wizard-step-5-programs"
        nextSlug="trip-wizard-step-7-pricing-and-capacity"
      >
        <TeSwitch
          checked={selfSelect}
          onCheckedChange={setSelfSelect}
          label="Travelers choose their own seats"
          onLabel="Self-select"
          offLabel="Organization assigns seats"
        />
        <TeInlineAlert tone="info">
          Organization-assigned seats are the default. Changing the seat mode after bookings follows
          the trip change rules.
        </TeInlineAlert>
        <TeInput
          label="Priority window for Explorer and VIP travelers"
          placeholder="[Window length]"
          supportingText="The length of the window is still to be decided."
        />
      </TripWizardFrame>
    </StatePreview>
  );
}
