import { useState } from "react";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TeLiveMap } from "@trips-app/ui/components/te-live-map";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { TeTimeline, type TeTimelineItem } from "@trips-app/ui/components/te-timeline";
import { TeTrackingStatus } from "@trips-app/ui/components/te-tracking-status";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface OccupancyRow {
  id: string;
  vehicle: string;
  checkedIn: string;
  seats: string;
  occupancy: string;
}

const OCCUPANCY_ROWS: readonly OccupancyRow[] = [
  {
    id: "vehicle-1",
    vehicle: "[Vehicle plate]",
    checkedIn: "0",
    seats: "[Seat count]",
    occupancy: "0%",
  },
];

const OCCUPANCY_COLUMNS: readonly TeDataTableColumn<OccupancyRow>[] = [
  { key: "vehicle", header: "Vehicle" },
  { key: "checkedIn", header: "Checked in", align: "end" },
  { key: "seats", header: "Seats", align: "end" },
  { key: "occupancy", header: "Occupancy", align: "end" },
];

const INCIDENT_ITEMS: readonly TeTimelineItem[] = [
  { id: "incident-1", time: "[Time]", label: "[Incident summary]", state: "done" },
];

export function LiveOperations() {
  const [travelerQuery, setTravelerQuery] = useState("");

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "trip-command-view", label: "Back to trip" }} />
        <TePageHeader title="Live operations" description="[Trip name]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TeKpiTile label="Trip status" value="In Progress" />
          <TeKpiTile label="Travelers checked in" value="0" />
          <TeKpiTile label="Vehicles on the road" value="0" />
        </div>
        <OrgSection title="Live map">
          <TeLiveMap
            route={[]}
            ariaLabel="Live vehicle positions"
            statusText="[Vehicle position and arrival time]"
          />
          <TeTrackingStatus status="on-time" />
        </OrgSection>
        <OrgSection title="Occupancy per vehicle">
          <TeDataTable
            columns={OCCUPANCY_COLUMNS}
            rows={OCCUPANCY_ROWS}
            getRowKey={(row) => row.id}
            caption="Occupancy per vehicle"
            emptyTitle="No vehicles in progress"
            emptyDescription="Occupancy appears when a trip is in progress."
          />
        </OrgSection>
        <OrgSection title="Traveler lookup">
          <TeSearchField
            label="Find a traveler"
            value={travelerQuery}
            onValueChange={setTravelerQuery}
            clearLabel="Clear search"
          />
          <p className="te-caption">The lookup shows the traveler's vehicle only.</p>
        </OrgSection>
        <OrgSection title="Incident feed">
          <TeTimeline items={INCIDENT_ITEMS} ariaLabel="Incident feed" />
        </OrgSection>
        <OrgSection title="Related">
          <ul className="flex flex-wrap gap-2">
            <li>
              <OrgButtonLink slug="trip-report-review" variant="secondary">
                Trip report review
              </OrgButtonLink>
            </li>
            <li>
              <OrgButtonLink slug="bookings-and-travelers" variant="secondary">
                Bookings and travelers
              </OrgButtonLink>
            </li>
            <li>
              <OrgButtonLink slug="child-safety-reports" variant="secondary">
                Child-safety reports
              </OrgButtonLink>
            </li>
          </ul>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
