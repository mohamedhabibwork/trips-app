// SCR-TRV-04 Booking step 2: seat selection on the live seat map (SCR-SHR-15) with the 15-minute
// hold (BRL-08). Explorer/VIP keep their priority window (FR-SEAT-03); organization-assigned
// trips show the notice instead of a picker (FR-SEAT-01).
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice } from "@/components/kit/controls";
import { pathFor } from "@/navigation/web-routes";
import { serverQueryOptions, serverRpc } from "@/utils/server-rpc";
import { client, orpc } from "@/utils/orpc";
import { SeatMap, SeatMapLegend, type SeatView } from "@/screens/shared/seat-map";
import { holdSecondsLeft, seatPriorityState } from "@/surfaces/traveler/booking-wizard";
import { usePlanTier } from "@/surfaces/traveler/plan-tier";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS } from "@/surfaces/traveler/util";

export function Trv04BookingSeats({ tripId: tripIdProp }: { tripId?: string } = {}) {
  const { t } = useAuth();
  const routeParams = useParams({ strict: false });
  const tripId = tripIdProp ?? routeParams.tripId ?? "";
  const search = useSearch({ from: "/traveler/book/$tripId/seats" });
  const navigate = useNavigate();
  const planTier = usePlanTier();

  const [selectedSeats, setSelectedSeats] = useState<string[]>(
    (search.seats ?? "").split(",").filter(Boolean),
  );
  const [holdError, setHoldError] = useState<string | null>(null);
  const [holding, setHolding] = useState(false);

  const tripQuery = useQuery(
    serverQueryOptions(orpc.trips.getPublicTripDetail, "trips/getPublicTripDetail", {
      input: { tripId },
    }),
  );
  const seatsQuery = useQuery(
    serverQueryOptions(orpc.seats.getSeatMap, "seats/getSeatMap", { input: { tripId } }),
  );

  if (tripQuery.isPending || seatsQuery.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (tripQuery.isError || seatsQuery.isError) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenError onRetry={() => void seatsQuery.refetch()} />
      </div>
    );
  }
  const trip = tripQuery.data.trip;
  const map = seatsQuery.data;
  if (!trip || !map) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenNotFound />
      </div>
    );
  }

  const priority = seatPriorityState({
    startsAt: trip.startsAt,
    priorityWindowHours: trip.seatPriorityWindowHours,
    planTier,
  });

  const seats: SeatView[] = map.seats.map((seat) => ({
    label: seat.seatLabel,
    rowIndex: seat.rowIndex,
    colIndex: seat.colIndex,
    state: seat.status === "available" ? "available" : "taken",
    holdMinutes:
      seat.status === "held" && seat.holdExpiresAt
        ? Math.max(1, Math.ceil(holdSecondsLeft(seat.holdExpiresAt) / 60))
        : undefined,
  }));

  function toggleSeat(label: string) {
    setHoldError(null);
    setSelectedSeats((current) =>
      current.includes(label) ? current.filter((seat) => seat !== label) : [...current, label],
    );
  }

  async function holdAndContinue() {
    if (selectedSeats.length === 0) return;
    setHolding(true);
    setHoldError(null);
    try {
      const hold = await serverRpc<Awaited<ReturnType<typeof client.seats.holdSeats>>>(
        "seats/holdSeats",
        {
          tripId,
          vehicleId: map.vehicleId,
          seatLabels: selectedSeats,
        },
      );
      const search2 = {
        travelers: search.travelers,
        programs: search.programs,
        vehicle: map.vehicleId,
        seats: selectedSeats.join(","),
        holdUntil: String(hold.holdExpiresAt.getTime()),
      };
      void navigate({ to: pathFor("SCR-TRV-05", { tripId }), search: search2 });
    } catch {
      setHoldError(t("screen.traveler.wizard.seatHoldFailed"));
    } finally {
      setHolding(false);
    }
  }

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <p className="m-0 text-sm font-semibold text-[var(--te-ink-muted)]">
        {t("screen.traveler.wizard.step", { step: 2, of: 4 })}
      </p>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.wizard.title2")}</h1>

      {trip.seatAssignmentMode !== "traveler_choice" ? (
        <>
          <Notice tone="info" strong>
            {t("screen.traveler.wizard.orgAssignedSeats")}
          </Notice>
          <Button
            onClick={() =>
              void navigate({
                to: pathFor("SCR-TRV-05", { tripId }),
                search: {
                  travelers: search.travelers,
                  programs: search.programs,
                  vehicle: undefined,
                  seats: undefined,
                  holdUntil: undefined,
                },
              })
            }
          >
            {t("screen.traveler.common.continue")}
          </Button>
        </>
      ) : (
        <>
          {priority === "priority" ? (
            <Notice tone="warning" strong>
              {t("screen.traveler.wizard.priorityWindowLocked")}
            </Notice>
          ) : null}
          <div className="flex flex-col gap-4">
            <SeatMapLegend />
            <SeatMap
              seats={seats}
              columns={map.cols || 4}
              selected={null}
              selectedLabels={selectedSeats}
              onSelect={toggleSeat}
              disabled={priority === "priority"}
            />
          </div>
          <p className="m-0 text-sm">
            {selectedSeats.length > 0
              ? t("screen.traveler.wizard.selectedSeats", { seats: selectedSeats.join(", ") })
              : t("screen.traveler.wizard.noSeatsSelected")}
          </p>
          {holdError ? <Notice tone="danger">{holdError}</Notice> : null}
          <Button
            block
            onClick={() => void holdAndContinue()}
            disabled={holding || selectedSeats.length === 0 || priority === "priority"}
          >
            {holding
              ? t("screen.traveler.wizard.holding")
              : t("screen.traveler.wizard.holdAndContinue")}
          </Button>
          <Notice tone="info">{t("screen.traveler.wizard.holdNote")}</Notice>
        </>
      )}
    </div>
  );
}
