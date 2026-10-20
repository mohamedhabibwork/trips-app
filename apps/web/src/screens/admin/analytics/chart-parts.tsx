// Small SVG-free chart rows shared by the admin analytics pages (SCR-ADM-34..38): a labelled
// progress bar with its value at the end, as the artboards draw them.
import type { ReactNode } from "react";

/** A labelled progress bar, value shown beside it. Percent clamps to 0–100. */
export function BarRow({
  label,
  value,
  percent,
  tone = "ink",
}: {
  label: ReactNode;
  value: ReactNode;
  percent: number;
  tone?: "ink" | "accent";
}): ReactNode {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex flex-col gap-1 text-sm leading-5">
      <span className="flex flex-wrap justify-between gap-2">
        <span>{label}</span>
        <b>{value}</b>
      </span>
      <span className="block h-2 overflow-hidden rounded-full bg-[var(--te-surface)]">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${width}%`,
            background: tone === "accent" ? "var(--te-accent)" : "var(--te-ink)",
          }}
        />
      </span>
    </div>
  );
}
