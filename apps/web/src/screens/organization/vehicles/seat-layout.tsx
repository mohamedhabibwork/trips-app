// Seat layout of a vehicle type (SCR-ORG-18): two seats, an aisle, two seats per row.
import { t } from "@trips-app/i18n";

import { cn } from "@trips-app/ui/lib/utils";

export interface SeatLayoutCell {
  row: number;
  col: number;
  type: "seat" | "aisle" | "driver" | "moderator" | "door" | "empty";
  seatLabel?: string | null;
}

export interface SeatLayoutConfig {
  rows: number;
  cols: number;
  cells: readonly SeatLayoutCell[];
}

const SEAT_LETTERS = ["A", "B", "C", "D"] as const;
const AISLE_COL = 2;
const COLS = 5;

/** A layout of `seatCount` seats, labelled 1A, 1B, aisle, 1C, 1D, then the next row. */
export function buildSeatLayout(seatCount: number): SeatLayoutConfig {
  const rows = Math.max(1, Math.ceil(seatCount / SEAT_LETTERS.length));
  const cells: SeatLayoutCell[] = [];
  let placed = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (col === AISLE_COL) {
        cells.push({ row, col, type: "aisle" });
        continue;
      }
      const letter = SEAT_LETTERS[col < AISLE_COL ? col : col - 1];
      if (placed < seatCount) {
        cells.push({ row, col, type: "seat", seatLabel: `${row + 1}${letter}` });
        placed += 1;
      } else {
        cells.push({ row, col, type: "empty" });
      }
    }
  }
  return { rows, cols: COLS, cells };
}

/** Seats in a stored layout. */
export function layoutSeatCount(layout: SeatLayoutConfig | null | undefined): number {
  return layout?.cells.filter((cell) => cell.type === "seat").length ?? 0;
}

export function SeatLayoutGrid({ layout }: { layout: SeatLayoutConfig }) {
  const cells = [...layout.cells].sort((a, b) => a.row - b.row || a.col - b.col);
  return (
    <ol
      aria-label={t("screen.organization.vehicles.seatLayout.gridLabel")}
      className="m-0 grid list-none gap-2 p-0"
      style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` }}
    >
      {cells.map((cell) => {
        const isSeat = cell.type === "seat";
        return (
          <li
            key={`${cell.row}-${cell.col}`}
            aria-hidden={isSeat ? undefined : true}
            className={cn(
              "flex h-11 items-center justify-center rounded-lg text-[13px] leading-[18px] font-semibold",
              isSeat
                ? "border border-[var(--te-control-border)] bg-[var(--te-surface-raised)]"
                : "border-0 bg-transparent",
            )}
          >
            {isSeat ? (cell.seatLabel ?? "") : ""}
          </li>
        );
      })}
    </ol>
  );
}
