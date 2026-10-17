import { useState } from "react";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";

import { OrgButtonLink, OrgLink, WorkspaceBackLink } from "../common/org-link";
import { StateBadge, TRIP_STATES, TripStateBadge, type TripState } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface TripRow {
  id: string;
  name: string;
  dates: string;
  vehicles: string;
  seatsSold: string;
  staffingGap: boolean;
  state: TripState;
}

const TRIP_ROWS: readonly TripRow[] = [
  {
    id: "trip-1",
    name: "[Trip name]",
    dates: "[Dates]",
    vehicles: "0",
    seatsSold: "0 of [capacity]",
    staffingGap: true,
    state: "Published",
  },
  {
    id: "trip-2",
    name: "[Trip name]",
    dates: "[Dates]",
    vehicles: "0",
    seatsSold: "0 of [capacity]",
    staffingGap: false,
    state: "Draft",
  },
];

const COLUMNS: readonly TeDataTableColumn<TripRow>[] = [
  {
    key: "name",
    header: "Trip",
    render: (row) => <OrgLink slug="trip-command-view">{row.name}</OrgLink>,
  },
  { key: "dates", header: "Dates" },
  { key: "vehicles", header: "Vehicles", align: "end" },
  { key: "seatsSold", header: "Seats sold", align: "end" },
  {
    key: "staffing",
    header: "Staffing",
    render: (row) =>
      row.staffingGap ? (
        <StateBadge tone="warning" icon="alert" label="Staffing gap" />
      ) : (
        <StateBadge tone="success" icon="check" label="Staffed" />
      ),
  },
  { key: "state", header: "State", render: (row) => <TripStateBadge state={row.state} /> },
];

const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All states" },
  ...TRIP_STATES.map((state) => ({ value: state, label: state })),
];

export function TripsList() {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = TRIP_ROWS.filter(
    (row) =>
      (stateFilter === "all" || row.state === stateFilter) &&
      row.name.toLowerCase().includes(normalizedQuery),
  );

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title="Trips list"
          actions={<OrgButtonLink slug="trip-wizard-step-1-basics">Create trip</OrgButtonLink>}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile label="Active trips this month" value="0" hint="Monthly limit: [plan limit]" />
          <TeKpiTile label="Trips with staffing gaps" value="0" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TeSearchField
            label="Search trips"
            value={query}
            onValueChange={setQuery}
            clearLabel="Clear search"
          />
          <TeSelect
            label="State"
            options={STATE_OPTIONS}
            value={stateFilter}
            onValueChange={setStateFilter}
          />
        </div>
        <TeDataTable
          columns={COLUMNS}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption="Trips"
          emptyTitle="No trips match"
          emptyDescription="Change the search or the state filter."
        />
      </div>
    </StatePreview>
  );
}
