import { useState } from "react";

import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";

import { TripWizardFrame } from "../common/org-shared";

const NAME_REQUIRED_MESSAGE = "Enter a trip name to continue.";

export function TripWizardStep1Basics() {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  const requireName = (): boolean => {
    const isValid = name.trim().length > 0;
    setNameError(isValid ? undefined : NAME_REQUIRED_MESSAGE);
    return isValid;
  };

  return (
    <TripWizardFrame
      title="Trip wizard step 1: basics"
      stepId="basics"
      previousSlug="trips-list"
      nextSlug="trip-wizard-step-2-schedule-and-route"
      beforeNext={requireName}
    >
      <TeKpiTile label="Active trips this month" value="0" hint="Monthly limit: [plan limit]" />
      <TeInlineAlert tone="info">
        Your draft is saved as you go. It stays available if your session ends.
      </TeInlineAlert>
      <TeInput
        label="Trip name"
        placeholder="[Trip name]"
        dir="auto"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={nameError}
      />
      <TeInput label="Description" placeholder="[Short description]" dir="auto" />
      <TeInput label="Trip type" placeholder="[Trip type]" />
      <TeInput label="Language" placeholder="[Language]" />
    </TripWizardFrame>
  );
}
