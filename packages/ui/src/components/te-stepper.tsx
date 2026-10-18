import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { t } from "@trips-app/i18n";

export interface TeStep {
  id: string;
  label: string;
}

export type TeStepState = "done" | "current" | "upcoming";

export interface TeResolvedStep extends TeStep {
  state: TeStepState;
}

export const TE_STEP_STATE_LABELS: Record<TeStepState, string> = {
  get done() {
    return t("ui.teStepper.labels.done");
  },
  get current() {
    return t("ui.teStepper.labels.current");
  },
  get upcoming() {
    return t("ui.teStepper.labels.upcoming");
  },
};

const STEP_STATE_ICON: Record<TeStepState, TeIconName> = {
  done: "check",
  current: "live",
  upcoming: "clock",
};

function stepStateFor(id: string, currentId: string, completedIds: readonly string[]): TeStepState {
  if (id === currentId) return "current";
  if (completedIds.includes(id)) return "done";
  return "upcoming";
}

/** The current step wins over completed; anything else is upcoming. */
export function resolveStepStates(
  steps: readonly TeStep[],
  currentId: string,
  completedIds: readonly string[],
): TeResolvedStep[] {
  return steps.map((step) => ({
    ...step,
    state: stepStateFor(step.id, currentId, completedIds),
  }));
}

export interface TeStepperProps {
  steps: readonly TeStep[];
  currentId: string;
  completedIds: readonly string[];
  ariaLabel: string;
  /** Overrides the English state words. */
  stateLabels?: Partial<Record<TeStepState, string>>;
  className?: string;
}

export function TeStepper({
  steps,
  currentId,
  completedIds,
  ariaLabel,
  stateLabels,
  className,
}: TeStepperProps) {
  const words = { ...TE_STEP_STATE_LABELS, ...stateLabels };
  const resolved = resolveStepStates(steps, currentId, completedIds);

  return (
    <ol aria-label={ariaLabel} className={cn("te-stepper", className)}>
      {resolved.map((step) => (
        <li
          key={step.id}
          aria-current={step.state === "current" ? "step" : undefined}
          className={cn("te-stepper__step", `te-stepper__step--${step.state}`)}
        >
          <span className="te-stepper__marker">
            <TeIcon name={STEP_STATE_ICON[step.state]} />
          </span>
          <span className="te-stepper__text">
            <span className="te-stepper__label">{step.label}</span>
            <span className="te-stepper__state">{words[step.state]}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
