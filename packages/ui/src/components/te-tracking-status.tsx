import { cn } from "@trips-app/ui/lib/utils";
import { TeBadge, type TeBadgeTone } from "@trips-app/ui/components/te-badge";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";

export const TE_TRACKING_STATUSES = [
  "on-time",
  "delayed",
  "boarded",
  "not-boarded",
  "arrived",
] as const;

export type TeTrackingStatusValue = (typeof TE_TRACKING_STATUSES)[number];

export interface TeTrackingPresentation {
  tone: TeBadgeTone;
  icon: TeIconName;
  label: string;
}

/** Status is always word + icon. Tone is secondary, never the only cue. */
const TRACKING_PRESENTATION: Record<TeTrackingStatusValue, TeTrackingPresentation> = {
  "on-time": { tone: "info", icon: "clock", label: "On time" },
  delayed: { tone: "warning", icon: "alert", label: "Delayed" },
  boarded: { tone: "success", icon: "check", label: "Boarded" },
  "not-boarded": { tone: "danger", icon: "user", label: "Not boarded" },
  arrived: { tone: "success", icon: "bus", label: "Arrived" },
};

export function trackingStatusPresentation(status: TeTrackingStatusValue): TeTrackingPresentation {
  return TRACKING_PRESENTATION[status];
}

export interface TeTrackingStatusProps {
  status: TeTrackingStatusValue;
  /** Overrides the English default word. */
  label?: string;
  className?: string;
}

export function TeTrackingStatus({ status, label, className }: TeTrackingStatusProps) {
  const presentation = trackingStatusPresentation(status);

  return (
    <TeBadge
      tone={presentation.tone}
      data-status={status}
      className={cn("te-tracking-status", className)}
    >
      <TeIcon name={presentation.icon} />
      <span>{label ?? presentation.label}</span>
    </TeBadge>
  );
}
