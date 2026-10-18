// The layout of the shared error pages (SCR-SHR-02..06): a round icon, the status code, a title,
// what happens next, and one primary action. Drawn at phone width; centred in a column on desktop.
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { cn } from "@trips-app/ui/lib/utils";
import type { ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";

type ErrorTone = "danger" | "warning" | "info";

const ICON_TONE: Record<ErrorTone, string> = {
  danger: "bg-[var(--te-danger-soft)] text-[var(--te-danger)]",
  warning: "bg-[var(--te-warning-soft)] text-[var(--te-warning)]",
  info: "bg-[var(--te-info-soft)] text-[var(--te-ink)]",
};

interface ErrorPageProps {
  status: 401 | 403 | 404 | 500 | 503;
  icon: TeIconName;
  tone: ErrorTone;
  title: string;
  body: string;
  /** The primary action, full width (a button or a link styled as one). */
  action: ReactNode;
  /** A link under the action ("Go to home"). */
  secondary?: ReactNode;
  /** Extra line under the body (the support reference). */
  note?: ReactNode;
}

export function ErrorPage({
  status,
  icon,
  tone,
  title,
  body,
  action,
  secondary,
  note,
}: ErrorPageProps) {
  const { t } = useAuth();
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-[420px] flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center"
    >
      <div
        className={cn(
          "flex size-[72px] items-center justify-center rounded-[var(--te-radius-pill)]",
          ICON_TONE[tone],
        )}
      >
        <TeIcon name={icon} className="size-8" />
      </div>
      <span className="text-[13px] font-semibold text-[var(--te-ink-muted)]">
        {t("screen.shared.errorPage.status", { status })}
      </span>
      <h1 className="m-0 text-2xl leading-8 font-bold">{title}</h1>
      <p className="m-0 text-base leading-6 text-[var(--te-ink-muted)]">{body}</p>
      {note}
      <div className="mt-2 flex w-full flex-col items-center gap-4">
        {action}
        {secondary}
      </div>
    </div>
  );
}
