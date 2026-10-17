import { cn } from "@trips-app/ui/lib/utils";
import { TeEmptyState } from "@trips-app/ui/components/te-empty-state";
import type { ReactNode } from "react";

export interface TeDataTableColumn<T> {
  key: string;
  header: string;
  /** Custom cell content. Without it the cell shows row[key] when that is text or a number. */
  render?: (row: T) => ReactNode;
  align?: "start" | "end";
}

export interface TeDataTableProps<T> {
  columns: readonly TeDataTableColumn<T>[];
  rows: readonly T[];
  getRowKey: (row: T) => string;
  /** Visible caption. Also names the horizontal scroll region. */
  caption: string;
  emptyTitle: string;
  emptyDescription?: string;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
}

/** Reads a text or numeric field by key. Any other value renders as an empty cell. */
export function readCellValue<T>(row: T, key: string): string {
  if (typeof row !== "object" || row === null || !(key in row)) return "";
  const value: unknown = Reflect.get(row, key);
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function TeDataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  emptyTitle,
  emptyDescription,
  loading = false,
  loadingLabel = "Loading",
  className,
}: TeDataTableProps<T>) {
  const isEmpty = rows.length === 0;

  return (
    <div className={cn("te-data-table", className)}>
      <div role="region" aria-label={caption} tabIndex={0} className="te-data-table__scroll">
        <table className="te-data-table__table" aria-busy={loading || undefined}>
          <caption className="te-data-table__caption">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "te-data-table__head",
                    column.align === "end" && "te-data-table__cell--end",
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="te-data-table__status" colSpan={columns.length}>
                  <p role="status" className="te-data-table__loading">
                    {loadingLabel}
                  </p>
                </td>
              </tr>
            ) : null}
            {!loading && isEmpty ? (
              <tr>
                <td className="te-data-table__status" colSpan={columns.length}>
                  <TeEmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : null}
            {!loading
              ? rows.map((row) => (
                  <tr key={getRowKey(row)}>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(column.align === "end" && "te-data-table__cell--end")}
                      >
                        {column.render ? column.render(row) : readCellValue(row, column.key)}
                      </td>
                    ))}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
