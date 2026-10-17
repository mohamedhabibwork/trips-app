import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import {
  TE_SEAT_STATE_LABELS,
  TeSeatMap,
  type TeSeatRow,
  type TeSeatState,
} from "@trips-app/ui/components/te-seat-map";
import { TeTabs, type TeTab } from "@trips-app/ui/components/te-tabs";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface SeatListRow {
  id: string;
  label: string;
  state: TeSeatState;
}

const SEAT_ROWS: readonly TeSeatRow[] = [
  {
    id: "row-1",
    seats: [
      { id: "1A", label: "1A", state: "taken" },
      { id: "1B", label: "1B", state: "available" },
      { id: "1C", label: "1C", state: "available" },
      { id: "1D", label: "1D", state: "blocked" },
    ],
  },
  {
    id: "row-2",
    seats: [
      { id: "2A", label: "2A", state: "available" },
      { id: "2B", label: "2B", state: "taken" },
      { id: "2C", label: "2C", state: "available" },
      { id: "2D", label: "2D", state: "available" },
    ],
  },
];

const SEAT_LIST_COLUMNS: readonly TeDataTableColumn<SeatListRow>[] = [
  { key: "label", header: "Seat" },
  {
    key: "state",
    header: "State",
    render: (row) => TE_SEAT_STATE_LABELS[row.state],
  },
];

const LEGEND_ITEMS: readonly string[] = [
  "Available",
  "Held",
  "Reserved",
  "Checked in",
  "Checked out",
  "Cancelled",
];

interface UnassignedRow {
  id: string;
  traveler: string;
  program: string;
  action: string;
}

const UNASSIGNED_ROWS: readonly UnassignedRow[] = [
  {
    id: "unassigned-1",
    traveler: "[Traveler name]",
    program: "[Program name]",
    action: "Assign seat",
  },
];

const UNASSIGNED_COLUMNS: readonly TeDataTableColumn<UnassignedRow>[] = [
  { key: "traveler", header: "Traveler" },
  { key: "program", header: "Program" },
  {
    key: "action",
    header: "Action",
    align: "end",
    render: (row) => <TeButton variant="secondary">{row.action}</TeButton>,
  },
];

const VIEW_TABS: readonly TeTab[] = [
  { id: "map", label: "Map" },
  { id: "list", label: "List" },
];

export function SeatMapAndSeatAssignment() {
  const [view, setView] = useState("map");

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "booking-detail", label: "Back to booking" }} />
        <TePageHeader title="Seat map and seat assignment" description="[Vehicle plate]" />
        <TeTabs tabs={VIEW_TABS} activeId={view} onSelect={setView} ariaLabel="Seat view" />
        {view === "map" ? (
          <TeSeatMap rows={SEAT_ROWS} ariaLabel="Seat map" stateLabels={TE_SEAT_STATE_LABELS} />
        ) : (
          <TeDataTable
            columns={SEAT_LIST_COLUMNS}
            rows={SEAT_ROWS.flatMap((row) => row.seats)}
            getRowKey={(seat) => seat.id}
            caption="Seats on this vehicle"
            emptyTitle="No seats"
            emptyDescription="This vehicle type has no seats."
          />
        )}
        <ul className="flex flex-wrap gap-3" aria-label="Legend">
          {LEGEND_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2 te-caption">
              <TeIcon name="seat" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <OrgSection title="Unassigned travelers">
          <TeDataTable
            columns={UNASSIGNED_COLUMNS}
            rows={UNASSIGNED_ROWS}
            getRowKey={(row) => row.id}
            caption="Unassigned travelers"
            emptyTitle="Everyone has a seat"
            emptyDescription="All travelers on this vehicle are assigned."
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
