import type { ReactNode } from "react";

import { TeBadge, type TeBadgeTone } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeStepper, type TeStep } from "@trips-app/ui/components/te-stepper";
import { t } from "@trips-app/i18n";

import { OrgButtonLink, WorkspaceBackLink, useOrgNavigate } from "./org-link";
import type { OrgSlug } from "./org-routes";

export interface StatePresentation {
  tone: TeBadgeTone;
  icon: TeIconName;
  label: string;
}

/** A status is always a word and an icon. Tone is a second cue, never the only one. */
export function StateBadge({ tone, icon, label }: StatePresentation) {
  return (
    <TeBadge tone={tone}>
      <TeIcon name={icon} />
      <span>{label}</span>
    </TeBadge>
  );
}

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

const TRIP_STATE_STYLE: Record<TripState, Omit<StatePresentation, "label">> = {
  Draft: { tone: "neutral", icon: "file" },
  Published: { tone: "info", icon: "ticket" },
  Negotiating: { tone: "warning", icon: "refresh" },
  Ready: { tone: "success", icon: "check" },
  "Filling Up": { tone: "accent", icon: "users" },
  "Sold Out": { tone: "highlight", icon: "seat" },
  "In Progress": { tone: "info", icon: "live" },
  "Partially Completed": { tone: "warning", icon: "clock" },
  Completed: { tone: "success", icon: "check" },
  "Post-Processing": { tone: "neutral", icon: "refresh" },
  Archived: { tone: "neutral", icon: "file" },
  Cancelled: { tone: "danger", icon: "close" },
  "Refunds Issued": { tone: "danger", icon: "close" },
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

/** Trip state names as written in SRS 7.1. */
export function TripStateBadge({ state }: { state: TripState }) {
  return <StateBadge {...TRIP_STATE_STYLE[state]} label={state} />;
}

export const TRIP_WIZARD_STEPS: readonly TeStep[] = [
  {
    id: "basics",
    get label() {
      return t("screen.organization.common.orgShared.step.basics");
    },
  },
  {
    id: "schedule",
    get label() {
      return t("screen.organization.common.orgShared.step.schedule");
    },
  },
  {
    id: "vehicles",
    get label() {
      return t("screen.organization.common.orgShared.step.vehicles");
    },
  },
  {
    id: "staffing",
    get label() {
      return t("screen.organization.common.orgShared.step.staffing");
    },
  },
  {
    id: "programs",
    get label() {
      return t("screen.organization.common.orgShared.step.programs");
    },
  },
  {
    id: "seating",
    get label() {
      return t("screen.organization.common.orgShared.step.seating");
    },
  },
  {
    id: "pricing",
    get label() {
      return t("screen.organization.common.orgShared.step.pricing");
    },
  },
  {
    id: "publish",
    get label() {
      return t("screen.organization.common.orgShared.step.publish");
    },
  },
];

interface OrgSectionProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function OrgSection({ title, actions, children }: OrgSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="te-h2">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

const ACTIVE_WIZARD_TRIP_KEY = "trips.activeWizardTripId";
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

export function getActiveWizardTripId(): string | null {
  return readStorageKey(ACTIVE_WIZARD_TRIP_KEY);
}

export function setActiveWizardTripId(tripId: string): void {
  writeStorageKey(ACTIVE_WIZARD_TRIP_KEY, tripId);
}

export function getSelectedTripId(): string | null {
  return getActiveWizardTripId();
}

export function setSelectedTripId(tripId: string | null): void {
  writeStorageKey(ACTIVE_WIZARD_TRIP_KEY, tripId);
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
  title: string;
  stepId: string;
  previousSlug: OrgSlug;
  nextSlug: OrgSlug;
  primaryLabel?: string;
  secondaryLabel?: string;
  /** Return false to keep the user on this step, for example when a required field is empty. */
  beforeNext?: () => boolean | Promise<boolean>;
  onSaveDraft?: () => void | Promise<void>;
  children: ReactNode;
}

/** Shared frame for trip wizard steps 1 to 8: header, eight-step stepper and step actions. */
export function TripWizardFrame({
  title,
  stepId,
  previousSlug,
  nextSlug,
  primaryLabel = "Next",
  secondaryLabel = "Save as draft",
  beforeNext,
  onSaveDraft,
  children,
}: TripWizardFrameProps) {
  const goTo = useOrgNavigate();
  const stepIndex = Math.max(
    TRIP_WIZARD_STEPS.findIndex((step) => step.id === stepId),
    0,
  );
  const completedIds = TRIP_WIZARD_STEPS.slice(0, stepIndex).map((step) => step.id);

  const handleNext = () => {
    if (beforeNext) {
      const result = beforeNext();
      if (result instanceof Promise) {
        void result.then((ok) => {
          if (ok) void goTo(nextSlug);
        });
        return;
      }
      if (!result) {
        return;
      }
    }
    void goTo(nextSlug);
  };

  return (
    <div className="flex flex-col gap-6">
      <WorkspaceBackLink />
      <TePageHeader title={title} />
      <TeStepper
        steps={TRIP_WIZARD_STEPS}
        currentId={stepId}
        completedIds={completedIds}
        ariaLabel={t("screen.organization.common.orgShared.tripWizardProgress")}
      />
      <div className="flex flex-col gap-4">{children}</div>
      <div className="flex flex-wrap justify-end gap-3">
        <OrgButtonLink slug={previousSlug} variant="ghost">
          {t("screen.organization.common.orgShared.back")}
        </OrgButtonLink>
        <TeButton
          variant="secondary"
          onClick={() => {
            if (onSaveDraft) void onSaveDraft();
          }}
        >
          {secondaryLabel}
        </TeButton>
        <TeButton onClick={handleNext}>{primaryLabel}</TeButton>
      </div>
    </div>
  );
}
