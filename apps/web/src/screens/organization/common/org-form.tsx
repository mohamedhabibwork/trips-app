// Form controls of the organization artboards (`.fld`, `.chip`, `.tabs`): a 14 px semibold label
// over a 44 px control with a muted border. Every control has a visible label.
import { useId, type ComponentProps, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@trips-app/ui/lib/utils";

const CONTROL_CLASS =
  "min-h-11 w-full rounded-lg border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3 py-2 text-base leading-6 text-[var(--te-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--te-ink)] disabled:opacity-60 aria-invalid:border-[var(--te-danger)]";

interface FieldShellProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}

function FieldShell({ id, label, hint, error, className, children }: FieldShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1 text-sm leading-5", className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <span id={`${id}-hint`} className="te-caption text-[var(--te-ink-muted)]">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${id}-error`} className="te-caption text-[var(--te-danger)]">
          {error}
        </span>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint: ReactNode, error?: string): string | undefined {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

interface OrgInputProps extends Omit<ComponentProps<"input">, "id"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  fieldClassName?: string;
}

export function OrgInput({
  label,
  hint,
  error,
  fieldClassName,
  className,
  ...props
}: OrgInputProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={fieldClassName}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(CONTROL_CLASS, className)}
        {...props}
      />
    </FieldShell>
  );
}

interface OrgTextareaProps extends Omit<ComponentProps<"textarea">, "id"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  fieldClassName?: string;
}

export function OrgTextarea({
  label,
  hint,
  error,
  fieldClassName,
  className,
  rows = 3,
  ...props
}: OrgTextareaProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={fieldClassName}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(CONTROL_CLASS, className)}
        {...props}
      />
    </FieldShell>
  );
}

export interface OrgOption {
  value: string;
  label: string;
}

interface OrgSelectProps extends Omit<ComponentProps<"select">, "id" | "onChange"> {
  label: ReactNode;
  options: readonly OrgOption[];
  value: string;
  onValueChange: (value: string) => void;
  hint?: ReactNode;
  error?: string;
  fieldClassName?: string;
}

export function OrgSelect({
  label,
  options,
  value,
  onValueChange,
  hint,
  error,
  fieldClassName,
  className,
  ...props
}: OrgSelectProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={fieldClassName}>
      <select
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(CONTROL_CLASS, className)}
        {...props}
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

interface OrgChoiceProps extends Omit<ComponentProps<"input">, "type"> {
  type: "radio" | "checkbox";
  children: ReactNode;
}

/** A radio or checkbox with its label on the same 44 px row. */
export function OrgChoice({ type, children, className, ...props }: OrgChoiceProps) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-3", className)}>
      <input type={type} className="size-5 shrink-0 accent-[var(--te-primary)]" {...props} />
      <span>{children}</span>
    </label>
  );
}

interface OrgChipsProps {
  label: string;
  options: readonly OrgOption[];
  value: string;
  onValueChange: (value: string) => void;
}

/** Single-choice filter chips (`aria-pressed`), wrapping onto more lines when narrow. */
export function OrgChips({ label, options, value, onValueChange }: OrgChipsProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const pressed = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={pressed}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "inline-flex min-h-9 items-center rounded-full border px-4 py-1.5 text-sm leading-5 font-semibold",
              pressed
                ? "border-[var(--te-accent)] bg-[var(--te-accent)] text-[var(--te-brand-navy)]"
                : "border-[var(--te-control-border)] bg-[var(--te-surface-raised)] text-[var(--te-ink)]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

const TAB_CLASS =
  "-mb-px inline-flex min-h-11 items-center border-b-2 px-4 py-3 text-sm leading-5 font-semibold whitespace-nowrap no-underline";
const TAB_ON = "border-[var(--te-ink)] text-[var(--te-ink)]";
const TAB_OFF = "border-transparent text-[var(--te-ink-muted)] hover:text-[var(--te-ink)]";

export interface OrgTabItem {
  id: string;
  label: string;
}

interface OrgTabsProps {
  label: string;
  tabs: readonly OrgTabItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/** In-page tabs. Arrow keys are not wired: each tab is a plain button in the tab order. */
export function OrgTabs({ label, tabs, activeId, onSelect }: OrgTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-2 overflow-x-auto border-b border-[var(--te-hairline)]"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === activeId}
          onClick={() => onSelect(tab.id)}
          className={cn(TAB_CLASS, tab.id === activeId ? TAB_ON : TAB_OFF)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export interface OrgNavTabItem {
  id: string;
  label: string;
  href: string;
}

interface OrgNavTabsProps {
  label: string;
  tabs: readonly OrgNavTabItem[];
  activeId: string;
}

/** Tabs that are links to other pages (e.g. a trip's sections); the current one is `aria-current`. */
export function OrgNavTabs({ label, tabs, activeId }: OrgNavTabsProps) {
  return (
    <nav
      aria-label={label}
      className="flex gap-2 overflow-x-auto border-b border-[var(--te-hairline)]"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          to={tab.href}
          aria-current={tab.id === activeId ? "page" : undefined}
          className={cn(TAB_CLASS, tab.id === activeId ? TAB_ON : TAB_OFF)}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
