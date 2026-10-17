import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import {
  TE_SEAT_STATE_LABELS,
  TeSeatMap,
  type TeSeat,
  type TeSeatRow,
} from "@trips-app/ui/components/te-seat-map";
import { goBack } from "./screen-actions";
import { StateLoading, StatePreview } from "./state-preview";

// Layout placeholder. The real layout comes from the vehicle type.
const SEAT_ROWS: readonly TeSeatRow[] = [
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
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const rows: readonly TeSeatRow[] = SEAT_ROWS.map((row) => ({
    ...row,
    seats: row.seats.map((seat) => markSelected(seat, selectedId)),
  }));
  const seats = SEAT_ROWS.flatMap((row) => row.seats);

  return (
    <div className="flex flex-col gap-6">
      <TeSeatMap rows={rows} onSelect={setSelectedId} ariaLabel="Vehicle seat map" />
      <section aria-labelledby="seat-list-heading" className="flex flex-col gap-2">
        <h2 id="seat-list-heading" className="te-h3">
          Seats as a list
        </h2>
        <ul className="flex flex-col gap-1">
          {seats.map((seat) => (
            <li key={seat.id} className="te-body">
              Seat {seat.label}: {TE_SEAT_STATE_LABELS[seat.state]}
            </li>
          ))}
        </ul>
      </section>
      <p className="te-body" aria-live="polite">
        Selected seat: {selectedId ?? "none"}
      </p>
      <div>
        <TeButton variant="primary" size="lg" disabled={selectedId === undefined}>
          Confirm seat
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
        title="Seat map"
        description="Select an available seat. Seat states are shown as words and icons."
        actions={
          <TeButton variant="ghost" onClick={goBack}>
            Back
          </TeButton>
        }
      />
      <StatePreview
        main={<SeatMapView />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title="Seat taken">
            This seat was taken while you were choosing. Choose another seat.
          </TeInlineAlert>
        }
      />
    </div>
  );
}
