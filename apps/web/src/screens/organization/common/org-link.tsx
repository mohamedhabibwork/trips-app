// Links between organization pages. Every link is a real `/business/...` URL built by `pathFor()`
// (navigation/web-routes.ts); a detail link takes the record's id, e.g. `params={{ tripId }}`.
import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "@trips-app/ui/lib/utils";

import { usePathname } from "@/components/shells/shell-content";
import { matchWebRoute } from "@/navigation/web-routes";

import { orgHref, type OrgParams, type OrgSlug } from "./org-routes";
import { orgButtonClass, type OrgButtonVariant } from "./org-ui";

interface OrgLinkProps {
  slug: OrgSlug;
  params?: OrgParams;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/** Text link to another organization page. */
export function OrgLink({ slug, params, children, className, onClick }: OrgLinkProps) {
  return (
    <Link
      to={orgHref(slug, params)}
      className={cn(
        "font-semibold text-[var(--te-primary-text)] underline-offset-4 hover:underline",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

interface OrgButtonLinkProps extends OrgLinkProps {
  variant?: OrgButtonVariant;
}

/** Link drawn as a button, for navigation that reads as an action ("Create trip"). */
export function OrgButtonLink({
  slug,
  params,
  children,
  variant = "primary",
  className,
  onClick,
}: OrgButtonLinkProps) {
  return (
    <Link
      to={orgHref(slug, params)}
      className={orgButtonClass(variant, className)}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

/** Returns a function that opens an organization page after an action. */
export function useOrgNavigate() {
  const navigate = useNavigate();
  return (slug: OrgSlug, params?: OrgParams) => navigate({ to: orgHref(slug, params) });
}

/** Params of the page being shown, e.g. `{ tripId }` on `/business/trips/abc`. */
export function useOrgParams(): Readonly<Record<string, string>> {
  const pathname = usePathname();
  return matchWebRoute("organization", pathname)?.params ?? {};
}
