import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";

export const TE_TIMELINE_STATES = ["done", "current", "upcoming", "missed"] as const;
export type TeTimelineState = (typeof TE_TIMELINE_STATES)[number];

export interface TeTimelineItem {
  id: string;
  time: string;
  label: string;
  state: TeTimelineState;
}

export type TeTimelineStateLabels = Record<TeTimelineState, string>;

export const TE_TIMELINE_STATE_LABELS: TeTimelineStateLabels = {
  done: "Done",
  current: "Current",
  upcoming: "Upcoming",
  missed: "Missed",
};

const TIMELINE_STATE_ICON: Record<TeTimelineState, TeIconName> = {
  done: "check",
  current: "live",
  upcoming: "clock",
  missed: "alert",
};

export interface TeTimelineProps {
  items: readonly TeTimelineItem[];
  ariaLabel: string;
  stateLabels?: Partial<TeTimelineStateLabels>;
  className?: string;
}

/** Ordered events such as boarding steps. Each item states its state in words. */
export function TeTimeline({ items, ariaLabel, stateLabels, className }: TeTimelineProps) {
  const words: TeTimelineStateLabels = { ...TE_TIMELINE_STATE_LABELS, ...stateLabels };

  return (
    <ol aria-label={ariaLabel} className={cn("te-timeline", className)}>
      {items.map((item) => (
        <li key={item.id} className={cn("te-timeline__item", `te-timeline__item--${item.state}`)}>
          <span className="te-timeline__marker">
            <TeIcon name={TIMELINE_STATE_ICON[item.state]} />
          </span>
          <div className="te-timeline__content">
            <p className="te-timeline__label">{item.label}</p>
            <p className="te-timeline__meta">
              <span>{item.time}</span>
              <span className="te-timeline__state">{words[item.state]}</span>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
