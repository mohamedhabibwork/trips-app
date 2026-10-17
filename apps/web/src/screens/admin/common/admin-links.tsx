import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

/** Slugs of the 33 admin screens. Links accept only these, so a wrong slug fails the type check. */
export const ADMIN_SLUGS = [
  "admin-home",
  "application-queue",
  "application-review-detail",
  "request-changes-decision",
  "reject-with-reason-decision",
  "appeal-review",
  "users-and-entities-directory",
  "entity-detail",
  "suspend-or-reinstate-decision",
  "deletion-and-data-requests",
  "admin-staff-accounts",
  "lab-tests-queue",
  "lab-test-detail-and-decision",
  "request-lab-test-decision",
  "plans-catalog",
  "plan-editor",
  "subscriptions-and-overrides",
  "revenue-dashboard",
  "platform-coupons",
  "platform-coupon-editor",
  "deal-audit-list",
  "deal-audit-detail",
  "disputes-queue",
  "dispute-detail-and-refund-decision",
  "platform-financial-view",
  "payout-runs",
  "reconciliation-exceptions",
  "settlements-tracker",
  "trip-oversight",
  "audit-log",
  "notification-templates",
  "feature-flags-and-platform-configuration",
  "operations-health-dashboard",
] as const;

export type AdminSlug = (typeof ADMIN_SLUGS)[number];

export type AdminLinkVariant = "link" | "primary" | "secondary" | "ghost";

const LINK_CLASS: Record<AdminLinkVariant, string> = {
  link: "te-link",
  primary: "te-button te-button--primary",
  secondary: "te-button te-button--secondary",
  ghost: "te-button te-button--ghost",
};

export interface AdminScreenLinkProps {
  slug: AdminSlug;
  children: ReactNode;
  variant?: AdminLinkVariant;
  current?: boolean;
  ariaLabel?: string;
}

/** Link to another admin screen at /screens/admin/<slug>. */
export function AdminScreenLink({
  slug,
  children,
  variant = "link",
  current = false,
  ariaLabel,
}: AdminScreenLinkProps) {
  return (
    <Link
      to="/screens/$surface/$slug"
      params={{ surface: "admin", slug }}
      className={LINK_CLASS[variant]}
      aria-current={current ? "page" : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}

/** Returns a function that moves to an admin screen. Use it for steps that follow an action. */
export function useAdminNavigate(): (slug: AdminSlug) => Promise<void> {
  const navigate = useNavigate();
  return (slug) => navigate({ to: "/screens/$surface/$slug", params: { surface: "admin", slug } });
}
