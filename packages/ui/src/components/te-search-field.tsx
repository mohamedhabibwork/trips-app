import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { useId, type ComponentProps } from "react";

export interface TeSearchFieldProps extends Omit<
  ComponentProps<"input">,
  "id" | "type" | "value" | "onChange"
> {
  /** Visible label. Pass hideLabel to keep it for screen readers only. */
  label: string;
  hideLabel?: boolean;
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Runs when the clear button is pressed. Defaults to emptying the value. */
  onClear?: () => void;
  clearLabel: string;
}

export function TeSearchField({
  label,
  hideLabel = false,
  id: idProp,
  value,
  onValueChange,
  onClear,
  clearLabel,
  placeholder,
  className,
  ...props
}: TeSearchFieldProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hasValue = value.length > 0;

  function handleClear() {
    if (onClear) {
      onClear();
      return;
    }
    onValueChange("");
  }

  return (
    <div className={cn("te-search-field", className)}>
      <label
        htmlFor={id}
        className={cn("te-search-field__label", hideLabel && "te-visually-hidden")}
      >
        {label}
      </label>
      <div className="te-search-field__control">
        <TeIcon name="search" className="te-search-field__icon" />
        <input
          {...props}
          id={id}
          type="search"
          dir="auto"
          value={value}
          placeholder={placeholder}
          className="te-search-field__input"
          onChange={(event) => onValueChange(event.currentTarget.value)}
        />
        {hasValue ? (
          <button
            type="button"
            className="te-search-field__clear"
            aria-label={clearLabel}
            onClick={handleClear}
          >
            <TeIcon name="close" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
