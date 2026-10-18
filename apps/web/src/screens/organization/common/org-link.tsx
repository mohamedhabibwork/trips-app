import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type { TeButtonVariant } from "@trips-app/ui/components/te-button";
import { cn } from "@trips-app/ui/lib/utils";
import { t } from "@trips-app/i18n";

import type { OrgSlug } from "./org-routes";

interface OrgLinkProps {
  slug: OrgSlug;
  children: ReactNode;
  current?: boolean;
  className?: string;
  onClick?: () => void;
}

/** Text link to another organization screen. */
export function OrgLink({ slug, children, current = false, className, onClick }: OrgLinkProps) {
  return (
    <Link
      to="/screens/$surface/$slug"
      params={{ surface: "organization", slug }}
      aria-current={current ? "page" : undefined}
      className={cn("te-link", className)}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

interface OrgButtonLinkProps extends OrgLinkProps {
  variant?: TeButtonVariant;
}

/** Link that looks like a TeButton, for navigation that reads as an action. */
export function OrgButtonLink({
  slug,
  children,
  current = false,
  variant = "primary",
  className,
  onClick,
}: OrgButtonLinkProps) {
  return (
    <Link
      to="/screens/$surface/$slug"
      params={{ surface: "organization", slug }}
      aria-current={current ? "page" : undefined}
      className={cn("te-button", `te-button--${variant}`, className)}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

/** Returns a function that navigates to an organization screen after an action. */
export function useOrgNavigate() {
  const navigate = useNavigate();
  return (slug: OrgSlug) =>
    navigate({ to: "/screens/$surface/$slug", params: { surface: "organization", slug } });
}

interface WorkspaceBackLinkProps {
  parent?: { slug: OrgSlug; label: string };
}

/** Back to workspace home, plus an optional link to the parent screen. */
export function WorkspaceBackLink({ parent }: WorkspaceBackLinkProps) {
  return (
    <nav
      aria-label={t("screen.organization.common.orgLink.backLinks")}
      className="flex flex-wrap gap-4"
    >
      <OrgLink slug="workspace-home">
        {t("screen.organization.common.orgLink.backToWorkspace")}
      </OrgLink>
      {parent ? <OrgLink slug={parent.slug}>{parent.label}</OrgLink> : null}
    </nav>
  );
}
