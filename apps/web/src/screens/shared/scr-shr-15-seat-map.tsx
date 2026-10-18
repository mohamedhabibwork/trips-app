import { useMemo, useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import {
  TE_SEAT_STATE_LABELS,
  TeSeatMap,
  type TeSeat,
  type TeSeatRow,
} from "@trips-app/ui/components/te-seat-map";
import { t } from "@trips-app/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { goBack } from "./screen-actions";
import { StateLoading, StatePreview } from "./state-preview";

const DEFAULT_SEAT_ROWS: readonly TeSeatRow[] = [
  {
    id: "row-1",
    seats: [
      { id: "1A", label: "1A", state: "available" },
      { id: "1B", label: "1B", state: "taken" },
      { id: "1C", label: "1C", state: "available" },
      { id: "1D", label: "1D", state: "blocked" },
    ],
  },
  {
    id: "row-2",
    seats: [
      { id: "2A", label: "2A", state: "available" },
      { id: "2B", label: "2B", state: "available" },
      { id: "2C", label: "2C", state: "taken" },
      { id: "2D", label: "2D", state: "available" },
    ],
  },
];

function markSelected(seat: TeSeat, selectedId: string | undefined): TeSeat {
  if (seat.state === "available" && seat.id === selectedId) {
    return { ...seat, state: "selected" };
  }
  return seat;
}

function SeatMapView() {
  const queryClient = useQueryClient();
  const tripsQuery = useQuery(orpc.trips.browsePublicTrips.queryOptions({ input: {} }));
  const firstTrip = tripsQuery.data?.items?.[0];
  const tripId = firstTrip?.id ?? null;

  const seatMapQuery = useQuery({
    ...orpc.seats.getSeatMap.queryOptions({ input: { tripId: tripId! } }),
    enabled: Boolean(tripId),
  });
  const seatMap = seatMapQuery.data;
  const vehicleId = seatMap?.vehicleId ?? null;

  const holdSeatsMutation = useMutation(
    orpc.seats.holdSeats.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.seats.key() });
      },
    }),
  );

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const baseRows: readonly TeSeatRow[] = useMemo(() => {
    if (!seatMap?.seats?.length) return DEFAULT_SEAT_ROWS;
    const grouped = new Map<number, TeSeat[]>();
    for (const s of seatMap.seats) {
      const list = grouped.get(s.rowIndex) ?? [];
      list.push({
        id: s.seatLabel,
        label: s.seatLabel,
        state:
          s.status === "reserved"
            ? "taken"
            : s.status === "held" || s.status === "blocked"
              ? "blocked"
              : "available",
      });
      grouped.set(s.rowIndex, list);
    }
    return Array.from(grouped.entries()).map(([rowNum, rowSeats]) => ({
      id: `row-${rowNum}`,
      seats: rowSeats,
    }));
  }, [seatMap]);

  const handleConfirmSeat = async () => {
    if (!selectedId || !tripId || !vehicleId) return;
    try {
      await holdSeatsMutation.mutateAsync({
        tripId,
        vehicleId,
        seatLabels: [selectedId],
      });
    } catch {
      // Ignore error when unauthenticated in preview
    }
  };

  const rows: readonly TeSeatRow[] = baseRows.map((row) => ({
    ...row,
    seats: row.seats.map((seat) => markSelected(seat, selectedId)),
  }));
  const seats = baseRows.flatMap((row) => row.seats);

  return (
    <div className="flex flex-col gap-6">
      <TeSeatMap
        rows={rows}
        onSelect={setSelectedId}
        ariaLabel={t("screen.shared.scrShr15SeatMap.vehicleSeatMap")}
      />
      <section aria-labelledby="seat-list-heading" className="flex flex-col gap-2">
        <h2 id="seat-list-heading" className="te-h3">
          {t("screen.shared.scrShr15SeatMap.seatsAsAList")}
        </h2>
        <ul className="flex flex-col gap-1">
          {seats.map((seat) => (
            <li key={seat.id} className="te-body">
              {t("screen.shared.scrShr15SeatMap.seat")} {seat.label}:{" "}
              {TE_SEAT_STATE_LABELS[seat.state]}
            </li>
          ))}
        </ul>
      </section>
      <p className="te-body" aria-live="polite">
        {t("screen.shared.scrShr15SeatMap.selectedSeat")} {selectedId ?? "none"}
      </p>
      <div>
        <TeButton
          variant="primary"
          size="lg"
          disabled={selectedId === undefined}
          onClick={() => void handleConfirmSeat()}
        >
          {t("screen.shared.scrShr15SeatMap.confirmSeat")}
        </TeButton>
      </div>
    </div>
  );
}

/** Seats of one vehicle. A traveler selects a seat; screen readers get the same information as a list. */
export function ScrShr15SeatMap() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <TePageHeader
        title={t("screen.shared.scrShr15SeatMap.seatMap")}
        description={t("screen.shared.scrShr15SeatMap.selectAnAvailableSeatSeat")}
        actions={
          <TeButton variant="ghost" onClick={goBack}>
            {t("screen.shared.scrShr15SeatMap.back")}
          </TeButton>
        }
      />
      <StatePreview
        main={<SeatMapView />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title={t("screen.shared.scrShr15SeatMap.seatTaken")}>
            {t("screen.shared.scrShr15SeatMap.thisSeatWasTakenWhile")}
          </TeInlineAlert>
        }
      />
    </div>
  );
}
