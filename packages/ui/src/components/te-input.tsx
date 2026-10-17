import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { useId, useState, type ComponentProps } from "react";

export const TE_INPUT_TYPES = [
  "text",
  "email",
  "tel",
  "password",
  "number",
  "search",
  "url",
] as const;

export type TeInputType = (typeof TE_INPUT_TYPES)[number];

export interface TeInputProps extends Omit<ComponentProps<"input">, "id" | "type"> {
  /** Visible label. Always shown. */
  label: string;
  id?: string;
  /** Input type. Defaults to text. */
  type?: TeInputType;
  supportingText?: string;
  /** What went wrong and what to do next. Announced with role="alert". */
  error?: string;
  /** Shows a button that switches a password field between hidden and visible text. */
  passwordToggle?: boolean;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

/** Joins id references for aria-describedby, skipping empty entries. */
export function joinDescribedBy(...ids: (string | undefined)[]): string | undefined {
  const present = ids.filter((id): id is string => typeof id === "string" && id.length > 0);
  return present.length > 0 ? present.join(" ") : undefined;
}

export function TeInput({
  label,
  id: idProp,
  type = "text",
  supportingText,
  error,
  dir = "auto",
  className,
  passwordToggle = false,
  showPasswordLabel = "Show password",
  hidePasswordLabel = "Hide password",
  "aria-describedby": callerDescribedBy,
  ...props
}: TeInputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const supportingId = `${id}-support`;
  const errorId = `${id}-error`;
  const [revealed, setRevealed] = useState(false);
  const showsToggle = passwordToggle && type === "password";
  const describedBy = joinDescribedBy(
    callerDescribedBy,
    supportingText ? supportingId : undefined,
    error ? errorId : undefined,
  );

  const field = (
    <input
      {...props}
      id={id}
      type={showsToggle && revealed ? "text" : type}
      dir={dir}
      className="te-input__field"
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
    />
  );

  return (
    <div className={cn("te-input", className)}>
      <label className="te-input__label" htmlFor={id}>
        {label}
      </label>
      {showsToggle ? (
        <div className="te-input__control">
          {field}
          <button
            type="button"
            className="te-input__toggle"
            aria-pressed={revealed}
            disabled={props.disabled}
            onClick={() => setRevealed((current) => !current)}
          >
            {revealed ? hidePasswordLabel : showPasswordLabel}
          </button>
        </div>
      ) : (
        field
      )}
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
