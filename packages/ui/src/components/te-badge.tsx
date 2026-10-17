import { cn } from "@trips-app/ui/lib/utils";
import type { ComponentProps } from "react";

/**
 * Tone to token pairing (text colour meets contrast on each background):
 * neutral: ink on hairline. accent: brand-navy on accent. highlight: brand-navy on highlight.
 * success / warning / danger: status text on its -soft background. info: ink on info-soft.
 */
export const TE_BADGE_TONES = [
  "neutral",
  "accent",
  "highlight",
  "success",
  "warning",
  "danger",
  "info",
] as const;

export type TeBadgeTone = (typeof TE_BADGE_TONES)[number];

export interface TeBadgeProps extends ComponentProps<"span"> {
  tone?: TeBadgeTone;
}

export function TeBadge({ tone = "neutral", className, ...props }: TeBadgeProps) {
  return <span {...props} className={cn("te-badge", `te-badge--${tone}`, className)} />;
}
