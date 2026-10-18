import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, OrgLink, WorkspaceBackLink } from "../common/org-link";
import {
  StateBadge,
  TRIP_STATES,
  TripStateBadge,
  setActiveWizardTripId,
  toTripState,
  type TripState,
} from "../common/org-shared";
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

const COLUMNS = (): readonly TeDataTableColumn<TripRow>[] => [
  {
    key: "name",
    header: t("screen.organization.trips.tripsList.trip"),
    render: (row) => (
      <span
        onClick={() => {
          setActiveWizardTripId(row.id);
        }}
      >
        <OrgLink slug="trip-command-view">{row.name}</OrgLink>
      </span>
    ),
  },
  { key: "dates", header: t("screen.organization.trips.tripsList.dates") },
  { key: "vehicles", header: t("screen.organization.trips.tripsList.vehicles"), align: "end" },
  { key: "seatsSold", header: t("screen.organization.trips.tripsList.seatsSold"), align: "end" },
  {
    key: "staffing",
    header: t("screen.organization.trips.tripsList.staffing"),
    render: (row) =>
      row.staffingGap ? (
        <StateBadge
          tone="warning"
          icon="alert"
          label={t("screen.organization.trips.tripsList.staffingGap")}
        />
      ) : (
        <StateBadge
          tone="success"
          icon="check"
          label={t("screen.organization.trips.tripsList.staffed")}
        />
      ),
  },
  {
    key: "state",
    header: t("screen.organization.trips.tripsList.state"),
    render: (row) => <TripStateBadge state={row.state} />,
  },
];

const STATE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.organization.trips.tripsList.allStates") },
  ...TRIP_STATES.map((state) => ({ value: state, label: state })),
];

export function TripsList() {
  const { status: authStatus } = useAuth();
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");

  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  const rows: readonly TripRow[] =
    tripsQuery.data?.items.map((item) => {
      const start = item.startsAt ? new Date(item.startsAt).toISOString().slice(0, 10) : null;
      const end = item.endsAt ? new Date(item.endsAt).toISOString().slice(0, 10) : null;
      return {
        id: item.id,
        name: item.titleEn || item.titleAr,
        dates: start && end ? `${start} – ${end}` : (start ?? "—"),
        vehicles: String(item.vehicles.length),
        seatsSold: `${item.confirmedSeatsCount} of ${item.totalCapacity || 0}`,
        staffingGap: item.hasStaffingGap,
        state: toTripState(item.state),
      };
    }) ?? [];

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter(
    (row) =>
      (stateFilter === "all" || row.state === stateFilter) &&
      row.name.toLowerCase().includes(normalizedQuery),
  );
  const activeCount = rows.filter(
    (row) => row.state !== "Draft" && row.state !== "Cancelled" && row.state !== "Archived",
  ).length;
  const staffingGapCount = rows.filter((row) => row.staffingGap).length;

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title={t("screen.organization.trips.tripsList.tripsList")}
          actions={
            <OrgButtonLink slug="trip-wizard-step-1-basics">
              {t("screen.organization.trips.tripsList.createTrip")}
            </OrgButtonLink>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile
            label={t("screen.organization.trips.tripsList.activeTripsThisMonth")}
            value={authStatus === "authenticated" ? String(activeCount) : "0"}
            hint={t("screen.organization.trips.tripsList.monthlyLimitPlanLimit")}
          />
          <TeKpiTile
            label={t("screen.organization.trips.tripsList.tripsWithStaffingGaps")}
            value={authStatus === "authenticated" ? String(staffingGapCount) : "0"}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TeSearchField
            label={t("screen.organization.trips.tripsList.searchTrips")}
            value={query}
            onValueChange={setQuery}
            clearLabel={t("screen.organization.trips.tripsList.clearSearch")}
          />
          <TeSelect
            label={t("screen.organization.trips.tripsList.stateLabel")}
            options={STATE_OPTIONS()}
            value={stateFilter}
            onValueChange={setStateFilter}
          />
        </div>
        <TeDataTable
          columns={COLUMNS()}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption={t("screen.organization.trips.tripsList.trips")}
          emptyTitle={t("screen.organization.trips.tripsList.noTripsMatch")}
          emptyDescription={t("screen.organization.trips.tripsList.changeTheSearchOrThe")}
        />
      </div>
    </StatePreview>
  );
}
