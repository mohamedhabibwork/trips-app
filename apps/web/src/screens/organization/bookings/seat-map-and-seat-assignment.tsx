// SCR-ORG-25 Seat map: the vehicle's seats, travelers still without a seat, assign and move.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";
import { cn } from "@trips-app/ui/lib/utils";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { OrgTabs } from "../common/org-form";
import { useOrgParams } from "../common/org-link";
import { getSelectedTripId, getSelectedVehicleId, tripTitle } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { toBookingRecords } from "./booking-parts";
import { SeatGrid, SeatLegend, seatStateLabel, toGridSeatState, type GridSeat } from "./seat-grid";

const LIVE_REFRESH_MS = 15_000;

interface WaitingTraveler {
  id: string;
  bookingId: string;
  name: string;
  programs: string;
}

function seatColumns(): readonly OrgColumn<GridSeat>[] {
  return [
    {
      key: "label",
      header: t("screen.organization.bookings.seatMapAndSeatAssignment.seat"),
      render: (row) => <b>{row.label}</b>,
    },
    {
      key: "state",
      header: t("screen.organization.bookings.seatMapAndSeatAssignment.state"),
      render: (row) => seatStateLabel(row.state),
    },
    {
      key: "passengerName",
      header: t("screen.organization.bookings.seatMapAndSeatAssignment.traveler"),
      render: (row) => row.passengerName || NO_VALUE,
    },
  ];
}

export function SeatMapAndSeatAssignment() {
  const queryClient = useQueryClient();
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const { tripId: routeTripId } = useOrgParams();
  const [view, setView] = useState("map");
  const [travelerId, setTravelerId] = useState<string | null>(null);
  const [targetLabel, setTargetLabel] = useState<string | null>(null);
  const [moveFromLabel, setMoveFromLabel] = useState<string | null>(null);
  const [assignFailed, setAssignFailed] = useState(false);

  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
      input: {},
    }),
    enabled,
  });
  const trips = tripsQuery.data?.items ?? [];
  const tripId = routeTripId ?? getSelectedTripId() ?? trips[0]?.id ?? null;
  const trip = trips.find((item) => item.id === tripId);
  const selectedVehicleId = getSelectedVehicleId();

  const seatMapQuery = useQuery({
    ...serverQueryOptions(orpc.seats.getSeatMap, "seats/getSeatMap", {
      input: { tripId: tripId ?? "", vehicleId: selectedVehicleId ?? undefined },
    }),
    enabled: enabled && Boolean(tripId),
    refetchInterval: LIVE_REFRESH_MS,
  });
  const bookingsQuery = useQuery({
    ...serverQueryOptions(
      orpc.booking.listOrganizationBookings,
      "booking/listOrganizationBookings",
      {
        input: { tripId: tripId ?? undefined },
      },
    ),
    enabled: enabled && Boolean(tripId),
  });
  const programsQuery = useQuery({
    ...serverQueryOptions(orpc.programs.listTripPrograms, "programs/listTripPrograms", {
      input: { tripId: tripId ?? "" },
    }),
    enabled: enabled && Boolean(tripId),
  });

  const seatMap = seatMapQuery.data;
  const vehicleId = seatMap?.vehicleId ?? selectedVehicleId;
  const plate =
    trip?.vehicles.find((vehicle) => vehicle.vehicleId === vehicleId)?.plateNumber ?? NO_VALUE;
  const seats: readonly GridSeat[] = (seatMap?.seats ?? []).map((seat) => ({
    label: seat.seatLabel,
    rowIndex: seat.rowIndex,
    colIndex: seat.colIndex,
    state: toGridSeatState(seat.status),
    bookingId: seat.bookingId,
    passengerName: seat.passengerName,
  }));

  const programs = programsQuery.data?.items ?? [];
  const waiting: WaitingTraveler[] = [];
  for (const booking of toBookingRecords(bookingsQuery.data)) {
    if (booking.status === "cancelled" || booking.status === "refunded") continue;
    const seated = seats.filter((seat) => seat.bookingId === booking.id);
    const programNames =
      booking.selectedProgramIds
        .map((id) => programs.find((program) => program.id === id))
        .map((program) => (program ? tripTitle(program, locale) : ""))
        .filter(Boolean)
        .join(", ") || t("screen.organization.bookings.seatMapAndSeatAssignment.none");
    booking.passengers.forEach((passenger, index) => {
      const name = passenger.fullName || NO_VALUE;
      const hasSeat =
        Boolean(passenger.seatLabel || booking.seatLabels[index]) ||
        seated.some((seat) => seat.passengerName === passenger.fullName);
      if (hasSeat) return;
      waiting.push({
        id: `${booking.id}-${passenger.id ?? index}`,
        bookingId: booking.id,
        name,
        programs: programNames,
      });
    });
  }

  const traveler = waiting.find((item) => item.id === travelerId);
  const target = seats.find((seat) => seat.label === targetLabel && seat.state === "available");
  const moveFrom = seats.find((seat) => seat.label === moveFromLabel && seat.state === "reserved");

  const assignSeatMutation = useMutation(
    serverMutationOptions(orpc.seats.assignSeatByOrganization, "seats/assignSeatByOrganization", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.seats.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.booking.key() });
      },
    }),
  );
  const busy = assignSeatMutation.isPending;

  function pickSeat(seat: GridSeat) {
    if (seat.state === "reserved") {
      setMoveFromLabel((current) => (current === seat.label ? null : seat.label));
      return;
    }
    setTargetLabel((current) => (current === seat.label ? null : seat.label));
  }

  async function handleAssign() {
    if (!tripId || !vehicleId || !traveler || !target) return;
    setAssignFailed(false);
    try {
      await assignSeatMutation.mutateAsync({
        tripId,
        vehicleId,
        seatLabel: target.label,
        status: "reserved",
        bookingId: traveler.bookingId,
        passengerName: traveler.name,
      });
      setTravelerId(null);
      setTargetLabel(null);
    } catch {
      setAssignFailed(true);
    }
  }

  async function handleMove() {
    if (!tripId || !vehicleId || !moveFrom || !target) return;
    setAssignFailed(false);
    try {
      await assignSeatMutation.mutateAsync({
        tripId,
        vehicleId,
        seatLabel: target.label,
        status: "reserved",
        bookingId: moveFrom.bookingId,
        passengerName: moveFrom.passengerName,
      });
      await assignSeatMutation.mutateAsync({
        tripId,
        vehicleId,
        seatLabel: moveFrom.label,
        status: "available",
        bookingId: null,
        passengerName: null,
      });
      setMoveFromLabel(null);
      setTargetLabel(null);
    } catch {
      setAssignFailed(true);
    }
  }

  const mode =
    seatMap?.seatAssignmentMode === "traveler_choice"
      ? t("screen.organization.bookings.seatMapAndSeatAssignment.travelerChoice")
      : seatMap
        ? t("screen.organization.bookings.seatMapAndSeatAssignment.organizationAssigned")
        : NO_VALUE;
  const viewTabs = [
    { id: "map", label: t("screen.organization.bookings.seatMapAndSeatAssignment.map") },
    { id: "list", label: t("screen.organization.bookings.seatMapAndSeatAssignment.list") },
  ];

  return (
    <OrgPage className="gap-5">
      <OrgPageHeader
        title={t("screen.organization.bookings.seatMapAndSeatAssignment.title")}
        caption={t("screen.organization.bookings.seatMapAndSeatAssignment.caption", {
          trip: trip ? tripTitle(trip, locale) || NO_VALUE : NO_VALUE,
          mode,
        })}
      />
      <OrgTabs
        label={t("screen.organization.bookings.seatMapAndSeatAssignment.seatViews")}
        tabs={viewTabs}
        activeId={view}
        onSelect={setView}
      />
      {seatMapQuery.isError ? <OrgError onRetry={() => void seatMapQuery.refetch()} /> : null}
      {assignFailed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.bookings.seatMapAndSeatAssignment.assignFailed")}
        />
      ) : null}
      <OrgRow align="start">
        <OrgCard
          title={t("screen.organization.bookings.seatMapAndSeatAssignment.vehicleFrontAtTop", {
            plate,
          })}
          className="lg:flex-[3]"
        >
          {seatMapQuery.isLoading ? <OrgLoading /> : null}
          {!seatMapQuery.isLoading && seats.length === 0 ? (
            <OrgEmpty title={t("screen.organization.bookings.seatMapAndSeatAssignment.noSeats")}>
              {t("screen.organization.bookings.seatMapAndSeatAssignment.noSeatsBody")}
            </OrgEmpty>
          ) : null}
          {seats.length > 0 && view === "map" ? (
            <>
              <SeatGrid
                seats={seats}
                cols={seatMap?.cols ?? 0}
                targetLabel={target?.label ?? null}
                moveFromLabel={moveFrom?.label ?? null}
                onPick={pickSeat}
                label={t("screen.organization.bookings.seatMapAndSeatAssignment.seatMap")}
              />
              <SeatLegend />
            </>
          ) : null}
          {seats.length > 0 && view === "list" ? (
            <OrgTable
              columns={seatColumns()}
              rows={seats}
              rowKey={(row) => row.label}
              caption={t("screen.organization.bookings.seatMapAndSeatAssignment.seatMap")}
            />
          ) : null}
        </OrgCard>
        <OrgCard
          title={t("screen.organization.bookings.seatMapAndSeatAssignment.unassignedTravelers")}
          className="lg:flex-[2]"
        >
          {bookingsQuery.isLoading ? <OrgLoading /> : null}
          {!bookingsQuery.isLoading && waiting.length === 0 ? (
            <OrgEmpty
              title={t("screen.organization.bookings.seatMapAndSeatAssignment.everyoneHasASeat")}
            />
          ) : null}
          {waiting.map((item) => {
            const selected = item.id === travelerId;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setTravelerId(selected ? null : item.id)}
                className={cn(
                  "flex min-h-11 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-start",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--te-ink)]",
                  selected
                    ? "border-[var(--te-primary)] bg-[var(--te-info-soft)]"
                    : "border-[var(--te-hairline)] bg-[var(--te-surface-raised)]",
                )}
              >
                <span className="min-w-0">
                  <b className="block text-sm leading-5">{item.name}</b>
                  <span className="te-caption text-[var(--te-ink-muted)]">
                    {t("screen.organization.bookings.seatMapAndSeatAssignment.programLine", {
                      programs: item.programs,
                    })}
                  </span>
                </span>
                {selected ? (
                  <OrgBadge tone="info">
                    {t("screen.organization.bookings.seatMapAndSeatAssignment.selected")}
                  </OrgBadge>
                ) : (
                  <OrgBadge tone="neu">
                    {t("screen.organization.bookings.seatMapAndSeatAssignment.waiting")}
                  </OrgBadge>
                )}
              </button>
            );
          })}
          <div className="mt-2 flex flex-wrap gap-3">
            <OrgButton disabled={!traveler || !target || busy} onClick={() => void handleAssign()}>
              {t("screen.organization.bookings.seatMapAndSeatAssignment.assignToSeat", {
                label: target?.label ?? NO_VALUE,
              })}
            </OrgButton>
            <OrgButton
              variant="secondary"
              disabled={!moveFrom || !target || busy}
              onClick={() => void handleMove()}
            >
              {t("screen.organization.bookings.seatMapAndSeatAssignment.moveSeat")}
            </OrgButton>
          </div>
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t("screen.organization.bookings.seatMapAndSeatAssignment.lockedRule")}{" "}
            {t("screen.organization.bookings.seatMapAndSeatAssignment.moveHint")}
          </p>
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
