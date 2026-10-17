import { cn } from "@trips-app/ui/lib/utils";
import { TeCheckbox } from "@trips-app/ui/components/te-checkbox";
import { TeIcon } from "@trips-app/ui/components/te-icon";

export interface TeChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  note?: string;
}

export interface TeChecklistStateLabels {
  checked: string;
  notYet: string;
}

export const TE_CHECKLIST_STATE_LABELS: TeChecklistStateLabels = {
  checked: "Checked",
  notYet: "Not yet",
};

export interface TeChecklistProps {
  items: readonly TeChecklistItem[];
  /** Without this the checklist is read-only and its checkboxes are disabled. */
  onToggle?: (id: string) => void;
  ariaLabel: string;
  stateLabels?: Partial<TeChecklistStateLabels>;
  className?: string;
}

/** Pre-trip or boarding checks. Each item shows "Checked" or "Not yet" in words. */
export function TeChecklist({
  items,
  onToggle,
  ariaLabel,
  stateLabels,
  className,
}: TeChecklistProps) {
  const words: TeChecklistStateLabels = { ...TE_CHECKLIST_STATE_LABELS, ...stateLabels };

  return (
    <ul aria-label={ariaLabel} className={cn("te-checklist", className)}>
      {items.map((item) => (
        <li key={item.id} className="te-checklist__item">
          <TeCheckbox
            label={item.label}
            checked={item.checked}
            disabled={onToggle === undefined}
            onCheckedChange={() => onToggle?.(item.id)}
            description={
              <>
                <span
                  className={cn(
                    "te-checklist__state",
                    item.checked ? "te-checklist__state--checked" : "te-checklist__state--pending",
                  )}
                >
                  <TeIcon name={item.checked ? "check" : "clock"} />
                  <span>{item.checked ? words.checked : words.notYet}</span>
                </span>
                {item.note ? <span className="te-checklist__note">{item.note}</span> : null}
              </>
            }
          />
        </li>
      ))}
    </ul>
  );
}
