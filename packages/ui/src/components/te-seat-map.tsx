import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";

export const TE_SEAT_STATES = [
  "available",
  "selected",
  "held",
  "reserved",
  "checked-in",
  "checked-out",
  "cancelled",
  "taken",
  "blocked",
] as const;
export type TeSeatState = (typeof TE_SEAT_STATES)[number];

export interface TeSeat {
  id: string;
  label: string;
  state: TeSeatState;
}

export interface TeSeatRow {
  id: string;
  seats: readonly TeSeat[];
}

export type TeSeatStateLabels = Record<TeSeatState, string>;

export const TE_SEAT_STATE_LABELS: TeSeatStateLabels = {
  available: "Available",
  selected: "Selected",
  held: "Held",
  reserved: "Reserved",
  "checked-in": "Checked in",
  "checked-out": "Checked out",
  cancelled: "Cancelled",
  taken: "Taken",
  blocked: "Blocked",
};

/** Icons add a second cue beside the colour. Available seats have none. */
const SEAT_STATE_ICON: Record<TeSeatState, TeIconName | undefined> = {
  available: undefined,
  selected: "check",
  held: "clock",
  reserved: "ticket",
  "checked-in": "shield",
  "checked-out": "logout",
  cancelled: "close",
  taken: "user",
  blocked: "lock",
};

/** Available seats can be picked, and a picked seat can be pressed again to undo it. Every other state is disabled. */
export function isSeatSelectable(state: TeSeatState): boolean {
  return state === "available" || state === "selected";
}

/** aria-pressed for seats that work as a selection toggle. Undefined for the rest. */
function seatPressed(state: TeSeatState): boolean | undefined {
  if (state === "selected") return true;
  if (state === "available") return false;
  return undefined;
}

export interface TeSeatMapProps {
  rows: readonly TeSeatRow[];
  onSelect?: (seatId: string) => void;
  /** Accessible name for the seat grid. */
  ariaLabel: string;
  stateLabels?: Partial<TeSeatStateLabels>;
  className?: string;
}

export function TeSeatMap({ rows, onSelect, ariaLabel, stateLabels, className }: TeSeatMapProps) {
  const words: TeSeatStateLabels = { ...TE_SEAT_STATE_LABELS, ...stateLabels };

  return (
    <div className={cn("te-seat-map", className)}>
      <div role="group" aria-label={ariaLabel} className="te-seat-map__grid">
        {rows.map((row) => (
          <div key={row.id} className="te-seat-map__row">
            {row.seats.map((seat) => {
              const icon = SEAT_STATE_ICON[seat.state];
              return (
                <button
                  key={seat.id}
                  type="button"
                  aria-label={`${seat.label}, ${words[seat.state]}`}
                  aria-pressed={seatPressed(seat.state)}
                  disabled={!isSeatSelectable(seat.state)}
                  className={cn("te-seat-map__seat", `te-seat-map__seat--${seat.state}`)}
                  onClick={() => onSelect?.(seat.id)}
                >
                  <span aria-hidden="true">{seat.label}</span>
                  {icon ? <TeIcon name={icon} /> : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <ul className="te-seat-map__legend">
        {TE_SEAT_STATES.map((state) => {
          const icon = SEAT_STATE_ICON[state];
          return (
            <li key={state} className="te-seat-map__legend-item">
              <span
                aria-hidden="true"
                className={cn("te-seat-map__swatch", `te-seat-map__seat--${state}`)}
              />
              {icon ? <TeIcon name={icon} /> : null}
              <span>{words[state]}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
