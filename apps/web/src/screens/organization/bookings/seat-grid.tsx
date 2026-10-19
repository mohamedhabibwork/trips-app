// Seat grid of SCR-ORG-25: seats in rows with an aisle in the middle, front of the vehicle at the top.
// Every seat is a button with its label and state word, so a state is never told by colour alone.
import { t } from "@trips-app/i18n";
import { cn } from "@trips-app/ui/lib/utils";

export type GridSeatState = "available" | "held" | "reserved" | "blocked";

export interface GridSeat {
  label: string;
  rowIndex: number;
  colIndex: number;
  state: GridSeatState;
  bookingId: string | null;
  passengerName: string | null;
}

export function toGridSeatState(status: string): GridSeatState {
  if (status === "held" || status === "reserved" || status === "blocked") return status;
  return "available";
}

export function seatStateLabel(state: GridSeatState): string {
  switch (state) {
    case "held":
      return t("screen.organization.bookings.seatGrid.held");
    case "reserved":
      return t("screen.organization.bookings.seatGrid.reserved");
    case "blocked":
      return t("screen.organization.bookings.seatGrid.blocked");
    default:
      return t("screen.organization.bookings.seatGrid.available");
  }
}

const STATE_CLASS: Record<GridSeatState, string> = {
  available: "border-[var(--te-control-border)] bg-[var(--te-surface-raised)]",
  held: "border-transparent bg-[var(--te-warning-soft)]",
  reserved: "border-transparent bg-[var(--te-info-soft)]",
  blocked: "border-dashed border-[var(--te-control-border)] bg-[var(--te-surface)]",
};

interface SeatGridProps {
  seats: readonly GridSeat[];
  cols: number;
  /** The seat picked as the target, and the reserved seat picked to move from. */
  targetLabel: string | null;
  moveFromLabel: string | null;
  onPick: (seat: GridSeat) => void;
  label: string;
}

export function SeatGrid({
  seats,
  cols,
  targetLabel,
  moveFromLabel,
  onPick,
  label,
}: SeatGridProps) {
  const columnCount = Math.max(1, cols, ...seats.map((seat) => seat.colIndex + 1));
  const aisleAfter = Math.ceil(columnCount / 2);
  const rowCount = Math.max(0, ...seats.map((seat) => seat.rowIndex + 1));
  const template = `repeat(${aisleAfter}, minmax(0, 88px)) 24px repeat(${columnCount - aisleAfter}, minmax(0, 88px))`;

  const cells = [];
  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < columnCount; col += 1) {
      if (col === aisleAfter) cells.push(<span key={`aisle-${row}`} aria-hidden="true" />);
      const seat = seats.find((item) => item.rowIndex === row && item.colIndex === col);
      if (!seat) {
        cells.push(<span key={`empty-${row}-${col}`} aria-hidden="true" />);
        continue;
      }
      const picked = seat.label === targetLabel || seat.label === moveFromLabel;
      const pickable = seat.state === "available" || seat.state === "reserved";
      cells.push(
        <button
          key={seat.label}
          type="button"
          aria-pressed={pickable ? picked : undefined}
          disabled={!pickable}
          aria-label={t("screen.organization.bookings.seatGrid.seatAria", {
            label: seat.label,
            state: seatStateLabel(seat.state),
          })}
          onClick={() => onPick(seat)}
          className={cn(
            "flex min-h-14 min-w-0 flex-col items-center justify-center rounded-lg border-2 px-1 py-2 text-center",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--te-ink)]",
            "disabled:cursor-not-allowed",
            STATE_CLASS[seat.state],
            picked && "border-solid border-[var(--te-primary)]",
          )}
        >
          <b className="text-sm leading-5">{seat.label}</b>
          <span className="truncate text-[11px] leading-4 text-[var(--te-ink-muted)]">
            {picked
              ? t("screen.organization.bookings.seatGrid.picked")
              : seatStateLabel(seat.state)}
          </span>
        </button>,
      );
    }
  }

  return (
    <div
      role="group"
      aria-label={label}
      className="grid justify-center gap-2"
      style={{ gridTemplateColumns: template }}
    >
      {cells}
    </div>
  );
}

const LEGEND: readonly GridSeatState[] = ["available", "held", "reserved", "blocked"];

export function SeatLegend() {
  return (
    <ul
      aria-label={t("screen.organization.bookings.seatGrid.legend")}
      className="te-caption m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0 text-[var(--te-ink-muted)]"
    >
      {LEGEND.map((state) => (
        <li key={state} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("inline-block size-4 rounded border-2", STATE_CLASS[state])}
          />
          {seatStateLabel(state)}
        </li>
      ))}
    </ul>
  );
}
