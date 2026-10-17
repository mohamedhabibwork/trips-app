import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";

import { OrgSection, TripWizardFrame } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface TripVehicleRow {
  id: string;
  vehicle: string;
  vehicleType: string;
  seats: string;
  remove: string;
}

const VEHICLE_ROWS: readonly TripVehicleRow[] = [
  {
    id: "vehicle-1",
    vehicle: "[Vehicle plate]",
    vehicleType: "[Vehicle type]",
    seats: "0",
    remove: "Remove",
  },
];

const COLUMNS: readonly TeDataTableColumn<TripVehicleRow>[] = [
  { key: "vehicle", header: "Vehicle" },
  { key: "vehicleType", header: "Vehicle type" },
  { key: "seats", header: "Seats", align: "end" },
  {
    key: "remove",
    header: "Remove",
    render: () => (
      <TeButton variant="ghost" size="default">
        Remove vehicle
      </TeButton>
    ),
  },
];

export function TripWizardStep3Vehicles() {
  return (
    <StatePreview>
      <TripWizardFrame
        title="Trip wizard step 3: vehicles"
        stepId="vehicles"
        previousSlug="trip-wizard-step-2-schedule-and-route"
        nextSlug="trip-wizard-step-4-staffing"
      >
        <TeKpiTile
          label="Vehicles on this trip"
          value="0 of 10"
          hint="Growth plan limit per trip"
        />
        <OrgSection title="Vehicles" actions={<TeButton variant="secondary">Add vehicle</TeButton>}>
          <TeDataTable
            columns={COLUMNS}
            rows={VEHICLE_ROWS}
            getRowKey={(row) => row.id}
            caption="Vehicles on this trip"
            emptyTitle="No vehicles yet"
            emptyDescription="Add at least one vehicle to continue."
          />
        </OrgSection>
        <TeCard>
          <p className="te-body">
            The seat layout preview appears after you choose a vehicle type. Each vehicle has one
            vehicle type.
          </p>
        </TeCard>
      </TripWizardFrame>
    </StatePreview>
  );
}
