// Frame for every auth screen, inside the public shell (which already draws the logo, the language
// switch and the account menu). Two layouts from docs/design/web/public-shared:
// - `phone`: the 390px sign-in column (SCR-PUB-08, 11, 19), kept phone-width on desktop;
// - `card`: a centred card (SCR-PUB-07, 09, 10, 12).
// All copy comes from the messages catalog through `useAuth().t` (PRD I1).
import type { ReactNode } from "react";

import { TextField } from "@/components/kit/controls";
import {
  CenteredPanel,
  Lead,
  PanelHeading,
  PhoneColumn,
  PhoneIntro,
} from "@/components/kit/layout";

type CardWidth = 460 | 480 | 520 | 560 | 600 | 620;

export interface AuthShellProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  layout?: "phone" | "card";
  /** Card width at desktop (card layout). */
  width?: CardWidth;
  /** Pill or step label above the title (card layout). */
  badge?: ReactNode;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  layout = "card",
  width = 520,
  badge,
}: AuthShellProps) {
  if (layout === "phone") {
    return (
      <PhoneColumn>
        <PhoneIntro title={title} description={subtitle} />
        {children}
        {footer ? (
          <div className="mt-auto flex flex-col items-center gap-2.5 pt-6 text-sm font-semibold">
            {footer}
          </div>
        ) : null}
      </PhoneColumn>
    );
  }

  return (
    <CenteredPanel width={width}>
      {badge}
      <PanelHeading>{title}</PanelHeading>
      {subtitle ? <Lead>{subtitle}</Lead> : null}
      {children}
      {footer ? <div className="flex flex-col gap-2.5">{footer}</div> : null}
    </CenteredPanel>
  );
}

export interface AuthFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "tel" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  inputMode?: "text" | "email" | "tel" | "numeric";
  /** A 6-digit code typed into one field, shown with spaced digits. */
  code?: boolean;
  maxLength?: number;
  /** Field-level issues from the mapper, rendered under the input (AC-7). */
  issues?: string[];
}

/** A labelled 48px input with an inline hint and one message per server-side field issue. */
export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
  error,
  autoComplete,
  required = false,
  disabled = false,
  inputMode,
  code = false,
  maxLength,
  issues = [],
}: AuthFieldProps) {
  const errors = error ? [error, ...issues] : issues;
  return (
    <TextField
      id={id}
      name={id}
      label={label}
      type={type}
      value={value}
      inputMode={inputMode}
      autoComplete={autoComplete}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      code={code}
      maxLength={maxLength}
      hint={hint}
      errors={errors}
      dir={type === "email" || type === "tel" || code ? "ltr" : "auto"}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

/** Links under a form: centred and wrapping. */
export function AuthLinkRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm font-normal text-[var(--te-ink-muted)]">
      {children}
    </div>
  );
}
