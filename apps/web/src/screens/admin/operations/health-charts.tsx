// The small SVG charts of SCR-ADM-33 Operations health (docs/design/web/admin/SCR-ADM-33.dc.html):
// a line chart and a bar chart on the artboard's 520x190 grid. Colours come from --te-* tokens
// through currentColor, so light and dark themes follow. Each chart is an image with a text label;
// the card caption carries the values in words.
import type { ReactNode } from "react";

const WIDTH = 520;
const HEIGHT = 190;
const PLOT_START = 40;
const PLOT_END = 510;
const PLOT_TOP = 20;
const PLOT_BOTTOM = 160;
const GRID_LINES = [20, 70, 120, 160] as const;
const LABEL_SIZE = 12;

export interface ChartBar {
  key: string;
  label: string;
  value: number;
}

function yFor(value: number, max: number): number {
  const ratio = max > 0 ? value / max : 0;
  return PLOT_BOTTOM - ratio * (PLOT_BOTTOM - PLOT_TOP);
}

function ChartFrame({ label, max, children }: { label: string; max: number; children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height={HEIGHT}
      role="img"
      aria-label={label}
      style={{ direction: "ltr" }}
      className="block"
    >
      <g className="text-[var(--te-hairline)]" stroke="currentColor" strokeWidth={1}>
        {GRID_LINES.map((y) => (
          <line key={y} x1={PLOT_START} y1={y} x2={PLOT_END} y2={y} />
        ))}
      </g>
      <g className="text-[var(--te-ink-muted)]" fill="currentColor" fontSize={LABEL_SIZE}>
        <text x={0} y={PLOT_TOP + 4}>
          {max}
        </text>
        <text x={0} y={PLOT_BOTTOM + 4}>
          0
        </text>
      </g>
      {children}
    </svg>
  );
}

/** One series over evenly spaced points, left (oldest) to right (newest). */
export function HealthLineChart({ label, points }: { label: string; points: readonly number[] }) {
  const max = Math.max(1, ...points);
  const step = points.length > 1 ? (PLOT_END - PLOT_START) / (points.length - 1) : 0;
  const path = points
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"}${PLOT_START + index * step} ${yFor(value, max)}`,
    )
    .join(" ");
  return (
    <ChartFrame label={label} max={max}>
      <path
        d={path}
        fill="none"
        className="text-[var(--te-primary-text)]"
        stroke="currentColor"
        strokeWidth={2}
      />
    </ChartFrame>
  );
}

/** One bar per category with its name under it. */
export function HealthBarChart({ label, bars }: { label: string; bars: readonly ChartBar[] }) {
  const max = Math.max(1, ...bars.map((bar) => bar.value));
  const slot = bars.length > 0 ? (PLOT_END - PLOT_START) / bars.length : 0;
  const barWidth = Math.min(60, slot * 0.6);
  return (
    <ChartFrame label={label} max={max}>
      {bars.map((bar, index) => {
        const x = PLOT_START + index * slot + (slot - barWidth) / 2;
        const y = yFor(bar.value, max);
        return (
          <g key={bar.key}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={PLOT_BOTTOM - y}
              className="fill-[var(--te-accent)] stroke-[var(--te-ink)]"
              strokeWidth={1}
            />
            <text
              x={x + barWidth / 2}
              y={HEIGHT - 6}
              textAnchor="middle"
              fontSize={LABEL_SIZE}
              className="fill-[var(--te-ink-muted)]"
            >
              {bar.label}
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}
