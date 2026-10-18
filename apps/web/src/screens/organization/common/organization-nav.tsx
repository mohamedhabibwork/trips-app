import { useRouterState } from "@tanstack/react-router";
import { OrgButtonLink } from "./org-link";
import type { OrgSlug } from "./org-routes";
import { t } from "@trips-app/i18n";

interface OrganizationNavItem {
  slug: OrgSlug;
  label: string;
}

/** The surface's main areas, in the order the workspace navigation shows them. */
export const ORGANIZATION_NAV_ITEMS: readonly OrganizationNavItem[] = [
  {
    slug: "workspace-home",
    get label() {
      return t("screen.organization.nav.workspaceHome");
    },
  },
  {
    slug: "trips-list",
    get label() {
      return t("screen.organization.nav.tripsList");
    },
  },
  {
    slug: "bookings-and-travelers",
    get label() {
      return t("screen.organization.nav.bookingsAndTravelers");
    },
  },
  {
    slug: "coupons-list",
    get label() {
      return t("screen.organization.nav.couponsList");
    },
  },
  {
    slug: "trip-accounting",
    get label() {
      return t("screen.organization.nav.tripAccounting");
    },
  },
  {
    slug: "subscription-and-billing",
    get label() {
      return t("screen.organization.nav.subscriptionAndBilling");
    },
  },
  {
    slug: "employees-list",
    get label() {
      return t("screen.organization.nav.employeesList");
    },
  },
  {
    slug: "invoices-list",
    get label() {
      return t("screen.organization.nav.invoicesList");
    },
  },
  {
    slug: "analytics-and-reports",
    get label() {
      return t("screen.organization.nav.analyticsAndReports");
    },
  },
  {
    slug: "live-operations",
    get label() {
      return t("screen.organization.nav.liveOperations");
    },
  },
  {
    slug: "organization-profile-settings-and-branding",
    get label() {
      return t("screen.organization.nav.organizationProfileSettingsAndBranding");
    },
  },
];

interface OrganizationNavProps {
  currentSlug: OrgSlug;
}

/** Surface navigation. The current area is marked with aria-current="page". Hidden when OrganizationShell already renders the sidebar. */
export function OrganizationNav({ currentSlug }: OrganizationNavProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname === "/business" || pathname.startsWith("/business/")) {
    return null;
  }
  return (
    <nav aria-label={t("screen.organization.common.organizationNav.organizationAreas")}>
      <ul className="flex flex-wrap gap-2">
        {ORGANIZATION_NAV_ITEMS.map((item) => {
          const current = item.slug === currentSlug;
          return (
            <li key={item.slug}>
              <OrgButtonLink
                slug={item.slug}
                current={current}
                variant={current ? "secondary" : "ghost"}
              >
                {item.label}
              </OrgButtonLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
