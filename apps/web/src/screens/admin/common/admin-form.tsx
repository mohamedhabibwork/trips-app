// Form controls of the admin artboards: labelled native select, input and textarea (`te-field` and
// `te-in`), checkbox and radio rows (`te-check`, `te-radio`), and the underline tabs (`te-tabs`).
import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@trips-app/ui/lib/utils";

const CONTROL_CLASS =
  "w-full min-w-0 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3 py-2.5 text-base leading-6 text-[var(--te-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--te-focus-ring)] disabled:opacity-60";

interface FieldShellProps {
  label: ReactNode;
  /** Helper or error line under the control. */
  help?: ReactNode;
  className?: string;
}

function FieldShell({
  id,
  label,
  help,
  className,
  children,
}: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="te-label">
        {label}
      </label>
      {children}
      {help ? (
        <p id={`${id}-help`} className="te-caption">
          {help}
        </p>
      ) : null}
    </div>
  );
}

export interface AdminOption {
  value: string;
  label: string;
}

export interface AdminSelectProps
  extends FieldShellProps, Omit<ComponentProps<"select">, "onChange" | "value" | "id"> {
  value: string;
  options: readonly AdminOption[];
  onValueChange: (value: string) => void;
}

export function AdminSelect({
  label,
  help,
  className,
  value,
  options,
  onValueChange,
  ...props
}: AdminSelectProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} className={className}>
      <select
        {...props}
        id={id}
        value={value}
        aria-describedby={help ? `${id}-help` : undefined}
        onChange={(event) => onValueChange(event.target.value)}
        className={CONTROL_CLASS}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export interface AdminInputProps extends FieldShellProps, Omit<ComponentProps<"input">, "id"> {}

export function AdminInput({ label, help, className, ...props }: AdminInputProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} className={className}>
      <input
        {...props}
        id={id}
        aria-describedby={help ? `${id}-help` : undefined}
        className={CONTROL_CLASS}
      />
    </FieldShell>
  );
}

export interface AdminTextareaProps
  extends FieldShellProps, Omit<ComponentProps<"textarea">, "id"> {}

export function AdminTextarea({ label, help, className, rows = 5, ...props }: AdminTextareaProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} className={className}>
      <textarea
        {...props}
        id={id}
        rows={rows}
        aria-describedby={help ? `${id}-help` : undefined}
        className={CONTROL_CLASS}
      />
    </FieldShell>
  );
}

const CHOICE_INPUT_CLASS = "mt-[3px] size-[18px] shrink-0 accent-[var(--te-primary)]";

export function AdminCheckbox({
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="te-body flex items-start gap-3 text-[var(--te-ink)]">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className={CHOICE_INPUT_CLASS}
      />
      <span>{label}</span>
    </label>
  );
}

export interface AdminRadioOption {
  value: string;
  label: ReactNode;
  /** Muted line under the label. */
  description?: ReactNode;
}

export function AdminRadioGroup({
  legend,
  name,
  value,
  options,
  onValueChange,
}: {
  legend: ReactNode;
  name: string;
  value: string;
  options: readonly AdminRadioOption[];
  onValueChange: (value: string) => void;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3 border-0 p-0">
      <legend className="te-label mb-1.5">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className="te-body flex items-start gap-3 text-[var(--te-ink)]">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onValueChange(option.value)}
            className={CHOICE_INPUT_CLASS}
          />
          <span className="flex flex-col">
            <span>{option.label}</span>
            {option.description ? <span className="te-caption">{option.description}</span> : null}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

export interface AdminTab {
  id: string;
  label: string;
}

/** Underline tabs. The selected tab has the accent bar under it. */
export function AdminTabs({
  tabs,
  activeId,
  onSelect,
  label,
}: {
  tabs: readonly AdminTab[];
  activeId: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-2 overflow-x-auto border-b border-[var(--te-hairline)]"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "border-b-[3px] px-3.5 py-2.5 text-sm leading-5 font-semibold whitespace-nowrap",
              isActive
                ? "border-[var(--te-accent)] text-[var(--te-ink)]"
                : "border-transparent text-[var(--te-ink-muted)] hover:text-[var(--te-ink)]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
