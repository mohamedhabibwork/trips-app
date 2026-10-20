// Building blocks of the studio pages, drawn from the PhoWeb artboards
// (docs/design/web/PhoWeb*.dc.html): 20px-radius white cards on the cream surface, pill badges,
// KPI tiles, notices and the shared states. The shell draws the chrome; a page composes these.
import { Link } from "@tanstack/react-router";
import { useId, type ComponentProps, type ReactNode } from "react";

import { Skeleton } from "@trips-app/ui/components/skeleton";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { cn } from "@trips-app/ui/lib/utils";
import { t } from "@trips-app/i18n";

export type StudioTone = "ok" | "warn" | "err" | "info" | "live" | "neu";

const BADGE_TONE: Record<StudioTone, string> = {
  ok: "bg-[var(--te-success-soft)] text-[var(--te-success)]",
  warn: "bg-[var(--te-warning-soft)] text-[var(--te-warning)]",
  err: "bg-[var(--te-danger-soft)] text-[var(--te-danger)]",
  info: "bg-[var(--te-info-soft)] text-[var(--te-ink)]",
  live: "bg-[var(--te-chip-soft)] text-[var(--te-primary-text)]",
  neu: "bg-[var(--te-surface)] text-[var(--te-ink-muted)]",
};

/** Icon a status carries by default, so a status is never told by colour alone. */
const TONE_ICON: Partial<Record<StudioTone, TeIconName>> = {
  ok: "check",
  warn: "clock",
  err: "alert",
};

interface StudioBadgeProps {
  tone: StudioTone;
  /** `false` hides the icon; a name overrides the tone's default. */
  icon?: TeIconName | false;
  children: ReactNode;
  className?: string;
}

export function StudioBadge({ tone, icon, children, className }: StudioBadgeProps) {
  const iconName = icon === false ? undefined : (icon ?? TONE_ICON[tone]);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] leading-5 font-semibold whitespace-nowrap",
        BADGE_TONE[tone],
        className,
      )}
    >
      {iconName ? <TeIcon name={iconName} className="size-4" /> : null}
      {children}
    </span>
  );
}

const NOTICE_TONE: Record<Exclude<StudioTone, "live" | "neu">, string> = {
  ok: "bg-[var(--te-success-soft)] text-[var(--te-success)] [&_p]:text-[var(--te-ink)]",
  warn: "bg-[var(--te-warning-soft)] text-[var(--te-warning)]",
  err: "bg-[var(--te-danger-soft)] text-[var(--te-danger)] [&_p]:text-[var(--te-ink)]",
  info: "bg-[var(--te-info-soft)] text-[var(--te-ink)]",
};

const NOTICE_ICON: Record<keyof typeof NOTICE_TONE, TeIconName> = {
  ok: "check",
  warn: "alert",
  err: "alert",
  info: "info",
};

interface StudioNoticeProps {
  tone: keyof typeof NOTICE_TONE;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Errors are announced (`role="alert"`); the other tones are polite statuses. */
export function StudioNotice({ tone, title, children, action, className }: StudioNoticeProps) {
  return (
    <div
      role={tone === "err" ? "alert" : "status"}
      className={cn(
        "flex flex-wrap items-start gap-x-4 gap-y-2 rounded-[var(--te-radius-lg)] px-5 py-4 text-sm leading-5",
        NOTICE_TONE[tone],
        className,
      )}
    >
      <TeIcon name={NOTICE_ICON[tone]} className="mt-0.5 size-5 shrink-0" />
      <span className="min-w-0 flex-1 basis-[420px]">
        {title ? <b className="block text-base leading-6 font-bold">{title}</b> : null}
        {children}
      </span>
      {action}
    </div>
  );
}

export type StudioButtonVariant = "primary" | "secondary" | "text" | "danger" | "navy";

const BUTTON_VARIANT: Record<StudioButtonVariant, string> = {
  primary: "bg-[var(--te-primary)] text-[var(--te-on-primary)] px-5",
  secondary:
    "border-[var(--te-control-border)] bg-[var(--te-surface-raised)] text-[var(--te-ink)] px-5",
  navy: "bg-[var(--te-ink)] text-[var(--te-ink-inverse)] px-5",
  text: "bg-transparent text-[var(--te-primary-text)] px-2",
  danger: "border-[var(--te-danger)] bg-[var(--te-surface-raised)] text-[var(--te-danger)] px-4",
};

/** Class list of a button or a link drawn as one (artboard 48px button). */
export function studioButtonClass(
  variant: StudioButtonVariant = "primary",
  className?: string,
): string {
  return cn(
    "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[var(--te-radius-md)] border border-transparent text-[15px] leading-5 font-bold whitespace-nowrap no-underline",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--te-ink)]",
    BUTTON_VARIANT[variant],
    className,
  );
}

interface StudioButtonProps extends ComponentProps<"button"> {
  variant?: StudioButtonVariant;
}

export function StudioButton({
  variant = "primary",
  className,
  type = "button",
  ...props
}: StudioButtonProps) {
  return <button type={type} className={studioButtonClass(variant, className)} {...props} />;
}

interface StudioLinkButtonProps {
  to: string;
  params?: Record<string, string>;
  children: ReactNode;
  variant?: StudioButtonVariant;
  className?: string;
}

/** Link drawn as a button, for navigation that reads as an action ("Create album"). */
export function StudioLinkButton({
  to,
  params,
  children,
  variant = "primary",
  className,
}: StudioLinkButtonProps) {
  return (
    <Link to={to} params={params} className={studioButtonClass(variant, className)}>
      {children}
    </Link>
  );
}

/** Text link in the studio's brand orange. */
export function StudioLink({
  to,
  params,
  children,
  className,
}: {
  to: string;
  params?: Record<string, string>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      params={params}
      className={cn(
        "font-semibold text-[var(--te-primary-text)] underline-offset-4 hover:underline",
        className,
      )}
    >
      {children}
    </Link>
  );
}

interface StudioPageHeaderProps {
  title: ReactNode;
  caption?: ReactNode;
  /** Shown beside the title, e.g. the album state. */
  badge?: ReactNode;
  actions?: ReactNode;
}

/** h1 and caption on the start side, the page's main actions on the end side. */
export function StudioPageHeader({ title, caption, badge, actions }: StudioPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-4">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] leading-9 font-bold">{title}</h1>
          {badge}
        </div>
        {caption ? (
          <p className="m-0 text-sm leading-5 text-[var(--te-ink-muted)]">{caption}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

interface StudioPageProps {
  children: ReactNode;
  className?: string;
}

/** Vertical rhythm of a page body: 20px between blocks (the artboards' gap). */
export function StudioPage({ children, className }: StudioPageProps) {
  return <div className={cn("flex flex-col gap-5", className)}>{children}</div>;
}

interface StudioRowProps {
  children: ReactNode;
  /** `start` keeps cards at their own height, like the artboards' two-column rows. */
  align?: "stretch" | "start";
  className?: string;
}

/** Side-by-side cards on desktop, stacked below `lg`. Children size themselves with `flex-*`. */
export function StudioRow({ children, align = "stretch", className }: StudioRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 lg:flex-row",
        align === "start" ? "lg:items-start" : "lg:items-stretch",
        className,
      )}
    >
      {children}
    </div>
  );
}

const CARD_CLASS =
  "flex min-w-0 flex-col gap-3 rounded-[var(--te-radius-lg)] bg-[var(--te-surface-raised)] p-5";

interface StudioCardProps {
  /** Section heading (h2). A titled card is a labelled `<section>`. */
  title?: ReactNode;
  /** Shown on the end side of the heading row. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function StudioCard({ title, actions, children, className }: StudioCardProps) {
  const headingId = useId();
  if (!title) return <div className={cn(CARD_CLASS, className)}>{children}</div>;
  return (
    <section aria-labelledby={headingId} className={cn(CARD_CLASS, className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className="m-0 text-xl leading-7 font-semibold">
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

interface StudioKpiProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  hint?: ReactNode;
  /** Optional 0–100 progress bar (plan allowances, booking counters). */
  progressPercent?: number;
  tone?: "ink" | "danger" | "warning";
  href?: string;
  className?: string;
}

/** One clickable KPI tile of the home grid (artboard `{{kpis}}`). */
export function StudioKpi({
  label,
  value,
  unit,
  hint,
  progressPercent,
  tone = "ink",
  href,
  className,
}: StudioKpiProps) {
  const body = (
    <>
      <span className="flex items-center gap-2 text-sm text-[var(--te-ink-muted)]">{label}</span>
      <span className="text-[28px] leading-[34px] font-bold">
        {value}{" "}
        {unit ? (
          <span className="text-[15px] font-medium text-[var(--te-ink-muted)]">{unit}</span>
        ) : null}
      </span>
      {progressPercent === undefined ? null : (
        <span
          role="progressbar"
          aria-label={typeof label === "string" ? label : undefined}
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex h-2 overflow-hidden rounded-full bg-[var(--te-hairline)]"
        >
          <span
            className={cn(
              "rounded-full",
              tone === "danger"
                ? "bg-[var(--te-danger)]"
                : tone === "warning"
                  ? "bg-[var(--te-warning)]"
                  : "bg-[var(--te-ink)]",
            )}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </span>
      )}
      {hint ? (
        <span
          className={cn(
            "text-[13px] leading-[18px]",
            tone === "danger"
              ? "font-semibold text-[var(--te-danger)]"
              : tone === "warning"
                ? "font-semibold text-[var(--te-warning)]"
                : "text-[var(--te-ink-muted)]",
          )}
        >
          {hint}
        </span>
      ) : null}
    </>
  );
  const classes = cn(
    CARD_CLASS,
    "flex-1 basis-[220px] gap-1.5",
    href && "hover:bg-[var(--te-surface)]",
    className,
  );
  if (!href) return <div className={classes}>{body}</div>;
  return (
    <Link to={href} className={cn(classes, "no-underline")}>
      {body}
    </Link>
  );
}

/** A row of KPI tiles: one column on phones, two on tablets, all in a row on desktop. */
export function StudioKpiRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:flex-row">{children}</div>;
}

/** Table primitives matching the artboards: muted 13px head, hairline row separators. */
export const STUDIO_TABLE_HEAD =
  "text-start bg-[var(--te-surface)] px-5 py-2 text-[13px] font-semibold text-[var(--te-ink-muted)]";
export const STUDIO_TABLE_CELL = "px-5 py-2.5 align-middle";

/** Placeholder while a page's data loads; announced once. */
export function StudioLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" className={CARD_CLASS}>
      <span className="sr-only">{t("screen.studio.common.loading")}</span>
      <Skeleton className="h-6 w-1/3" />
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
  );
}

interface StudioErrorProps {
  onRetry?: () => void;
  title?: ReactNode;
  children?: ReactNode;
}

/** A failed load: what happened and a way to try again. */
export function StudioError({ onRetry, title, children }: StudioErrorProps) {
  return (
    <StudioNotice tone="err" title={title ?? t("screen.studio.common.errorTitle")}>
      <span className="block">{children ?? t("screen.studio.common.errorBody")}</span>
      {onRetry ? (
        <StudioButton variant="text" className="-ms-2 min-h-9" onClick={onRetry}>
          {t("screen.studio.common.retry")}
        </StudioButton>
      ) : null}
    </StudioNotice>
  );
}

interface StudioEmptyProps {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}

/** Nothing to show yet, with the next step when there is one. */
export function StudioEmpty({ title, children, action }: StudioEmptyProps) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-[var(--te-radius-md)] bg-[var(--te-surface)] p-8">
      <b className="text-[17px] leading-6 font-semibold">{title}</b>
      {children ? (
        <p className="m-0 max-w-[460px] text-sm leading-5 text-[var(--te-ink-muted)]">{children}</p>
      ) : null}
      {action}
    </div>
  );
}

/** Value shown while a number is unknown (not loaded, no source yet). */
export const NO_VALUE = "—";

/** Segmented control of the artboards' pill group ("This week / October / Last 90 days"). */
export function StudioSegmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex w-fit gap-1 rounded-full border border-[var(--te-hairline)] bg-[var(--te-surface-raised)] p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 cursor-pointer rounded-full px-3.5 text-[13px] font-semibold",
              active
                ? "bg-[var(--te-ink)] text-[var(--te-ink-inverse)]"
                : "bg-transparent text-[var(--te-ink)]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
