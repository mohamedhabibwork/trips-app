import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import type { ReactNode } from "react";

export const TE_ALERT_TONES = ["error", "warning", "info", "success"] as const;

export type TeAlertTone = (typeof TE_ALERT_TONES)[number];

interface AlertPresentation {
  icon: TeIconName;
  title: string;
}

/** Each tone pairs an icon and a word, so meaning never rests on colour alone. */
const ALERT_PRESENTATION: Record<TeAlertTone, AlertPresentation> = {
  error: { icon: "alert", title: "Error" },
  warning: { icon: "alert", title: "Warning" },
  info: { icon: "info", title: "Info" },
  success: { icon: "check", title: "Success" },
};

/** Errors interrupt assistive tech (alert); the other tones are polite updates (status). */
export function inlineAlertRole(tone: TeAlertTone): "alert" | "status" {
  return tone === "error" ? "alert" : "status";
}

export function inlineAlertPresentation(tone: TeAlertTone): AlertPresentation {
  return ALERT_PRESENTATION[tone];
}

export interface TeInlineAlertProps {
  tone: TeAlertTone;
  /** Overrides the English default word for the tone. */
  title?: string;
  children?: ReactNode;
  className?: string;
}

export function TeInlineAlert({ tone, title, children, className }: TeInlineAlertProps) {
  const presentation = inlineAlertPresentation(tone);

  return (
    <div
      role={inlineAlertRole(tone)}
      data-tone={tone}
      className={cn("te-inline-alert", `te-inline-alert--${tone}`, className)}
    >
      <TeIcon name={presentation.icon} className="te-inline-alert__icon" />
      <div className="te-inline-alert__content">
        <p className="te-inline-alert__title">{title ?? presentation.title}</p>
        {children ? <div className="te-inline-alert__body">{children}</div> : null}
      </div>
    </div>
  );
}
