import type { ReactNode } from "react";

import { TeBadge, type TeBadgeTone } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeStepper, type TeStep } from "@trips-app/ui/components/te-stepper";

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

/** Trip state names as written in SRS 7.1. */
export function TripStateBadge({ state }: { state: TripState }) {
  return <StateBadge {...TRIP_STATE_STYLE[state]} label={state} />;
}

export const TRIP_WIZARD_STEPS: readonly TeStep[] = [
  { id: "basics", label: "Basics" },
  { id: "schedule", label: "Schedule and route" },
  { id: "vehicles", label: "Vehicles" },
  { id: "staffing", label: "Staffing" },
  { id: "programs", label: "Programs" },
  { id: "seating", label: "Seating" },
  { id: "pricing", label: "Pricing and capacity" },
  { id: "publish", label: "Publish" },
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

interface TripWizardFrameProps {
  title: string;
  stepId: string;
  previousSlug: OrgSlug;
  nextSlug: OrgSlug;
  primaryLabel?: string;
  secondaryLabel?: string;
  /** Return false to keep the user on this step, for example when a required field is empty. */
  beforeNext?: () => boolean;
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
  children,
}: TripWizardFrameProps) {
  const goTo = useOrgNavigate();
  const stepIndex = Math.max(
    TRIP_WIZARD_STEPS.findIndex((step) => step.id === stepId),
    0,
  );
  const completedIds = TRIP_WIZARD_STEPS.slice(0, stepIndex).map((step) => step.id);

  const handleNext = () => {
    if (beforeNext && !beforeNext()) {
      return;
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
        ariaLabel="Trip wizard progress"
      />
      <div className="flex flex-col gap-4">{children}</div>
      <div className="flex flex-wrap justify-end gap-3">
        <OrgButtonLink slug={previousSlug} variant="ghost">
          Back
        </OrgButtonLink>
        <TeButton variant="secondary">{secondaryLabel}</TeButton>
        <TeButton onClick={handleNext}>{primaryLabel}</TeButton>
      </div>
    </div>
  );
}
