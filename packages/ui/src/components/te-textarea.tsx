import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { joinDescribedBy } from "@trips-app/ui/components/te-input";
import { useId, useState, type ChangeEvent, type ComponentProps } from "react";

const TE_TEXTAREA_DEFAULT_ROWS = 4;

export interface TeTextareaProps extends Omit<ComponentProps<"textarea">, "id"> {
  /** Visible label. Always shown. */
  label: string;
  id?: string;
  supportingText?: string;
  /** What went wrong and what to do next. Announced with role="alert". */
  error?: string;
  /** Visible "n / max" counter when set. Also enforced by the browser. */
  maxLength?: number;
}

export function TeTextarea({
  label,
  id: idProp,
  supportingText,
  error,
  rows = TE_TEXTAREA_DEFAULT_ROWS,
  maxLength,
  dir = "auto",
  className,
  value,
  defaultValue,
  onChange,
  "aria-describedby": callerDescribedBy,
  ...props
}: TeTextareaProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const supportingId = `${id}-support`;
  const counterId = `${id}-counter`;
  const errorId = `${id}-error`;
  const [uncontrolledLength, setUncontrolledLength] = useState(
    () => String(defaultValue ?? "").length,
  );
  const currentLength = value !== undefined ? String(value).length : uncontrolledLength;
  const describedBy = joinDescribedBy(
    callerDescribedBy,
    supportingText ? supportingId : undefined,
    maxLength !== undefined ? counterId : undefined,
    error ? errorId : undefined,
  );

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setUncontrolledLength(event.currentTarget.value.length);
    onChange?.(event);
  }

  return (
    <div className={cn("te-input te-textarea", className)}>
      <label className="te-input__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        {...props}
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        dir={dir}
        className="te-input__field te-textarea__field"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {supportingText || maxLength !== undefined ? (
        <div className="te-textarea__meta">
          {supportingText ? (
            <p id={supportingId} className="te-input__support">
              {supportingText}
            </p>
          ) : null}
          {maxLength !== undefined ? (
            <p id={counterId} className="te-textarea__counter">
              {`${currentLength} / ${maxLength}`}
            </p>
          ) : null}
        </div>
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
