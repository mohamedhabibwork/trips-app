// Building blocks of the organization pages, drawn from the SCR-ORG artboards
// (docs/design/web/organization): page header, card, KPI tile, badge, alert and buttons.
// The shell draws the chrome; a page only composes these inside it.
import { useId, type ComponentProps, type ReactNode } from "react";

import { Skeleton } from "@trips-app/ui/components/skeleton";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { cn } from "@trips-app/ui/lib/utils";
import { t } from "@trips-app/i18n";

export type OrgTone = "ok" | "warn" | "err" | "info" | "acc" | "neu";

const BADGE_TONE: Record<OrgTone, string> = {
  ok: "bg-[var(--te-success-soft)] text-[var(--te-success)]",
  warn: "bg-[var(--te-warning-soft)] text-[var(--te-warning)]",
  err: "bg-[var(--te-danger-soft)] text-[var(--te-danger)]",
  info: "bg-[var(--te-info-soft)] text-[var(--te-ink)]",
  acc: "bg-[var(--te-accent)] text-[var(--te-brand-navy)]",
  neu: "border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] text-[var(--te-ink-muted)]",
};

/** Icon a status carries by default, so a status is never told by colour alone. */
const TONE_ICON: Partial<Record<OrgTone, TeIconName>> = {
  ok: "check",
  warn: "alert",
  err: "alert",
};

interface OrgBadgeProps {
  tone: OrgTone;
  /** `false` hides the icon; a name overrides the tone's default. */
  icon?: TeIconName | false;
  children: ReactNode;
  className?: string;
}

export function OrgBadge({ tone, icon, children, className }: OrgBadgeProps) {
  const iconName = icon === false ? undefined : (icon ?? TONE_ICON[tone]);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] leading-[18px] font-medium whitespace-nowrap",
        BADGE_TONE[tone],
        className,
      )}
    >
      {iconName ? <TeIcon name={iconName} className="size-4" /> : null}
      {children}
    </span>
  );
}

const ALERT_TONE: Record<Exclude<OrgTone, "acc" | "neu">, string> = {
  ok: "bg-[var(--te-success-soft)] text-[var(--te-success)]",
  warn: "bg-[var(--te-warning-soft)] text-[var(--te-warning)]",
  err: "bg-[var(--te-danger-soft)] text-[var(--te-danger)]",
  info: "bg-[var(--te-info-soft)] text-[var(--te-ink)]",
};

const ALERT_ICON: Record<keyof typeof ALERT_TONE, TeIconName> = {
  ok: "check",
  warn: "alert",
  err: "alert",
  info: "info",
};

interface OrgAlertProps {
  tone: keyof typeof ALERT_TONE;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Errors are announced (`role="alert"`); other tones are a polite status. */
export function OrgAlert({ tone, title, children, className }: OrgAlertProps) {
  return (
    <div
      role={tone === "err" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl px-5 py-4 text-sm leading-5",
        ALERT_TONE[tone],
        className,
      )}
    >
      <TeIcon name={ALERT_ICON[tone]} className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        {title ? <b className="block text-base leading-6 font-semibold">{title}</b> : null}
        {children}
      </div>
    </div>
  );
}

export type OrgButtonVariant = "primary" | "secondary" | "text" | "danger";

const BUTTON_VARIANT: Record<OrgButtonVariant, string> = {
  primary: "bg-[var(--te-primary)] text-[var(--te-on-primary)] px-6",
  secondary:
    "border-[var(--te-control-border)] bg-[var(--te-surface-raised)] text-[var(--te-ink)] px-6",
  text: "bg-transparent text-[var(--te-primary-text)] px-2",
  danger: "border-[var(--te-danger)] bg-[var(--te-surface-raised)] text-[var(--te-danger)] px-6",
};

/** Class list of a button or a link drawn as one (artboard `.btn`). */
export function orgButtonClass(variant: OrgButtonVariant = "primary", className?: string): string {
  return cn(
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-transparent py-3 text-sm leading-5 font-semibold whitespace-nowrap no-underline",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--te-ink)]",
    BUTTON_VARIANT[variant],
    className,
  );
}

interface OrgButtonProps extends ComponentProps<"button"> {
  variant?: OrgButtonVariant;
}

export function OrgButton({
  variant = "primary",
  className,
  type = "button",
  ...props
}: OrgButtonProps) {
  return <button type={type} className={orgButtonClass(variant, className)} {...props} />;
}

interface OrgPageHeaderProps {
  title: ReactNode;
  caption?: ReactNode;
  /** Shown beside the title, e.g. the trip state. */
  badge?: ReactNode;
  actions?: ReactNode;
}

/** h1 and caption on the start side, the page's main action on the end side. */
export function OrgPageHeader({ title, caption, badge, actions }: OrgPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 text-[32px] leading-10 font-bold md:text-[40px] md:leading-[48px]">
            {title}
          </h1>
          {badge}
        </div>
        {caption ? <p className="te-caption m-0 text-[var(--te-ink-muted)]">{caption}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

interface OrgPageProps {
  children: ReactNode;
  className?: string;
}

/** Vertical rhythm of a page body: 24 px between blocks. */
export function OrgPage({ children, className }: OrgPageProps) {
  return <div className={cn("flex flex-col gap-6", className)}>{children}</div>;
}

interface OrgRowProps {
  children: ReactNode;
  /** `start` keeps cards at their own height, like the artboards' two-column rows. */
  align?: "stretch" | "start";
  className?: string;
}

/** Side-by-side cards on desktop, stacked below `lg`. Children size themselves with `flex-*`. */
export function OrgRow({ children, align = "stretch", className }: OrgRowProps) {
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
  "flex min-w-0 flex-col gap-4 rounded-xl border border-[var(--te-hairline)] bg-[var(--te-surface-raised)] p-6 shadow-[var(--te-card-shadow)]";

interface OrgCardProps {
  /** Section heading (h2, 20/28). A titled card is a labelled `<section>`. */
  title?: ReactNode;
  /** Shown on the end side of the heading row. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function OrgCard({ title, actions, children, className }: OrgCardProps) {
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

interface OrgKpiProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  /** `sm` is the 20 px figure the finance artboards use. */
  size?: "md" | "sm";
  className?: string;
}

export function OrgKpi({ label, value, hint, size = "md", className }: OrgKpiProps) {
  return (
    <div className={cn(CARD_CLASS, "flex-1", className)}>
      <span className="text-sm leading-5 font-semibold">{label}</span>
      <b
        className={cn(
          "font-semibold",
          size === "md" ? "text-[28px] leading-9" : "text-xl leading-7",
        )}
      >
        {value}
      </b>
      {hint ? <span className="te-caption -mt-3 text-[var(--te-ink-muted)]">{hint}</span> : null}
    </div>
  );
}

/** A row of KPI tiles: one column on phones, two on tablets, all in a row on desktop. */
export function OrgKpiRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:flex lg:flex-row">{children}</div>;
}

/** Arrow between steps of a flow (trip states, settlement steps); mirrored in RTL. */
export function OrgFlowArrow() {
  return (
    <span aria-hidden="true" className="te-caption text-[var(--te-ink-muted)] rtl:-scale-x-100">
      →
    </span>
  );
}

/** Placeholder while a page's data loads; announced once. */
export function OrgLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" className={CARD_CLASS}>
      <span className="sr-only">{t("screen.trips-enjoy.common.orgUi.loading")}</span>
      <Skeleton className="h-6 w-1/3" />
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
  );
}

interface OrgErrorProps {
  onRetry?: () => void;
  title?: ReactNode;
  children?: ReactNode;
}

/** A failed load: what happened and a way to try again. */
export function OrgError({ onRetry, title, children }: OrgErrorProps) {
  return (
    <OrgAlert tone="err" title={title ?? t("screen.trips-enjoy.common.orgUi.loadFailedTitle")}>
      <span className="block">
        {children ?? t("screen.trips-enjoy.common.orgUi.loadFailedBody")}
      </span>
      {onRetry ? (
        <OrgButton variant="text" className="-ms-2" onClick={onRetry}>
          {t("screen.trips-enjoy.common.orgUi.tryAgain")}
        </OrgButton>
      ) : null}
    </OrgAlert>
  );
}

interface OrgEmptyProps {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}

/** Nothing to show yet, with the next step when there is one. */
export function OrgEmpty({ title, children, action }: OrgEmptyProps) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-[var(--te-control-border)] p-6">
      <b className="text-base leading-6 font-semibold">{title}</b>
      {children ? (
        <p className="m-0 text-sm leading-5 text-[var(--te-ink-muted)]">{children}</p>
      ) : null}
      {action}
    </div>
  );
}

/** Value shown while a number is unknown (signed out, not loaded). */
export const NO_VALUE = "—";
