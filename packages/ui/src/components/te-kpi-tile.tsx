import { cn } from "@trips-app/ui/lib/utils";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";

export type TeKpiDirection = "up" | "down" | "flat";

export interface TeKpiDelta {
  direction: TeKpiDirection;
  /** The change in words, for example "+12% vs last week". */
  label: string;
}

export interface TeKpiTileProps {
  label: string;
  value: string;
  delta?: TeKpiDelta;
  hint?: string;
  className?: string;
}

/** Up and down use one arrow, turned in CSS. Flat uses a minus. */
const DELTA_ICON: Record<TeKpiDirection, TeIconName> = {
  up: "arrow",
  down: "arrow",
  flat: "minus",
};

export function TeKpiTile({ label, value, delta, hint, className }: TeKpiTileProps) {
  return (
    <TeCard as="div" padding="4" className={cn("te-kpi-tile", className)}>
      <p className="te-kpi-tile__label te-caption">{label}</p>
      <p className="te-kpi-tile__value">{value}</p>
      {delta ? (
        <p className={cn("te-kpi-tile__delta", `te-kpi-tile__delta--${delta.direction}`)}>
          <TeIcon name={DELTA_ICON[delta.direction]} />
          <span>{delta.label}</span>
        </p>
      ) : null}
      {hint ? <p className="te-kpi-tile__hint te-caption">{hint}</p> : null}
    </TeCard>
  );
}
