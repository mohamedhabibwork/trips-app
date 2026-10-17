import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSeatMap, type TeSeatRow } from "@trips-app/ui/components/te-seat-map";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const LAYOUT_ROWS: readonly TeSeatRow[] = [
  {
    id: "row-1",
    seats: [
      { id: "1A", label: "1A", state: "available" },
      { id: "1B", label: "1B", state: "available" },
      { id: "1C", label: "1C", state: "available" },
      { id: "1D", label: "1D", state: "available" },
    ],
  },
  {
    id: "row-2",
    seats: [
      { id: "2A", label: "2A", state: "available" },
      { id: "2B", label: "2B", state: "available" },
      { id: "2C", label: "2C", state: "available" },
      { id: "2D", label: "2D", state: "available" },
    ],
  },
];

export function VehicleTypesAndSeatLayout() {
  const goTo = useOrgNavigate();

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "vehicle-registry", label: "Back to vehicles" }} />
        <TePageHeader
          title="Vehicle types and seat layout"
          actions={
            <>
              <TeButton variant="ghost">Archive type</TeButton>
              <TeButton onClick={() => void goTo("vehicle-registry")}>Save</TeButton>
            </>
          }
        />
        <OrgSection title="Type">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput label="Name" placeholder="[Type name]" dir="auto" />
              <TeInput label="Seat count" placeholder="[Seat count]" inputMode="numeric" />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Seat layout">
          <TeCard>
            <TeSeatMap rows={LAYOUT_ROWS} ariaLabel="Seat layout of this vehicle type" />
          </TeCard>
          <p className="te-caption">
            Seat labels appear on the seat map. Archived types are not offered for new trips, and
            existing trips keep their layout.
          </p>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
