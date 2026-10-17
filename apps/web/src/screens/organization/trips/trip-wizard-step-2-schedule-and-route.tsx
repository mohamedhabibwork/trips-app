import { TeCard } from "@trips-app/ui/components/te-card";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInput } from "@trips-app/ui/components/te-input";

import { TripWizardFrame } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function TripWizardStep2ScheduleAndRoute() {
  return (
    <StatePreview>
      <TripWizardFrame
        title="Trip wizard step 2: schedule and route"
        stepId="schedule"
        previousSlug="trip-wizard-step-1-basics"
        nextSlug="trip-wizard-step-3-vehicles"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TeInput label="Start date" placeholder="YYYY-MM-DD" />
          <TeInput label="End date" placeholder="YYYY-MM-DD" />
          <TeInput label="Start time" placeholder="HH:MM" />
          <TeInput label="End time" placeholder="HH:MM" />
          <TeInput label="Trip time zone" placeholder="[Time zone]" />
        </div>
        <TeInput label="Origin" placeholder="[Origin]" dir="auto" />
        <TeInput label="Destinations and stops" placeholder="[Destination or stop]" dir="auto" />
        <TeCard>
          <div className="flex flex-col items-center gap-3 text-center">
            <TeIcon name="pin" />
            <p className="te-body">
              The map picker from the maps service sets the origin, destinations and stops.
            </p>
          </div>
        </TeCard>
      </TripWizardFrame>
    </StatePreview>
  );
}
