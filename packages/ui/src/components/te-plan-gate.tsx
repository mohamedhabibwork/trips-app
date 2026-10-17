import { cn } from "@trips-app/ui/lib/utils";
import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { useId } from "react";

export interface TePlanGateProps {
  /** Plan that unlocks the feature, for example "Growth+". */
  plan: string;
  /** What is locked, in one sentence. Linked to the button as its description. */
  lockedLabel: string;
  onUpgrade?: () => void;
  upgradeLabel?: string;
  className?: string;
}

/** Shows a locked feature, the plan that unlocks it, and the upgrade action. */
export function TePlanGate({
  plan,
  lockedLabel,
  onUpgrade,
  upgradeLabel,
  className,
}: TePlanGateProps) {
  const lockedId = useId();

  return (
    <div className={cn("te-plan-gate", className)}>
      <TeBadge tone="highlight" className="te-plan-gate__badge">
        <TeIcon name="lock" />
        <span>{plan}</span>
      </TeBadge>
      <p id={lockedId} className="te-plan-gate__text">
        {lockedLabel}
      </p>
      <TeButton
        variant="secondary"
        aria-describedby={lockedId}
        disabled={!onUpgrade}
        onClick={onUpgrade}
      >
        {upgradeLabel ?? `Upgrade to ${plan}`}
      </TeButton>
    </div>
  );
}
