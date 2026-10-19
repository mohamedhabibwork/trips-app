// Form controls and small parts from the public and shared artboards: 48px fields with a 1.5px
// border, 48px buttons, soft notices with an icon, status pills, drop zones and choice rows.
import { Link } from "@tanstack/react-router";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { cn } from "@trips-app/ui/lib/utils";
import {
  useId,
  type ComponentProps,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const CONTROL =
  "box-border w-full rounded-[var(--te-radius-sm)] border-[1.5px] border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3.5 text-base font-normal text-[var(--te-ink)] placeholder:text-[var(--te-ink-muted)] disabled:opacity-60 aria-[invalid=true]:border-[var(--te-danger)]";

interface FieldShellProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  errors?: readonly string[];
  children: ReactNode;
  className?: string;
}

function FieldShell({ id, label, hint, errors = [], children, className }: FieldShellProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={id} className="text-sm leading-5 font-semibold">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint ? (
        <p
          id={`${id}-hint`}
          className="m-0 mt-1.5 text-[13px] leading-[18px] text-[var(--te-ink-muted)]"
        >
          {hint}
        </p>
      ) : null}
      {errors.length > 0 ? (
        <div id={`${id}-errors`}>
          {errors.map((message) => (
            <p
              key={message}
              role="alert"
              className="m-0 mt-1.5 text-[13px] leading-[18px] font-semibold text-[var(--te-danger)]"
            >
              {message}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint: ReactNode, errors: readonly string[]): string | undefined {
  const ids = [hint ? `${id}-hint` : "", errors.length > 0 ? `${id}-errors` : ""].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

interface TextFieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: ReactNode;
  id?: string;
  hint?: ReactNode;
  errors?: readonly string[];
  /** Spaced digits for a 6-digit code. */
  code?: boolean;
  fieldClassName?: string;
}

export function TextField({
  label,
  id: idProp,
  hint,
  errors = [],
  code = false,
  fieldClassName,
  className,
  dir = "auto",
  ...props
}: TextFieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell id={id} label={label} hint={hint} errors={errors} className={fieldClassName}>
      <input
        {...props}
        id={id}
        name={props.name ?? id}
        dir={dir}
        aria-invalid={errors.length > 0 || undefined}
        aria-describedby={describedBy(id, hint, errors)}
        className={cn(
          CONTROL,
          "h-12",
          code && "tracking-[6px] placeholder:tracking-normal",
          className,
        )}
      />
    </FieldShell>
  );
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: ReactNode;
  id?: string;
  hint?: ReactNode;
  errors?: readonly string[];
  children: ReactNode;
}

export function SelectField({
  label,
  id: idProp,
  hint,
  errors = [],
  children,
  className,
  ...props
}: SelectFieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell id={id} label={label} hint={hint} errors={errors}>
      <select
        {...props}
        id={id}
        name={props.name ?? id}
        aria-invalid={errors.length > 0 || undefined}
        aria-describedby={describedBy(id, hint, errors)}
        className={cn(CONTROL, "h-12", className)}
      >
        {children}
      </select>
    </FieldShell>
  );
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: ReactNode;
  id?: string;
  hint?: ReactNode;
  errors?: readonly string[];
}

export function TextAreaField({
  label,
  id: idProp,
  hint,
  errors = [],
  className,
  dir = "auto",
  ...props
}: TextAreaFieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell id={id} label={label} hint={hint} errors={errors}>
      <textarea
        {...props}
        id={id}
        name={props.name ?? id}
        dir={dir}
        aria-invalid={errors.length > 0 || undefined}
        aria-describedby={describedBy(id, hint, errors)}
        className={cn(CONTROL, "resize-y py-3", className)}
      />
    </FieldShell>
  );
}

interface CheckFieldProps extends Omit<ComponentProps<"input">, "type" | "id"> {
  label: ReactNode;
  id?: string;
}

/** A 20px checkbox with its sentence (consents). */
export function CheckField({ label, id: idProp, className, ...props }: CheckFieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <label htmlFor={id} className={cn("flex items-start gap-2.5 text-sm leading-5", className)}>
      <input
        {...props}
        id={id}
        type="checkbox"
        className="m-0 size-5 shrink-0 accent-[var(--te-ink)]"
      />
      <span>{label}</span>
    </label>
  );
}

export type ButtonTone = "primary" | "outline" | "danger";

const BUTTON_TONE: Record<ButtonTone, string> = {
  primary:
    "border-0 bg-[var(--te-primary)] text-[var(--te-on-primary)] hover:bg-[var(--te-primary-strong)] hover:shadow-[var(--te-card-shadow-hover)]",
  // Artboard secondary: hairline-light outline on a raised surface, ink border on hover.
  outline:
    "border-[1.5px] border-[var(--te-outline)] bg-[var(--te-surface-raised)] text-[var(--te-ink)] hover:border-[var(--te-ink)] hover:bg-[var(--te-surface-raised)]",
  danger: "border-0 bg-[var(--te-danger)] text-[var(--te-on-danger)]",
};

/** Class string for a 48px button, shared by `<button>` and links styled as buttons. */
export function buttonClass(tone: ButtonTone = "primary", block = false): string {
  return cn(
    "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[var(--te-radius-md)] px-7 py-3 text-base leading-6 font-semibold no-underline disabled:cursor-not-allowed disabled:opacity-50",
    BUTTON_TONE[tone],
    block && "w-full",
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  tone?: ButtonTone;
  block?: boolean;
}

export function Button({
  tone = "primary",
  block = false,
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return <button {...props} type={type} className={cn(buttonClass(tone, block), className)} />;
}

/** Underlined 14px link text, in ink or in the brand text colour. */
export function linkClass(tone: "ink" | "brand" = "brand"): string {
  return cn(
    "cursor-pointer bg-transparent p-0 text-sm leading-5 font-semibold underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50",
    tone === "ink" ? "text-[var(--te-ink)]" : "text-[var(--te-primary-text)]",
  );
}

interface TextLinkProps {
  to: string;
  children: ReactNode;
  tone?: "ink" | "brand";
  className?: string;
  search?: Record<string, string>;
}

/** An in-app link built from a path (`pathFor()`), styled as artboard link text. */
export function TextLink({ to, children, tone = "brand", className, search }: TextLinkProps) {
  return (
    <Link to={to} search={search} className={cn(linkClass(tone), className)}>
      {children}
    </Link>
  );
}

interface TextButtonProps extends ComponentProps<"button"> {
  tone?: "ink" | "brand";
}

export function TextButton({
  tone = "ink",
  type = "button",
  className,
  ...props
}: TextButtonProps) {
  return <button {...props} type={type} className={cn(linkClass(tone), "border-0", className)} />;
}

export type Tone = "danger" | "warning" | "info" | "success";

const SOFT: Record<Tone, string> = {
  danger: "bg-[var(--te-danger-soft)] text-[var(--te-danger)]",
  warning: "bg-[var(--te-warning-soft)] text-[var(--te-warning)]",
  info: "bg-[var(--te-info-soft)] text-[var(--te-ink)]",
  success: "bg-[var(--te-success-soft)] text-[var(--te-success)]",
};

const TONE_ICON: Record<Tone, TeIconName> = {
  danger: "alert",
  warning: "alert",
  info: "info",
  success: "check",
};

interface NoticeProps {
  tone: Tone;
  children: ReactNode;
  /** Bold copy (deadline notices). */
  strong?: boolean;
  icon?: TeIconName;
  className?: string;
}

/** Soft-coloured message with its icon; errors are announced, other tones are polite. */
export function Notice({ tone, children, strong = false, icon, className }: NoticeProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-[var(--te-radius-md)] px-3.5 py-3 text-sm leading-5",
        SOFT[tone],
        strong && "font-semibold",
        className,
      )}
    >
      <TeIcon name={icon ?? TONE_ICON[tone]} className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

interface StatusPillProps {
  tone: Tone | "neutral";
  children: ReactNode;
  icon?: TeIconName;
  className?: string;
}

/** The pill above a card title ("Session ended", "Set-up required"). */
export function StatusPill({ tone, children, icon, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 self-start rounded-[var(--te-radius-pill)] px-3 py-1 text-[13px] leading-[18px] font-semibold",
        tone === "neutral" ? "bg-[var(--te-info-soft)] text-[var(--te-ink)]" : SOFT[tone],
        className,
      )}
    >
      {icon ? <TeIcon name={icon} className="size-4" /> : null}
      {children}
    </span>
  );
}

/** "Step 1 of 2: email" above a card title. */
export function StepLabel({ children }: { children: ReactNode }) {
  return (
    <span className="self-start text-[13px] leading-[18px] font-semibold text-[var(--te-ink-muted)]">
      {children}
    </span>
  );
}

interface DropZoneProps {
  title: ReactNode;
  hint: ReactNode;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles?: (files: readonly File[]) => void;
  /** Line under the hint, e.g. "Uploaded, complete". */
  status?: ReactNode;
  centered?: boolean;
  name?: string;
}

/** Dashed upload area. The whole area is the file picker's label. */
export function DropZone({
  title,
  hint,
  accept,
  multiple = false,
  disabled = false,
  onFiles,
  status,
  centered = false,
  name,
}: DropZoneProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer flex-col gap-1 rounded-[var(--te-radius-md)] border-2 border-dashed border-[var(--te-control-border)] px-5 py-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--te-focus-ring)]",
        centered && "items-center bg-[var(--te-surface-raised)] text-center",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span className="text-sm leading-5 font-semibold">{title}</span>
      <span className="text-[13px] leading-[18px] text-[var(--te-ink-muted)]">{hint}</span>
      {status}
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          onFiles?.(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
    </label>
  );
}

/** Green "Uploaded, complete" line under a drop zone. */
export function UploadedLine({ children }: { children: ReactNode }) {
  return (
    <span className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--te-success)]">
      <TeIcon name="check" className="size-4" />
      {children}
    </span>
  );
}

interface ChoiceRowProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
  size?: "md" | "sm";
}

/** A radio with its label in a bordered row; the checked row gets the 2px ink border. */
export function ChoiceRow({
  name,
  value,
  checked,
  onChange,
  children,
  disabled = false,
  size = "md",
}: ChoiceRowProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-[var(--te-radius-md)]",
        size === "md" ? "px-4 py-3.5 text-base" : "px-3.5 py-3 text-[15px]",
        checked
          ? "border-2 border-[var(--te-ink)] font-semibold"
          : "border-[1.5px] border-[var(--te-control-border)]",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="m-0 size-5 shrink-0 accent-[var(--te-ink)]"
      />
      {children}
    </label>
  );
}

interface ChoiceGroupProps {
  legend: ReactNode;
  children: ReactNode;
  muted?: boolean;
}

export function ChoiceGroup({ legend, children, muted = false }: ChoiceGroupProps) {
  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend
        className={cn(
          "mb-2 font-semibold",
          muted ? "text-[13px] text-[var(--te-ink-muted)]" : "text-sm",
        )}
      >
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  lang?: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** Two-way switch on a hairline track ("Code by message" / "Password"). */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-2 gap-1 rounded-[var(--te-radius-md)] bg-[var(--te-hairline)] p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            lang={option.lang}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "cursor-pointer rounded-[var(--te-radius-sm)] border-0 py-2.5 text-center text-sm font-semibold",
              selected
                ? "bg-[var(--te-surface-raised)] text-[var(--te-ink)]"
                : "bg-transparent text-[var(--te-ink-muted)]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
