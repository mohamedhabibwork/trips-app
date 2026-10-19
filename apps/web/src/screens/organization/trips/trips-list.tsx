// SCR-ORG-04 Trips list: every trip with its state and next action.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, OrgLink } from "../common/org-link";
import {
  TRIP_STATES,
  TripStateBadge,
  isoDay,
  toTripState,
  tripStateLabel,
  tripTitle,
  type TripState,
} from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { OrgChips } from "../common/org-form";
import {
  NO_VALUE,
  OrgBadge,
  OrgEmpty,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";

/** The filters the artboard offers, in its order. */
const FILTER_STATES: readonly TripState[] = [
  "Draft",
  "Published",
  "Negotiating",
  "Ready",
  "Filling Up",
  "In Progress",
];

const INACTIVE_STATES: readonly TripState[] = ["Draft", "Cancelled", "Archived", "Completed"];

interface TripRow {
  id: string;
  name: string;
  dates: string;
  vehicles: number;
  seatsSold: number;
  capacity: number;
  staffingGap: boolean;
  state: TripState;
}

function StaffingBadge({ row }: { row: TripRow }) {
  if (row.state === "Draft")
    return <OrgBadge tone="neu">{t("screen.organization.trips.tripsList.notStarted")}</OrgBadge>;
  if (row.staffingGap)
    return <OrgBadge tone="warn">{t("screen.organization.trips.tripsList.staffingGap")}</OrgBadge>;
  return <OrgBadge tone="ok">{t("screen.organization.trips.tripsList.staffed")}</OrgBadge>;
}

function columns(): readonly OrgColumn<TripRow>[] {
  return [
    {
      key: "name",
      header: t("screen.organization.trips.tripsList.trip"),
      render: (row) => (
        <OrgLink
          slug="trip-command-view"
          params={{ tripId: row.id }}
          className="text-[var(--te-ink)]"
        >
          {row.name}
        </OrgLink>
      ),
    },
    {
      key: "state",
      header: t("screen.organization.trips.tripsList.state"),
      render: (row) => <TripStateBadge state={row.state} />,
    },
    {
      key: "dates",
      header: t("screen.organization.trips.tripsList.dates"),
      className: "whitespace-nowrap",
    },
    { key: "vehicles", header: t("screen.organization.trips.tripsList.vehicles") },
    {
      key: "seatsSold",
      header: t("screen.organization.trips.tripsList.seatsSold"),
      render: (row) =>
        t("screen.organization.trips.tripsList.nOfCapacity", {
          n: row.seatsSold,
          capacity: row.capacity,
        }),
    },
    {
      key: "staffing",
      header: t("screen.organization.trips.tripsList.staffing"),
      render: (row) => <StaffingBadge row={row} />,
    },
  ];
}

export function TripsList() {
  const { status: authStatus, locale } = useAuth();
  const [stateFilter, setStateFilter] = useState<string>("all");

  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  const rows: readonly TripRow[] =
    tripsQuery.data?.items.map((item) => {
      const start = isoDay(item.startsAt);
      const end = isoDay(item.endsAt);
      return {
        id: item.id,
        name: tripTitle(item, locale),
        dates:
          start && end
            ? t("screen.organization.trips.tripsList.dateRange", { start, end })
            : (start ?? NO_VALUE),
        vehicles: item.vehicles.length,
        seatsSold: item.confirmedSeatsCount,
        capacity: item.totalCapacity || 0,
        staffingGap: item.hasStaffingGap,
        state: toTripState(item.state),
      };
    }) ?? [];

  const visibleRows = rows.filter((row) => stateFilter === "all" || row.state === stateFilter);
  const loaded = tripsQuery.isSuccess;
  const activeCount = rows.filter((row) => !INACTIVE_STATES.includes(row.state)).length;
  const staffingGapCount = rows.filter((row) => row.staffingGap).length;

  const filterOptions = [
    { value: "all", label: t("screen.organization.trips.tripsList.all") },
    ...FILTER_STATES.filter((state) => TRIP_STATES.includes(state)).map((state) => ({
      value: state,
      label: tripStateLabel(state),
    })),
  ];

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.trips.tripsList.title")}
        caption={t("screen.organization.trips.tripsList.caption")}
        actions={
          <OrgButtonLink slug="trip-wizard-step-1-basics">
            {t("screen.organization.trips.tripsList.createTrip")}
          </OrgButtonLink>
        }
      />
      <OrgKpiRow>
        <OrgKpi
          label={t("screen.organization.trips.tripsList.activeTripsThisMonth")}
          value={loaded ? String(activeCount) : NO_VALUE}
        />
        <OrgKpi
          label={t("screen.organization.trips.tripsList.tripsNeedingStaffing")}
          value={loaded ? String(staffingGapCount) : NO_VALUE}
        />
      </OrgKpiRow>
      <OrgChips
        label={t("screen.organization.trips.tripsList.filterByState")}
        options={filterOptions}
        value={stateFilter}
        onValueChange={setStateFilter}
      />
      {tripsQuery.isError ? (
        <OrgError onRetry={() => void tripsQuery.refetch()} />
      ) : (
        <OrgTable
          columns={columns()}
          rows={visibleRows}
          rowKey={(row) => row.id}
          caption={t("screen.organization.trips.tripsList.title")}
          loading={tripsQuery.isLoading}
          empty={
            <OrgEmpty
              title={
                rows.length === 0
                  ? t("screen.organization.trips.tripsList.emptyTitle")
                  : t("screen.organization.trips.tripsList.noMatchTitle")
              }
              action={
                rows.length === 0 ? (
                  <OrgButtonLink slug="trip-wizard-step-1-basics" variant="secondary">
                    {t("screen.organization.trips.tripsList.createTrip")}
                  </OrgButtonLink>
                ) : undefined
              }
            >
              {rows.length === 0
                ? t("screen.organization.trips.tripsList.emptyBody")
                : t("screen.organization.trips.tripsList.noMatchBody")}
            </OrgEmpty>
          }
        />
      )}
    </OrgPage>
  );
}
