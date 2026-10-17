import { cn } from "@trips-app/ui/lib/utils";
import { useId } from "react";

export interface TeSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Visible label, also the switch's accessible name. */
  label: string;
  disabled?: boolean;
  /** Visible state words, shown next to the track. */
  onLabel?: string;
  offLabel?: string;
  className?: string;
}

/** On/off setting. A real button with role="switch"; the state is shown as a word and a track. */
export function TeSwitch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  onLabel = "On",
  offLabel = "Off",
  className,
}: TeSwitchProps) {
  const labelId = useId();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn("te-switch", className)}
    >
      <span id={labelId} className="te-switch__label">
        {label}
      </span>
      <span className="te-switch__end">
        <span className="te-switch__state">{checked ? onLabel : offLabel}</span>
        <span aria-hidden="true" className="te-switch__track">
          <span className="te-switch__thumb" />
        </span>
      </span>
    </button>
  );
}
