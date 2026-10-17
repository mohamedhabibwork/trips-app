import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type { TeButtonVariant } from "@trips-app/ui/components/te-button";
import { cn } from "@trips-app/ui/lib/utils";

import type { OrgSlug } from "./org-routes";

interface OrgLinkProps {
  slug: OrgSlug;
  children: ReactNode;
  current?: boolean;
  className?: string;
}

/** Text link to another organization screen. */
export function OrgLink({ slug, children, current = false, className }: OrgLinkProps) {
  return (
    <Link
      to="/screens/$surface/$slug"
      params={{ surface: "organization", slug }}
      aria-current={current ? "page" : undefined}
      className={cn("te-link", className)}
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
}: OrgButtonLinkProps) {
  return (
    <Link
      to="/screens/$surface/$slug"
      params={{ surface: "organization", slug }}
      aria-current={current ? "page" : undefined}
      className={cn("te-button", `te-button--${variant}`, className)}
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
    <nav aria-label="Back links" className="flex flex-wrap gap-4">
      <OrgLink slug="workspace-home">Back to workspace</OrgLink>
      {parent ? <OrgLink slug={parent.slug}>{parent.label}</OrgLink> : null}
    </nav>
  );
}
