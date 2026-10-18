// Data table of the organization artboards: cream header row, hairline rules, rounded box.
// On narrow screens the table scrolls sideways inside its box instead of widening the page.
import type { ReactNode } from "react";

import { cn } from "@trips-app/ui/lib/utils";

import { OrgEmpty, OrgLoading } from "./org-ui";

export interface OrgColumn<T> {
  key: string;
  header: ReactNode;
  /** Defaults to `String(row[key])`. */
  render?: (row: T) => ReactNode;
  align?: "start" | "end";
  /** Visually hidden header (an action column), still read by screen readers. */
  hiddenHeader?: boolean;
  className?: string;
}

interface OrgTableProps<T> {
  columns: readonly OrgColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  /** Accessible name of the table and its scroll region. */
  caption: string;
  loading?: boolean;
  /** Shown instead of the table when there are no rows. */
  empty?: ReactNode;
  /** Highlights a row, e.g. the selected one. */
  rowClassName?: (row: T) => string | undefined;
  className?: string;
}

function cellValue<T>(row: T, key: string): ReactNode {
  const value = (row as Record<string, unknown>)[key];
  return value === null || value === undefined ? "" : String(value);
}

export function OrgTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  loading = false,
  empty,
  rowClassName,
  className,
}: OrgTableProps<T>) {
  if (loading) return <OrgLoading />;
  if (rows.length === 0 && empty) {
    return typeof empty === "string" ? <OrgEmpty title={empty} /> : <>{empty}</>;
  }
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className={cn(
        "max-w-full overflow-x-auto rounded-xl border border-[var(--te-hairline)] bg-[var(--te-surface-raised)]",
        className,
      )}
    >
      <table className="w-full border-separate border-spacing-0 text-sm leading-5">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "border-b border-[var(--te-hairline)] bg-[var(--te-surface)] px-4 py-3 text-[13px] leading-[18px] font-semibold whitespace-nowrap text-[var(--te-ink-muted)]",
                  column.align === "end" ? "text-end" : "text-start",
                )}
              >
                {column.hiddenHeader ? (
                  <span className="sr-only">{column.header}</span>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className={cn("group", rowClassName?.(row))}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "border-b border-[var(--te-hairline)] px-4 py-3 align-middle group-last:border-b-0",
                    column.align === "end" ? "text-end" : "text-start",
                    column.className,
                  )}
                >
                  {column.render ? column.render(row) : cellValue(row, column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
