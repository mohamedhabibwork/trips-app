// Page layouts from the public and shared artboards (docs/design/web/public-shared). The shell
// draws the header; these lay out what sits under it.
import type { ReactNode } from "react";

import { cn } from "@trips-app/ui/lib/utils";

interface PageMainProps {
  children: ReactNode;
  /** `narrow` caps the column at 960px (appeal form); `wide` uses the 1280px frame. */
  width?: "wide" | "narrow";
  className?: string;
}

/** Desktop pages: 40px top and 48px side padding at 1280px, 16px gutters on a phone. */
export function PageMain({ children, width = "wide", className }: PageMainProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-6 px-4 py-6 md:px-12 md:py-10",
        width === "wide" ? "max-w-[1280px]" : "max-w-[960px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PageIntroProps {
  title: ReactNode;
  description?: ReactNode;
  /** Optional action at the end of the row (landing "Browse trips"). */
  action?: ReactNode;
  id?: string;
}

/** The page title and its one-line description. */
export function PageIntro({ title, description, action, id }: PageIntroProps) {
  return (
    <section className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col gap-1.5">
        <h1
          id={id}
          className="m-0 text-[28px] leading-9 font-bold md:text-[40px] md:leading-[48px]"
        >
          {title}
        </h1>
        {description ? (
          <p className="m-0 text-base leading-6 text-[var(--te-ink-muted)]">{description}</p>
        ) : null}
      </div>
      {action}
    </section>
  );
}

interface PhoneColumnProps {
  children: ReactNode;
  className?: string;
}

/**
 * Screens drawn only at phone width (390px artboards). On a wider screen the column stays phone
 * sized and centred, so the form keeps its proportions.
 */
export function PhoneColumn({ children, className }: PhoneColumnProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[440px] flex-1 flex-col gap-4 px-4 py-6 md:flex-none md:py-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The large phone-screen title (28/36) with its muted lead. */
export function PhoneIntro({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <>
      <h1 className="m-0 text-[28px] leading-9 font-bold">{title}</h1>
      {description ? (
        <p className="m-0 text-sm leading-5 text-[var(--te-ink-muted)]">{description}</p>
      ) : null}
    </>
  );
}

interface CenteredPanelProps {
  children: ReactNode;
  /** Card width at desktop, from the artboard (460–640px). */
  width: 460 | 480 | 520 | 560 | 600 | 620 | 640;
  role?: "alert" | "region";
  labelledBy?: string;
  /** Six-pixel danger rule on top (account suspended). */
  accent?: "danger";
  className?: string;
}

const PANEL_WIDTH: Record<CenteredPanelProps["width"], string> = {
  460: "max-w-[460px]",
  480: "max-w-[480px]",
  520: "max-w-[520px]",
  560: "max-w-[560px]",
  600: "max-w-[600px]",
  620: "max-w-[620px]",
  640: "max-w-[640px]",
};

/** A single card centred in the page (verification, password reset, account states). */
export function CenteredPanel({
  children,
  width,
  role,
  labelledBy,
  accent,
  className,
}: CenteredPanelProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8 md:p-12">
      <section
        role={role}
        aria-labelledby={labelledBy}
        className={cn(
          "flex w-full flex-col gap-5 rounded-[var(--te-radius-lg)] bg-[var(--te-surface-raised)] p-6 shadow-[var(--te-card-shadow)] md:p-9",
          PANEL_WIDTH[width],
          accent === "danger" && "border-t-[6px] border-[var(--te-danger)]",
          className,
        )}
      >
        {children}
      </section>
    </div>
  );
}

/** The 32/40 title used inside centred cards. */
export function PanelHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h1 id={id} className="m-0 text-[26px] leading-[34px] font-bold md:text-[32px] md:leading-10">
      {children}
    </h1>
  );
}

/** Muted body copy under a heading. */
export function Lead({ children, size = "md" }: { children: ReactNode; size?: "sm" | "md" }) {
  return (
    <p
      className={cn(
        "m-0 text-[var(--te-ink-muted)]",
        size === "md" ? "text-base leading-6" : "text-sm leading-5",
      )}
    >
      {children}
    </p>
  );
}

interface PanelProps {
  children: ReactNode;
  as?: "div" | "section" | "article";
  className?: string;
  labelledBy?: string;
}

/** Raised card with the large radius, used for form columns. */
export function Panel({ children, as: Tag = "div", className, labelledBy }: PanelProps) {
  return (
    <Tag
      aria-labelledby={labelledBy}
      className={cn(
        "flex flex-col gap-[18px] rounded-[var(--te-radius-lg)] bg-[var(--te-surface-raised)] p-5 shadow-[var(--te-card-shadow)] md:p-7",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function PanelTitle({
  children,
  id,
  className,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h2 id={id} className={cn("m-0 text-xl leading-7 font-semibold", className)}>
      {children}
    </h2>
  );
}

/** Two equal columns on desktop, stacked on a phone. */
export function TwoColumns({
  children,
  ratio = "even",
}: {
  children: ReactNode;
  ratio?: "even" | "wideEnd";
}) {
  return (
    <section
      className={cn(
        "grid items-start gap-6",
        ratio === "even"
          ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
          : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]",
      )}
    >
      {children}
    </section>
  );
}

/** A labelled value on the page background (maintenance window, grace period end). */
export function FactBox({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--te-radius-md)] bg-[var(--te-surface)] p-4 text-base leading-6">
      <span className="font-semibold">{label}</span>
      <span>{children}</span>
    </div>
  );
}

/** Buttons and links in a row that wraps on a phone. */
export function ActionRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-4", className)}>{children}</div>;
}
