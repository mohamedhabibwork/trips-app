// Shared frame for every auth screen: brand, language toggle, title, card body, footer links.
// All copy comes from the messages catalog through `useAuth().t` (PRD I1).
import { Link } from "@tanstack/react-router";
import { Button } from "@trips-app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@trips-app/ui/components/card";
import { Input } from "@trips-app/ui/components/input";
import { Label } from "@trips-app/ui/components/label";
import type { ReactNode } from "react";

import { useAuth } from "../auth-context";

export interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  const { t, locale, setLocale, direction } = useAuth();

  return (
    <div dir={direction} className="mx-auto w-full max-w-md px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          {t("auth.app.name")}
        </Link>
        <div className="flex items-center gap-1" role="group" aria-label={t("auth.app.tagline")}>
          <Button
            type="button"
            size="sm"
            variant={locale === "ar" ? "secondary" : "ghost"}
            onClick={() => setLocale("ar")}
          >
            AR
          </Button>
          <Button
            type="button"
            size="sm"
            variant={locale === "en" ? "secondary" : "ghost"}
            onClick={() => setLocale("en")}
          >
            EN
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
        </CardHeader>
        <CardContent className="grid gap-4">{children}</CardContent>
        {footer ? <CardFooter className="flex-col items-start gap-2">{footer}</CardFooter> : null}
      </Card>
    </div>
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
  /** Field-level issues from the mapper, rendered under the input (AC-7). */
  issues?: string[];
}

/** A labelled input with an inline hint and one message per server-side field issue. */
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
  issues = [],
}: AuthFieldProps) {
  const describedBy = issues.length > 0 || hint || error ? `${id}-help` : undefined;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={issues.length > 0 || Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      />
      <div id={describedBy} className="grid gap-0.5">
        {hint ? <p className="text-muted-foreground text-[11px]">{hint}</p> : null}
        {error ? <p className="text-destructive text-[11px]">{error}</p> : null}
        {issues.map((message) => (
          <p key={message} className="text-destructive text-[11px]">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}

/** A small link row used under the submit button. */
export function AuthLinkRow({ children }: { children: ReactNode }) {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-[11px]">
      {children}
    </div>
  );
}
