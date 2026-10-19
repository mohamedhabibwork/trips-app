// Shared organization vocabulary: status badges, trip states, the trip wizard frame and the ids a
// list page remembers for its detail page. The wizard keeps its trip in the URL, never here.
import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { TeIcon } from "@trips-app/ui/components/te-icon";
import { cn } from "@trips-app/ui/lib/utils";
import { t } from "@trips-app/i18n";

import { pathFor } from "@/navigation/web-routes";

import { orgHref, type OrgSlug } from "./org-routes";
import { OrgBadge, OrgButton, OrgPage, OrgPageHeader, type OrgTone } from "./org-ui";

export const TRIP_STATES = [
  "Draft",
  "Published",
  "Negotiating",
  "Ready",
  "Filling Up",
  "Sold Out",
  "In Progress",
  "Partially Completed",
  "Completed",
  "Post-Processing",
  "Archived",
  "Cancelled",
  "Refunds Issued",
] as const;

export type TripState = (typeof TRIP_STATES)[number];

const TRIP_STATE_STYLE: Record<TripState, { tone: OrgTone; key: string }> = {
  Draft: { tone: "neu", key: "draft" },
  Published: { tone: "info", key: "published" },
  Negotiating: { tone: "info", key: "negotiating" },
  Ready: { tone: "ok", key: "ready" },
  "Filling Up": { tone: "info", key: "fillingUp" },
  "Sold Out": { tone: "acc", key: "soldOut" },
  "In Progress": { tone: "info", key: "inProgress" },
  "Partially Completed": { tone: "warn", key: "partiallyCompleted" },
  Completed: { tone: "ok", key: "completed" },
  "Post-Processing": { tone: "neu", key: "postProcessing" },
  Archived: { tone: "neu", key: "archived" },
  Cancelled: { tone: "err", key: "cancelled" },
  "Refunds Issued": { tone: "err", key: "refundsIssued" },
};

const BACKEND_TRIP_STATE_MAP: Record<string, TripState> = {
  draft: "Draft",
  published: "Published",
  negotiating: "Negotiating",
  scheduled: "Ready",
  ready: "Ready",
  Selection: "Filling Up",
  filling_up: "Filling Up",
  sold_out: "Sold Out",
  in_progress: "In Progress",
  partially_completed: "Partially Completed",
  completed: "Completed",
  post_processing: "Post-Processing",
  archived: "Archived",
  cancelled: "Cancelled",
  refunds_issued: "Refunds Issued",
};

export function toTripState(state: string): TripState {
  return BACKEND_TRIP_STATE_MAP[state] ?? "Draft";
}

/** Trip state name (SRS 7.1) in the current language. */
export function tripStateLabel(state: TripState): string {
  return t(`screen.organization.common.orgShared.tripState.${TRIP_STATE_STYLE[state].key}`);
}

export function tripStateTone(state: TripState): OrgTone {
  return TRIP_STATE_STYLE[state].tone;
}

export function TripStateBadge({ state, tone }: { state: TripState; tone?: OrgTone }) {
  return <OrgBadge tone={tone ?? tripStateTone(state)}>{tripStateLabel(state)}</OrgBadge>;
}

/** A trip's display name: the title in the reader's language, else the other one. */
export function tripTitle(
  trip: { titleEn?: string | null; titleAr?: string | null },
  locale: string,
): string {
  const en = trip.titleEn ?? "";
  const ar = trip.titleAr ?? "";
  return (locale === "ar" ? ar || en : en || ar) || "";
}

/** `YYYY-MM-DD` of an ISO date or Date, or null. */
export function isoDay(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

export const TRIP_WIZARD_STEP_IDS = [
  "basics",
  "schedule",
  "vehicles",
  "staffing",
  "programs",
  "seating",
  "pricing",
  "publish",
] as const;

export type TripWizardStepId = (typeof TRIP_WIZARD_STEP_IDS)[number];

const STEP_SLUG: Record<TripWizardStepId, OrgSlug> = {
  basics: "trip-wizard-step-1-basics",
  schedule: "trip-wizard-step-2-schedule-and-route",
  vehicles: "trip-wizard-step-3-vehicles",
  staffing: "trip-wizard-step-4-staffing",
  programs: "trip-wizard-step-5-programs",
  seating: "trip-wizard-step-6-seating",
  pricing: "trip-wizard-step-7-pricing-and-capacity",
  publish: "trip-wizard-step-8-publish",
};

export function wizardStepSlug(step: TripWizardStepId): OrgSlug {
  return STEP_SLUG[step];
}

/**
 * URL of a wizard step for a saved draft. Step 1 without a trip is `/business/trips/new`; every
 * other step needs the trip, so without one the link goes to the trips list.
 */
export function wizardStepHref(step: TripWizardStepId, tripId: string | null | undefined): string {
  if (step === "basics") {
    return tripId ? `${pathFor("SCR-ORG-14", { tripId })}/edit` : orgHref(STEP_SLUG.basics);
  }
  return orgHref(STEP_SLUG[step], { tripId });
}

export function wizardStepLabel(step: TripWizardStepId): string {
  return t(`screen.organization.common.orgShared.step.${step}`);
}

/** The eight wizard steps as numbered dots; done steps show a check and link back. */
export function TripWizardSteps({
  current,
  tripId,
}: {
  current: TripWizardStepId;
  tripId: string | null;
}) {
  const currentIndex = TRIP_WIZARD_STEP_IDS.indexOf(current);
  return (
    <ol
      aria-label={t("screen.organization.common.orgShared.tripWizardProgress")}
      className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-3 p-0"
    >
      {TRIP_WIZARD_STEP_IDS.map((step, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "now" : "next";
        const content = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-[13px] leading-[18px] font-semibold",
                state === "done" &&
                  "border-[var(--te-success)] bg-[var(--te-success-soft)] text-[var(--te-success)]",
                state === "now" &&
                  "border-[var(--te-accent)] bg-[var(--te-accent)] text-[var(--te-brand-navy)]",
                state === "next" &&
                  "border-[var(--te-control-border)] bg-[var(--te-surface-raised)]",
              )}
            >
              {state === "done" ? <TeIcon name="check" className="size-4" /> : index + 1}
            </span>
            <span>{wizardStepLabel(step)}</span>
            {state === "done" ? (
              <span className="sr-only">{t("screen.organization.common.orgShared.stepDone")}</span>
            ) : null}
          </>
        );
        const itemClass = cn(
          "flex items-center gap-2 text-sm leading-5 font-semibold",
          state === "now" ? "text-[var(--te-ink)]" : "text-[var(--te-ink-muted)]",
        );
        return (
          <li key={step} aria-current={state === "now" ? "step" : undefined}>
            {state === "done" ? (
              <Link
                to={wizardStepHref(step, tripId)}
                className={cn(itemClass, "no-underline hover:text-[var(--te-ink)]")}
              >
                {content}
              </Link>
            ) : (
              <span className={itemClass}>{content}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

const SELECTED_TRIP_KEY = "trips.selectedTripId";
const SELECTED_EMPLOYEE_KEY = "trips.selectedEmployeeId";
const SELECTED_VEHICLE_KEY = "trips.selectedVehicleId";
const SELECTED_BOOKING_KEY = "trips.selectedBookingId";
const SELECTED_NEGOTIATION_KEY = "trips.selectedNegotiationId";
const SELECTED_COUPON_KEY = "trips.selectedCouponId";
const SELECTED_PROGRAM_KEY = "trips.selectedProgramId";

function readStorageKey(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageKey(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value === null) {
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
}

/** The trip last picked on a page that has a trip filter, so the next such page starts on it. */
export function getSelectedTripId(): string | null {
  return readStorageKey(SELECTED_TRIP_KEY);
}

export function setSelectedTripId(tripId: string | null): void {
  writeStorageKey(SELECTED_TRIP_KEY, tripId);
}

export function getSelectedEmployeeId(): string | null {
  return readStorageKey(SELECTED_EMPLOYEE_KEY);
}

export function setSelectedEmployeeId(id: string | null): void {
  writeStorageKey(SELECTED_EMPLOYEE_KEY, id);
}

export function getSelectedVehicleId(): string | null {
  return readStorageKey(SELECTED_VEHICLE_KEY);
}

export function setSelectedVehicleId(id: string | null): void {
  writeStorageKey(SELECTED_VEHICLE_KEY, id);
}

export function getSelectedBookingId(): string | null {
  return readStorageKey(SELECTED_BOOKING_KEY);
}

export function setSelectedBookingId(id: string | null): void {
  writeStorageKey(SELECTED_BOOKING_KEY, id);
}

export function getSelectedNegotiationId(): string | null {
  return readStorageKey(SELECTED_NEGOTIATION_KEY);
}

export function setSelectedNegotiationId(id: string | null): void {
  writeStorageKey(SELECTED_NEGOTIATION_KEY, id);
}

export function getSelectedCouponId(): string | null {
  return readStorageKey(SELECTED_COUPON_KEY);
}

export function setSelectedCouponId(id: string | null): void {
  writeStorageKey(SELECTED_COUPON_KEY, id);
}

export function getSelectedProgramId(): string | null {
  return readStorageKey(SELECTED_PROGRAM_KEY);
}

export function setSelectedProgramId(id: string | null): void {
  writeStorageKey(SELECTED_PROGRAM_KEY, id);
}

interface TripWizardFrameProps {
  stepId: TripWizardStepId;
  /** The draft being edited; null only on step 1 before the draft exists. */
  tripId: string | null;
  /** h1; "Create trip" unless the step names its own action (step 8: "Publish trip"). */
  title?: string;
  /** Trip name added to the caption once the draft has one. */
  tripName?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  /** Disables the primary action, e.g. Publish while a required step is incomplete. */
  primaryDisabled?: boolean;
  /** Id of the note that explains a disabled primary action. */
  primaryDescribedBy?: string;
  /**
   * Saves the step. Return false to stay on it (a required field is empty or the save failed);
   * return a trip id to continue with that trip (step 1 returns the draft it created).
   */
  beforeNext?: () => boolean | string | Promise<boolean | string>;
  /** Runs instead of opening the next step (step 8 publishes). */
  onPrimary?: () => void | Promise<void>;
  onSaveDraft?: () => void | Promise<void>;
  busy?: boolean;
  /** Shown under the actions. */
  footerNote?: ReactNode;
  children: ReactNode;
}

/** Frame of trip wizard steps 1 to 8: title, step caption, the eight dots, content and actions. */
export function TripWizardFrame({
  stepId,
  tripId,
  title,
  tripName,
  primaryLabel,
  secondaryLabel,
  primaryDisabled = false,
  primaryDescribedBy,
  beforeNext,
  onPrimary,
  onSaveDraft,
  busy = false,
  footerNote,
  children,
}: TripWizardFrameProps) {
  const navigate = useNavigate();
  const goTo = (step: TripWizardStepId, id: string | null) =>
    navigate({ to: wizardStepHref(step, id) });
  const index = TRIP_WIZARD_STEP_IDS.indexOf(stepId);
  const previous = TRIP_WIZARD_STEP_IDS[index - 1];
  const next = TRIP_WIZARD_STEP_IDS[index + 1];
  const caption = [
    t("screen.organization.common.orgShared.stepCaption", {
      n: index + 1,
      step: t(`screen.organization.common.orgShared.stepCaption.${stepId}`),
    }),
    tripName,
  ]
    .filter(Boolean)
    .join(" · ");

  const handlePrimary = async () => {
    const saved = beforeNext ? await beforeNext() : true;
    if (saved === false) return;
    if (onPrimary) {
      await onPrimary();
      return;
    }
    const nextTripId = typeof saved === "string" ? saved : tripId;
    if (next) void goTo(next, nextTripId);
  };

  const draftButton = (
    <OrgButton
      variant="secondary"
      disabled={busy}
      onClick={() => {
        if (onSaveDraft) void onSaveDraft();
      }}
    >
      {secondaryLabel ?? t("screen.organization.common.orgShared.saveAsDraft")}
    </OrgButton>
  );
  const primaryButton = (
    <OrgButton
      disabled={primaryDisabled || busy}
      aria-describedby={primaryDescribedBy}
      onClick={() => void handlePrimary()}
    >
      {primaryLabel ?? t("screen.organization.common.orgShared.next")}
    </OrgButton>
  );

  return (
    <OrgPage>
      <OrgPageHeader
        title={title ?? t("screen.organization.common.orgShared.createTrip")}
        caption={caption}
      />
      <TripWizardSteps current={stepId} tripId={tripId} />
      {children}
      <div className="flex flex-col gap-2">
        <div
          className={cn(
            "flex flex-wrap gap-3",
            previous && next ? "justify-between" : "justify-end",
          )}
        >
          {previous && next ? (
            <OrgButton variant="secondary" onClick={() => void goTo(previous, tripId)}>
              {t("screen.organization.common.orgShared.back")}
            </OrgButton>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {draftButton}
            {primaryButton}
          </div>
        </div>
        {footerNote}
      </div>
    </OrgPage>
  );
}
