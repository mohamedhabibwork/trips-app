import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { joinDescribedBy } from "@trips-app/ui/components/te-input";
import { useId, type ComponentProps } from "react";

export interface TeSelectOption {
  value: string;
  label: string;
}

export interface TeSelectProps extends Omit<
  ComponentProps<"select">,
  "id" | "value" | "onChange" | "children"
> {
  /** Visible label. Always shown. */
  label: string;
  options: readonly TeSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  supportingText?: string;
  /** What went wrong and what to do next. Announced with role="alert". */
  error?: string;
}

/** Native select styled like TeInput, so it keeps the platform picker on phones. */
export function TeSelect({
  label,
  options,
  value,
  onValueChange,
  id: idProp,
  supportingText,
  error,
  className,
  "aria-describedby": callerDescribedBy,
  ...props
}: TeSelectProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const supportingId = `${id}-support`;
  const errorId = `${id}-error`;
  const describedBy = joinDescribedBy(
    callerDescribedBy,
    supportingText ? supportingId : undefined,
    error ? errorId : undefined,
  );

  return (
    <div className={cn("te-input te-select", className)}>
      <label className="te-input__label" htmlFor={id}>
        {label}
      </label>
      <select
        {...props}
        id={id}
        value={value}
        className="te-input__field te-select__field"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {supportingText ? (
        <p id={supportingId} className="te-input__support">
          {supportingText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="te-input__error">
          <TeIcon name="alert" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
