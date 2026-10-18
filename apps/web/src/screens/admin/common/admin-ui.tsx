// Building blocks of the admin console pages (docs/design/web/admin, SCR-ADM-01..33). Every
// artboard is made of the same parts: a page header, white cards, a filter bar, a table in a card,
// label/value rows, status badges, KPI cards and alerts. The admin shell draws the sidebar and the
// top bar, so nothing here draws chrome. Colours come from --te-* tokens, so light, dark and RTL
// follow the theme.
import type { ReactNode } from "react";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { cn } from "@trips-app/ui/lib/utils";

export interface AdminPageProps {
  title: string;
  description?: ReactNode;
  /** Buttons or links on the end side of the header. */
  actions?: ReactNode;
  children?: ReactNode;
}

/** Page body: title block with its actions, then the sections 24px apart. */
export function AdminPage({ title, description, actions, children }: AdminPageProps) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 md:gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="te-h1 text-[32px] leading-[40px] md:text-[40px] md:leading-[48px]">
            {title}
          </h1>
          {description ? <p className="te-body text-[var(--te-ink-muted)]">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-end gap-3">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

const CARD_CLASS =
  "flex min-w-0 flex-col gap-3 rounded-[var(--te-radius-lg)] border border-[var(--te-hairline)] bg-[var(--te-surface-raised)] p-6 text-[var(--te-ink)] shadow-[var(--te-card-shadow)]";

export interface AdminCardProps {
  /** Card heading (20px, semibold). */
  title?: ReactNode;
  /** Small muted line under the heading. */
  caption?: ReactNode;
  /** Section landmark name, when the title is not a string. */
  label?: string;
  className?: string;
  children?: ReactNode;
}

export function AdminCard({ title, caption, label, className, children }: AdminCardProps) {
  return (
    <section
      aria-label={label ?? (typeof title === "string" ? title : undefined)}
      className={cn(CARD_CLASS, className)}
    >
      {title ? <h2 className="te-h3">{title}</h2> : null}
      {caption ? <p className="te-caption">{caption}</p> : null}
      {children}
    </section>
  );
}

/** The two-to-one grid used by detail and decision pages. Stacks below `lg`. */
export function AdminSplit({ main, side }: { main: ReactNode; side: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-6">{main}</div>
      <div className="flex min-w-0 flex-col gap-6">{side}</div>
    </div>
  );
}

const GRID_COLUMNS: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function AdminGrid({ columns, children }: { columns: 2 | 3 | 4; children: ReactNode }) {
  return <div className={cn("grid grid-cols-1 gap-6", GRID_COLUMNS[columns])}>{children}</div>;
}

/** The filter bar: one white card with the fields in a row. Wraps at phone width. */
export function AdminFilterBar({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section
      aria-label={label}
      className={cn(
        CARD_CLASS,
        "grid grid-cols-1 items-end gap-4 px-6 py-4 sm:grid-cols-2 lg:flex lg:flex-row lg:[&>*]:flex-1",
      )}
    >
      {children}
    </section>
  );
}

export interface AdminKpiProps {
  label: string;
  value: ReactNode;
  caption?: ReactNode;
  /** A link under the caption, such as "Open applications". */
  action?: ReactNode;
}

export function AdminKpi({ label, value, caption, action }: AdminKpiProps) {
  return (
    <div className={CARD_CLASS}>
      <span className="te-label text-[var(--te-ink-muted)]">{label}</span>
      <span className="text-[32px] leading-10 font-bold">{value}</span>
      {caption ? <span className="te-caption">{caption}</span> : null}
      {action}
    </div>
  );
}

/** One label/value line with a hairline under it (`te-row` in the artboards). */
export function AdminRow({
  label,
  children,
  last = false,
  strong = false,
}: {
  label: ReactNode;
  children?: ReactNode;
  last?: boolean;
  /** Label in body ink rather than muted (document and check lists). */
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5",
        !last && "border-b border-[var(--te-hairline)]",
      )}
    >
      <span className={strong ? "te-body" : "te-body text-[var(--te-ink-muted)]"}>{label}</span>
      <span className="te-label min-w-0 text-end">{children}</span>
    </div>
  );
}

export type AdminTone = "ok" | "warn" | "bad" | "info" | "accent" | "neutral";

const BADGE_TONE: Record<AdminTone, string> = {
  ok: "bg-[var(--te-success-soft)] text-[var(--te-success)]",
  warn: "bg-[var(--te-warning-soft)] text-[var(--te-warning)]",
  bad: "bg-[var(--te-danger-soft)] text-[var(--te-danger)]",
  info: "bg-[var(--te-info-soft)] text-[var(--te-ink)]",
  accent: "bg-[var(--te-accent)] text-[var(--te-brand-navy)]",
  neutral: "bg-[var(--te-hairline)] text-[var(--te-ink)]",
};

/** Default icon per tone, as drawn in the artboards. Status is never colour alone. */
const TONE_ICON: Partial<Record<AdminTone, TeIconName>> = {
  ok: "check",
  warn: "alert",
  bad: "close",
};

export function AdminBadge({
  tone = "info",
  icon,
  className,
  children,
}: {
  tone?: AdminTone;
  /** `false` hides the icon; a name overrides the tone default. */
  icon?: TeIconName | false;
  className?: string;
  children: ReactNode;
}) {
  const iconName = icon === false ? undefined : (icon ?? TONE_ICON[tone]);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-0.5 text-[13px] leading-[18px] font-medium whitespace-nowrap",
        BADGE_TONE[tone],
        className,
      )}
    >
      {iconName ? <TeIcon name={iconName} className="size-4" /> : null}
      {children}
    </span>
  );
}

export type AdminAlertTone = "info" | "warning" | "danger" | "success";

const ALERT_TONE: Record<AdminAlertTone, { className: string; icon: TeIconName }> = {
  info: { className: "bg-[var(--te-info-soft)]", icon: "info" },
  warning: { className: "bg-[var(--te-warning-soft)]", icon: "alert" },
  danger: { className: "bg-[var(--te-danger-soft)]", icon: "alert" },
  success: { className: "bg-[var(--te-success-soft)]", icon: "check" },
};

export function AdminAlert({
  tone = "info",
  title,
  action,
  children,
}: {
  tone?: AdminAlertTone;
  title?: ReactNode;
  /** A button on the end side, such as Retry. */
  action?: ReactNode;
  children?: ReactNode;
}) {
  const style = ALERT_TONE[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex flex-wrap items-start gap-3 rounded-[var(--te-radius-md)] p-4 text-[var(--te-ink)]",
        style.className,
      )}
    >
      <TeIcon name={style.icon} className="mt-1 size-4" />
      <div className="flex min-w-0 flex-1 flex-col">
        {title ? <span className="te-label">{title}</span> : null}
        {children ? <div className={title ? "te-caption" : "te-body"}>{children}</div> : null}
      </div>
      {action}
    </div>
  );
}

export interface AdminColumn<Row> {
  key: string;
  header: ReactNode;
  render: (row: Row) => ReactNode;
  /** Numbers line up on the end side. */
  align?: "start" | "end";
  /** Long text (names, reasons) may wrap; other cells stay on one line. */
  wrap?: boolean;
  /** A long header over a narrow column (a count) may wrap onto two lines. */
  headerWrap?: boolean;
}

export interface AdminTableProps<Row> {
  /** Accessible name of the table. */
  caption: string;
  /** Visible heading inside the card, above the table. */
  title?: ReactNode;
  /** Controls on the end side of the heading (tabs, a link). */
  toolbar?: ReactNode;
  columns: readonly AdminColumn<Row>[];
  rows: readonly Row[];
  getRowKey: (row: Row) => string;
  /** Shown in place of the body when there are no rows. */
  empty?: ReactNode;
  footer?: ReactNode;
}

/** A table inside a card. The card scrolls sideways at phone width; the page never does. */
export function AdminTable<Row>({
  caption,
  title,
  toolbar,
  columns,
  rows,
  getRowKey,
  empty,
  footer,
}: AdminTableProps<Row>) {
  const hasHeading = Boolean(title || toolbar);
  return (
    <section aria-label={caption} className={cn(CARD_CLASS, "gap-0 overflow-hidden p-0")}>
      {hasHeading ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-4">
          {title ? <h2 className="te-h3">{title}</h2> : <span />}
          {toolbar}
        </div>
      ) : null}
      <div className={cn("overflow-x-auto", hasHeading && "mt-3")}>
        <table className="w-full min-w-[40rem] border-collapse text-sm leading-5 text-[var(--te-ink)]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "border-b border-[var(--te-hairline)] p-3 text-[13px] leading-[18px] font-semibold text-[var(--te-ink-muted)] first:ps-6 last:pe-6",
                    column.headerWrap ? "min-w-[5rem]" : "whitespace-nowrap",
                    column.align === "end" ? "text-end" : "text-start",
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "border-b border-[var(--te-hairline)] p-3 align-middle first:ps-6 last:pe-6",
                      column.wrap ? "min-w-[9.5rem]" : "whitespace-nowrap",
                      column.align === "end" && "text-end",
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && empty ? <div className="p-6">{empty}</div> : null}
      {footer ? <div className="px-6 py-4">{footer}</div> : null}
    </section>
  );
}

/** Plain lines of copy, as in the "Effect" cards of decision pages. */
export function AdminLines({ lines }: { lines: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {lines.map((line) => (
        <li key={line} className="te-body">
          {line}
        </li>
      ))}
    </ul>
  );
}
