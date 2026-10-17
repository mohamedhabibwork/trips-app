import { cn } from "@trips-app/ui/lib/utils";
import { useId, type ReactNode } from "react";

export interface TeCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  /** Supporting text under the label. Linked with aria-describedby. */
  description?: ReactNode;
  id?: string;
  className?: string;
}

export function TeCheckbox({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  description,
  id: idProp,
  className,
}: TeCheckboxProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descriptionId = `${id}-description`;

  return (
    <div className={cn("te-checkbox", disabled && "te-checkbox--disabled", className)}>
      <input
        id={id}
        type="checkbox"
        className="te-checkbox__input"
        checked={checked}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
        onChange={(event) => onCheckedChange(event.currentTarget.checked)}
      />
      <div className="te-checkbox__text">
        <label htmlFor={id} className="te-checkbox__label">
          {label}
        </label>
        {description ? (
          <span id={descriptionId} className="te-checkbox__description">
            {description}
          </span>
        ) : null}
      </div>
    </div>
  );
}
