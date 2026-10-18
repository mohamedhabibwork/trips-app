// Links, buttons and URL params of the admin console. Every link is built with `pathFor()` from
// navigation/web-routes.ts, so it points at the real `/admin/...` URL of the screen.
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@trips-app/ui/lib/utils";

import { matchWebRoute, pathFor } from "@/navigation/web-routes";

/** Screen ID of an admin page, such as `SCR-ADM-03`. */
export type AdminScreenId = `SCR-ADM-${string}`;
export type AdminParams = Readonly<Record<string, string>>;

export type AdminActionVariant = "primary" | "secondary" | "danger" | "danger-outline" | "link";

const ACTION_BASE =
  "inline-flex items-center justify-center gap-2 rounded-[var(--te-radius-md)] border border-transparent px-5 py-3 text-sm leading-5 font-semibold whitespace-nowrap no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--te-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50";

const ACTION_VARIANT: Record<AdminActionVariant, string> = {
  primary:
    "bg-[var(--te-primary)] text-[var(--te-on-primary)] hover:shadow-[var(--te-card-shadow-hover)]",
  secondary:
    "border-[var(--te-control-border)] bg-[var(--te-surface-raised)] text-[var(--te-ink)] hover:bg-[var(--te-hairline)]",
  danger: "bg-[var(--te-danger)] text-[var(--te-on-danger)] hover:opacity-90",
  "danger-outline":
    "border-[var(--te-control-border)] bg-[var(--te-surface-raised)] text-[var(--te-danger)] hover:bg-[var(--te-danger-soft)]",
  link: "rounded-none border-0 bg-transparent p-0 text-[var(--te-primary-text)] underline underline-offset-2",
};

const SMALL = "px-3 py-1.5 text-[13px] leading-[18px]";

function actionClass(variant: AdminActionVariant, small: boolean, className?: string): string {
  return cn(ACTION_BASE, ACTION_VARIANT[variant], small && variant !== "link" && SMALL, className);
}

export interface AdminButtonProps extends ComponentProps<"button"> {
  variant?: AdminActionVariant;
  small?: boolean;
}

export function AdminButton({
  variant = "secondary",
  small = false,
  type = "button",
  className,
  ...props
}: AdminButtonProps) {
  return <button {...props} type={type} className={actionClass(variant, small, className)} />;
}

/** The URL of an admin screen, or `null` when a required param is missing. */
export function adminPath(screen: AdminScreenId, params: AdminParams = {}): string | null {
  try {
    return pathFor(screen, params);
  } catch {
    return null;
  }
}

export interface AdminLinkProps {
  screen: AdminScreenId;
  params?: AdminParams;
  variant?: AdminActionVariant;
  small?: boolean;
  ariaLabel?: string;
  className?: string;
  /** Runs before navigation, for example to remember the picked record. */
  onClick?: () => void;
  children: ReactNode;
}

/**
 * Link to another admin page. When a param the route needs is missing (no record to open yet) the
 * link renders as dimmed text, so it never points at a broken URL.
 */
export function AdminLink({
  screen,
  params,
  variant = "link",
  small = false,
  ariaLabel,
  className,
  onClick,
  children,
}: AdminLinkProps) {
  const href = adminPath(screen, params);
  const classes = actionClass(variant, small, className);
  if (!href) {
    return (
      <span aria-disabled="true" className={cn(classes, "cursor-not-allowed opacity-50")}>
        {children}
      </span>
    );
  }
  return (
    <Link to={href} aria-label={ariaLabel} onClick={onClick} className={classes}>
      {children}
    </Link>
  );
}

/** Moves to an admin page, for the step that follows an action. */
export function useAdminNavigate(): (screen: AdminScreenId, params?: AdminParams) => Promise<void> {
  const navigate = useNavigate();
  return async (screen, params) => {
    const href = adminPath(screen, params);
    if (href) await navigate({ to: href });
  };
}

/**
 * A param of the current admin URL, such as `applicationId` on `/admin/applications/<id>`. The
 * screens also render in the screen gallery (`/screens/admin/<slug>`), where the URL has no params;
 * `fallback` then supplies the record picked on the previous page.
 */
export function useAdminParam(name: string, fallback?: () => string | null): string | null {
  // Read from the router here, not from shells/shell-content: that module imports the screen
  // registry, which imports every screen, so going through it makes an import cycle.
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const fromUrl = matchWebRoute("admin", pathname)?.params[name];
  if (fromUrl) return fromUrl;
  return fallback ? fallback() : null;
}
