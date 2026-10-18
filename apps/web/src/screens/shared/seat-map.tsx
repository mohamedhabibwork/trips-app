// The seat map from SCR-SHR-15: a legend, then the vehicle's rows front to back with an aisle down
// the middle. Available seats can be picked; held seats show their timer; taken seats are muted.
import { cn } from "@trips-app/ui/lib/utils";

import { useAuth } from "@/auth/auth-context";

export type SeatState = "available" | "selected" | "held" | "taken";

export interface SeatView {
  label: string;
  rowIndex: number;
  colIndex: number;
  state: Exclude<SeatState, "selected">;
  /** Minutes left on a hold. */
  holdMinutes?: number;
}

const SEAT_STYLE: Record<SeatState, string> = {
  available:
    "cursor-pointer border-[1.5px] border-[var(--te-control-border)] bg-[var(--te-surface-raised)] text-[var(--te-ink)]",
  selected: "cursor-pointer border-0 bg-[var(--te-primary)] font-bold text-[var(--te-on-primary)]",
  held: "border border-[var(--te-warning)] bg-[var(--te-warning-soft)] text-[var(--te-warning)]",
  taken: "border-0 bg-[var(--te-hairline)] text-[var(--te-ink-muted)]",
};

const LEGEND_SWATCH: Record<SeatState, string> = {
  available: "border-[1.5px] border-[var(--te-control-border)]",
  selected: "bg-[var(--te-primary)]",
  held: "border border-[var(--te-warning)] bg-[var(--te-warning-soft)]",
  taken: "bg-[var(--te-hairline)]",
};

const LEGEND_ORDER: readonly SeatState[] = ["available", "selected", "held", "taken"];

interface SeatMapProps {
  seats: readonly SeatView[];
  /** Seats per row; the aisle sits after the first half. */
  columns: number;
  selected: string | null;
  onSelect: (label: string) => void;
  disabled?: boolean;
}

export function SeatMapLegend() {
  const { t } = useAuth();
  return (
    <ul
      aria-label={t("screen.shared.seatMap.legend")}
      className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-1.5 p-0 text-xs leading-4"
    >
      {LEGEND_ORDER.map((state) => (
        <li key={state} className="flex items-center gap-1.5">
          <span className={cn("size-3.5 rounded", LEGEND_SWATCH[state])} />
          {t(`screen.shared.seatMap.state.${state}`)}
        </li>
      ))}
    </ul>
  );
}

export function SeatMap({ seats, columns, selected, onSelect, disabled = false }: SeatMapProps) {
  const { t } = useAuth();
  const aisleAfter = Math.ceil(columns / 2);
  const rows = new Map<number, SeatView[]>();
  for (const seat of seats) {
    rows.set(seat.rowIndex, [...(rows.get(seat.rowIndex) ?? []), seat]);
  }
  const orderedRows = [...rows.entries()].sort(([a], [b]) => a - b);

  function seatLabel(seat: SeatView, state: SeatState): string {
    if (state === "held") {
      return t("screen.shared.seatMap.seatHeld", {
        seat: seat.label,
        minutes: seat.holdMinutes ?? 0,
      });
    }
    return t(`screen.shared.seatMap.seat.${state}`, { seat: seat.label });
  }

  return (
    <div
      dir="ltr"
      className="flex flex-col gap-2.5 rounded-[var(--te-radius-lg)] bg-[var(--te-surface-raised)] p-4 shadow-[var(--te-card-shadow)]"
    >
      <div className="flex justify-center text-xs font-semibold text-[var(--te-ink-muted)]">
        {t("screen.shared.seatMap.front")}
      </div>
      {orderedRows.map(([rowIndex, rowSeats]) => (
        <div key={rowIndex} className="flex items-center justify-center gap-2">
          {[...rowSeats]
            .sort((a, b) => a.colIndex - b.colIndex)
            .flatMap((seat, index) => {
              const state: SeatState = seat.label === selected ? "selected" : seat.state;
              const pickable = !disabled && (seat.state === "available" || state === "selected");
              const button = (
                <button
                  key={seat.label}
                  type="button"
                  disabled={!pickable}
                  aria-pressed={state === "selected"}
                  aria-label={seatLabel(seat, state)}
                  onClick={() => onSelect(seat.label)}
                  className={cn(
                    "h-12 w-14 rounded-[var(--te-radius-sm)] text-sm font-semibold disabled:cursor-default",
                    SEAT_STYLE[state],
                  )}
                >
                  {seat.label}
                </button>
              );
              return index === aisleAfter - 1 && index < rowSeats.length - 1
                ? [button, <span key={`${seat.label}-aisle`} className="w-6" />]
                : [button];
            })}
        </div>
      ))}
    </div>
  );
}
