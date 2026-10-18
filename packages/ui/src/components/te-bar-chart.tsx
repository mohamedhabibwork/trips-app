import { cn } from "@trips-app/ui/lib/utils";
import { t } from "@trips-app/i18n";

export interface TeBarChartDatum {
  label: string;
  value: number;
}

export interface TeBarChartProps {
  data: readonly TeBarChartDatum[];
  /** Formats the value shown above each bar and in the screen reader table. */
  formatValue?: (value: number) => string;
  /** Visible title. Also the accessible name of the chart. */
  caption: string;
  /** Overall height in pixels, labels included. */
  height?: number;
  className?: string;
}

const TE_BAR_CHART_DEFAULT_HEIGHT = 180;
/** Pixels kept free above and below the bars for the value and axis labels. */
const TE_BAR_CHART_LABEL_RESERVE = 48;

/**
 * Pixel heights for bars scaled so the largest value fills maxHeight.
 * Negative and non-finite values draw as zero. Returns zeros when nothing is positive.
 */
export function barHeights(values: readonly number[], maxHeight: number): number[] {
  const safeValues = values.map((value) => (Number.isFinite(value) && value > 0 ? value : 0));
  const peak = Math.max(0, ...safeValues);
  if (peak === 0) return safeValues.map(() => 0);
  return safeValues.map((value) => (value / peak) * maxHeight);
}

/**
 * Column chart drawn with the primary token. The visible labels are hidden from
 * assistive technology; a visually hidden table carries the same data instead.
 */
export function TeBarChart({
  data,
  formatValue = String,
  caption,
  height = TE_BAR_CHART_DEFAULT_HEIGHT,
  className,
}: TeBarChartProps) {
  const trackHeight = Math.max(0, height - TE_BAR_CHART_LABEL_RESERVE);
  const heights = barHeights(
    data.map((datum) => datum.value),
    trackHeight,
  );

  return (
    <figure className={cn("te-bar-chart", className)}>
      <figcaption className="te-bar-chart__caption">{caption}</figcaption>
      <div className="te-bar-chart__plot" aria-hidden="true">
        {data.map((datum, index) => (
          <div key={`${index}-${datum.label}`} className="te-bar-chart__column">
            <span className="te-bar-chart__value">{formatValue(datum.value)}</span>
            <div className="te-bar-chart__track" style={{ blockSize: trackHeight }}>
              <div className="te-bar-chart__bar" style={{ blockSize: heights[index] ?? 0 }} />
            </div>
            <span className="te-bar-chart__label">{datum.label}</span>
          </div>
        ))}
      </div>
      <table className="te-visually-hidden">
        <thead>
          <tr>
            <th scope="col">{t("ui.teBarChart.item")}</th>
            <th scope="col">{t("ui.teBarChart.value")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((datum, index) => (
            <tr key={`${index}-${datum.label}`}>
              <th scope="row">{datum.label}</th>
              <td>{formatValue(datum.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
