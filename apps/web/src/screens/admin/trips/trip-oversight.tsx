import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import {
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminSearch,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface TripRow {
  id: string;
  organization: string;
  trip: string;
  state: "planned" | "in-progress";
  dates: string;
  gaps: string;
}

const TRIP_ROWS: readonly TripRow[] = [
  {
    id: "trip-1",
    organization: "[Organization name]",
    trip: "[Trip reference]",
    state: "planned",
    dates: "[Dates]",
    gaps: "0",
  },
  {
    id: "trip-2",
    organization: "[Organization name]",
    trip: "[Trip reference]",
    state: "in-progress",
    dates: "[Dates]",
    gaps: "0",
  },
];

const STATE_PRESENTATION: Record<TripRow["state"], AdminStatusPresentation> = {
  planned: { tone: "info", icon: "calendar", label: "Planned" },
  "in-progress": { tone: "highlight", icon: "live", label: "In progress" },
};

const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All states" },
  { value: "planned", label: "Planned" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const COLUMNS: readonly TeDataTableColumn<TripRow>[] = [
  { key: "organization", header: "Organization" },
  { key: "trip", header: "Trip" },
  {
    key: "state",
    header: "State",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  { key: "dates", header: "Dates" },
  { key: "gaps", header: "Staffing gaps", align: "end" },
  {
    key: "actions",
    header: "Actions",
    render: (row) => (
      <span className="flex flex-wrap gap-2">
        <TeButton variant="ghost" aria-label={`Open trip ${row.trip}`}>
          Open trip
        </TeButton>
        <TeButton
          variant="secondary"
          disabled={row.state === "in-progress"}
          aria-label={`Cancel trip ${row.trip}`}
        >
          Cancel trip
        </TeButton>
      </span>
    ),
  },
];

export function TripOversight() {
  const [trip, setTrip] = useState("");
  const goTo = useAdminNavigate();

  return (
    <AdminPage>
      <TePageHeader
        title="Trip oversight"
        description="See any trip across organizations and act on it when needed."
      />
      <StatePreview
        emptyTitle="No trips"
        emptyDescription="No trips match these filters."
        loadingLabel="Loading the trips."
      >
        <TeInlineAlert tone="warning" title="Trips in progress">
          A trip in progress cannot be cancelled here. Use incident handling only (D-25).
        </TeInlineAlert>
        <AdminFilters>
          <AdminSearch
            label="Trip or organization"
            placeholder="Trip or organization"
            clearLabel="Clear search"
          />
          <AdminFilterSelect label="State" options={STATE_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Trips">
          <TeDataTable
            columns={COLUMNS}
            rows={TRIP_ROWS}
            getRowKey={(row) => row.id}
            caption="Trip oversight"
            emptyTitle="No trips"
            emptyDescription="No trips match these filters."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
        <AdminPanel title="Cancel trip (decision)">
          <TeInput
            label="Trip reference (required)"
            value={trip}
            onChange={(event) => setTrip(event.target.value)}
            placeholder="[Trip reference]"
          />
          <AdminDecisionForm
            reasonLabel="Reason for cancelling (required)"
            reasonHelp="Recorded in the audit log. Refunds for paid bookings follow the cancellation."
            submitLabel="Cancel trip"
            dialogTitle="Cancel this trip?"
            dialogDescription="Refunds for paid bookings are queued. The cancellation is audited."
            confirmLabel="Cancel trip"
            tone="danger"
            extraValid={trip.trim() !== ""}
            cancel={{ slug: "trip-oversight", label: "Keep trip" }}
            onConfirm={() => goTo("trip-oversight")}
          />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
