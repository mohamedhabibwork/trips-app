import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import {
  TE_SEAT_STATE_LABELS,
  TeSeatMap,
  type TeSeatRow,
  type TeSeatState,
} from "@trips-app/ui/components/te-seat-map";
import { TeTabs, type TeTab } from "@trips-app/ui/components/te-tabs";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink } from "../common/org-link";
import { getActiveWizardTripId, getSelectedVehicleId, OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface SeatListRow {
  id: string;
  label: string;
  state: TeSeatState;
}

const DEFAULT_SEAT_ROWS: readonly TeSeatRow[] = [
  {
    id: "row-1",
    seats: [
      { id: "1A", label: "1A", state: "available" },
      { id: "1B", label: "1B", state: "available" },
      { id: "1C", label: "1C", state: "available" },
      { id: "1D", label: "1D", state: "available" },
    ],
  },
];

const SEAT_LIST_COLUMNS = (): readonly TeDataTableColumn<SeatListRow>[] => [
  { key: "label", header: t("screen.organization.bookings.seatMapAndSeatAssignment.seat") },
  {
    key: "state",
    header: t("screen.organization.bookings.seatMapAndSeatAssignment.state"),
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
  bookingId: string;
  traveler: string;
  program: string;
  action: string;
}

const VIEW_TABS = (): readonly TeTab[] => [
  { id: "map", label: t("screen.organization.bookings.seatMapAndSeatAssignment.map") },
  { id: "list", label: t("screen.organization.bookings.seatMapAndSeatAssignment.list") },
];

function toTeSeatState(status: string): TeSeatState {
  if (status === "reserved" || status === "held") return "taken";
  if (status === "blocked") return "blocked";
  return "available";
}

export function SeatMapAndSeatAssignment() {
  const queryClient = useQueryClient();
  const { status: authStatus } = useAuth();
  const [view, setView] = useState("map");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wizardTripId = getActiveWizardTripId();
  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const effectiveTripId = wizardTripId ?? tripsQuery.data?.items[0]?.id ?? null;
  const selectedVehicleId = getSelectedVehicleId();

  const seatMapQuery = useQuery(
    orpc.seats.getSeatMap.queryOptions({
      input: {
        tripId: effectiveTripId ?? "",
        vehicleId: selectedVehicleId ?? undefined,
      },
      enabled: authStatus === "authenticated" && Boolean(effectiveTripId),
    }),
  );

  const bookingsQuery = useQuery(
    orpc.booking.listOrganizationBookings.queryOptions({
      input: { tripId: effectiveTripId ?? undefined },
      enabled: authStatus === "authenticated" && Boolean(effectiveTripId),
    }),
  );

  const seatRows = useMemo<readonly TeSeatRow[]>(() => {
    if (!seatMapQuery.data?.seats || seatMapQuery.data.seats.length === 0) {
      return DEFAULT_SEAT_ROWS;
    }
    const grouped = new Map<number, SeatListRow[]>();
    for (const s of seatMapQuery.data.seats) {
      const r = grouped.get(s.rowIndex) ?? [];
      r.push({
        id: s.seatLabel,
        label: s.seatLabel,
        state: toTeSeatState(s.status),
      });
      grouped.set(s.rowIndex, r);
    }
    return [...grouped.entries()]
      .sort(([a], [b]) => a - b)
      .map(([rowIdx, seats]) => ({
        id: `row-${rowIdx + 1}`,
        seats,
      }));
  }, [seatMapQuery.data?.seats]);

  const unassignedRows = useMemo<readonly UnassignedRow[]>(() => {
    if (!bookingsQuery.data) return [];
    const unassigned: UnassignedRow[] = [];
    for (const b of bookingsQuery.data) {
      if (b.status === "cancelled" || b.status === "refunded") continue;
      for (let i = 0; i < b.passengers.length; i += 1) {
        const raw = b.passengers[i];
        const p = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as {
          id?: string;
          fullName?: string;
          seatLabel?: string;
        };
        const assignedSeat =
          (typeof p.seatLabel === "string" ? p.seatLabel : undefined) ??
          (typeof b.seatLabels[i] === "string" ? b.seatLabels[i] : undefined);
        if (!assignedSeat) {
          unassigned.push({
            id: `${b.id}-${typeof p.id === "string" ? p.id : i}`,
            bookingId: b.id,
            traveler: typeof p.fullName === "string" ? p.fullName : `Passenger ${i + 1}`,
            program: `${b.selectedProgramIds.length} programs`,
            action: "Assign seat",
          });
        }
      }
    }
    return unassigned;
  }, [bookingsQuery.data]);

  const assignSeatMutation = useMutation(
    orpc.seats.assignSeatByOrganization.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.seats.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.booking.key() });
      },
    }),
  );

  async function handleAssignFirstAvailable(row: UnassignedRow) {
    const effectiveVehicleId = seatMapQuery.data?.vehicleId ?? selectedVehicleId;
    if (authStatus !== "authenticated" || !effectiveTripId || !effectiveVehicleId) return;
    const availableSeat = seatRows.flatMap((r) => r.seats).find((s) => s.state === "available");
    if (!availableSeat) {
      setErrorMsg("No available seats remaining on this vehicle.");
      return;
    }
    setErrorMsg(null);
    try {
      await assignSeatMutation.mutateAsync({
        tripId: effectiveTripId,
        vehicleId: effectiveVehicleId,
        seatLabel: availableSeat.label,
        status: "reserved",
        bookingId: row.bookingId,
        passengerName: row.traveler,
      });
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not assign seat.");
    }
  }

  const unassignedColumns: readonly TeDataTableColumn<UnassignedRow>[] = [
    {
      key: "traveler",
      header: t("screen.organization.bookings.seatMapAndSeatAssignment.traveler"),
    },
    { key: "program", header: t("screen.organization.bookings.seatMapAndSeatAssignment.program") },
    {
      key: "action",
      header: t("screen.organization.bookings.seatMapAndSeatAssignment.action"),
      align: "end",
      render: (row) => (
        <TeButton
          variant="secondary"
          disabled={assignSeatMutation.isPending}
          onClick={() => void handleAssignFirstAvailable(row)}
        >
          {row.action}
        </TeButton>
      ),
    },
  ];

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "booking-detail",
            label: t("screen.organization.bookings.seatMapAndSeatAssignment.backToBooking"),
          }}
        />
        <TePageHeader
          title={t(
            "screen.organization.bookings.seatMapAndSeatAssignment.seatMapAndSeatAssignment",
          )}
          description={t("screen.organization.bookings.seatMapAndSeatAssignment.vehiclePlate")}
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        <TeTabs
          tabs={VIEW_TABS()}
          activeId={view}
          onSelect={setView}
          ariaLabel={t("screen.organization.bookings.seatMapAndSeatAssignment.seatView")}
        />
        {view === "map" ? (
          <TeSeatMap
            rows={seatRows}
            ariaLabel={t("screen.organization.bookings.seatMapAndSeatAssignment.seatMap")}
            stateLabels={TE_SEAT_STATE_LABELS}
          />
        ) : (
          <TeDataTable
            columns={SEAT_LIST_COLUMNS()}
            rows={seatRows.flatMap((row) => row.seats)}
            getRowKey={(seat) => seat.id}
            caption={t("screen.organization.bookings.seatMapAndSeatAssignment.seatsOnThisVehicle")}
            emptyTitle={t("screen.organization.bookings.seatMapAndSeatAssignment.noSeats")}
            emptyDescription={t(
              "screen.organization.bookings.seatMapAndSeatAssignment.thisVehicleTypeHasNo",
            )}
          />
        )}
        <ul
          className="flex flex-wrap gap-3"
          aria-label={t("screen.organization.bookings.seatMapAndSeatAssignment.legend")}
        >
          {LEGEND_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2 te-caption">
              <TeIcon name="seat" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <OrgSection
          title={t("screen.organization.bookings.seatMapAndSeatAssignment.unassignedTravelers")}
        >
          <TeDataTable
            columns={unassignedColumns}
            rows={unassignedRows}
            getRowKey={(row) => row.id}
            caption={t(
              "screen.organization.bookings.seatMapAndSeatAssignment.unassignedTravelersCaption",
            )}
            emptyTitle={t("screen.organization.bookings.seatMapAndSeatAssignment.everyoneHasASeat")}
            emptyDescription={t(
              "screen.organization.bookings.seatMapAndSeatAssignment.allTravelersOnThisVehicle",
            )}
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
