import { cn } from "@trips-app/ui/lib/utils";

export interface TeMapPoint {
  x: number;
  y: number;
}

export interface TeMapStop extends TeMapPoint {
  id: string;
  label: string;
}

/** Coordinates live in a 0-100 box. Values outside it are clamped so nothing draws off the map. */
export function clampMapCoordinate(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function toPolylinePoints(route: readonly TeMapPoint[]): string {
  return route
    .map((point) => `${clampMapCoordinate(point.x)},${clampMapCoordinate(point.y)}`)
    .join(" ");
}

export interface TeLiveMapProps {
  route: readonly TeMapPoint[];
  busPosition?: TeMapPoint;
  stops?: readonly TeMapStop[];
  /** Accessible name of the map region. */
  ariaLabel: string;
  /** The accessible content of the map: where the bus is and when it arrives. */
  statusText: string;
  className?: string;
}

/** Decorative route map. The SVG is hidden from assistive tech; statusText carries the meaning. */
export function TeLiveMap({
  route,
  busPosition,
  stops = [],
  ariaLabel,
  statusText,
  className,
}: TeLiveMapProps) {
  return (
    <section aria-label={ariaLabel} className={cn("te-live-map", className)}>
      <svg className="te-live-map__svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path className="te-live-map__road" d="M0 25H100M0 75H100M25 0V100M75 0V100" />
        {route.length > 1 ? (
          <polyline className="te-live-map__route" points={toPolylinePoints(route)} />
        ) : null}
        {stops.map((stop) => (
          <circle
            key={stop.id}
            className="te-live-map__stop"
            cx={clampMapCoordinate(stop.x)}
            cy={clampMapCoordinate(stop.y)}
            r={2.5}
          />
        ))}
        {busPosition ? (
          <circle
            className="te-live-map__bus"
            cx={clampMapCoordinate(busPosition.x)}
            cy={clampMapCoordinate(busPosition.y)}
            r={4}
          />
        ) : null}
      </svg>
      <p className="te-live-map__status">{statusText}</p>
      {stops.length > 0 ? (
        <ul className="te-live-map__stops">
          {stops.map((stop) => (
            <li key={stop.id}>{stop.label}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
