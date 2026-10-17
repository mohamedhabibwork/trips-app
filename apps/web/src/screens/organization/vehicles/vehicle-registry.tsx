import { useState } from "react";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";

import { OrgButtonLink, OrgLink, WorkspaceBackLink } from "../common/org-link";
import { StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface VehicleRow {
  id: string;
  plate: string;
  model: string;
  year: string;
  vehicleType: string;
  seats: string;
  registration: string;
}

const VEHICLE_ROWS: readonly VehicleRow[] = [
  {
    id: "vehicle-1",
    plate: "[Plate]",
    model: "[Model]",
    year: "[Year]",
    vehicleType: "[Vehicle type]",
    seats: "0",
    registration: "[Registration status]",
  },
];

const COLUMNS: readonly TeDataTableColumn<VehicleRow>[] = [
  {
    key: "plate",
    header: "Plate",
    render: (row) => <OrgLink slug="vehicle-editor">{row.plate}</OrgLink>,
  },
  { key: "model", header: "Model" },
  { key: "year", header: "Year" },
  { key: "vehicleType", header: "Vehicle type" },
  { key: "seats", header: "Seats", align: "end" },
  {
    key: "registration",
    header: "Registration",
    render: (row) => <StateBadge tone="neutral" icon="file" label={row.registration} />,
  },
];

const FILTER_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All vehicle types" },
  { value: "[Vehicle type]", label: "[Vehicle type]" },
];

export function VehicleRegistry() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = VEHICLE_ROWS.filter(
    (row) =>
      (typeFilter === "all" || row.vehicleType === typeFilter) &&
      row.plate.toLowerCase().includes(normalizedQuery),
  );

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title="Vehicle registry"
          actions={
            <div className="flex flex-wrap gap-3">
              <OrgButtonLink slug="vehicle-types-and-seat-layout" variant="secondary">
                Vehicle types
              </OrgButtonLink>
              <OrgButtonLink slug="vehicle-editor">Add vehicle</OrgButtonLink>
            </div>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeSearchField
            label="Search by plate"
            value={query}
            onValueChange={setQuery}
            clearLabel="Clear search"
          />
          <TeSelect
            label="Vehicle type"
            options={FILTER_OPTIONS}
            value={typeFilter}
            onValueChange={setTypeFilter}
          />
        </div>
        <TeDataTable
          columns={COLUMNS}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption="Vehicles"
          emptyTitle="No vehicles yet"
          emptyDescription="Add a vehicle to use it on trips."
        />
      </div>
    </StatePreview>
  );
}
