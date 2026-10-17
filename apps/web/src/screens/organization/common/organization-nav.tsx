import { OrgButtonLink } from "./org-link";
import type { OrgSlug } from "./org-routes";

interface OrganizationNavItem {
  slug: OrgSlug;
  label: string;
}

/** The surface's main areas, in the order the workspace navigation shows them. */
export const ORGANIZATION_NAV_ITEMS: readonly OrganizationNavItem[] = [
  { slug: "workspace-home", label: "Workspace home" },
  { slug: "trips-list", label: "Trips" },
  { slug: "bookings-and-travelers", label: "Bookings" },
  { slug: "coupons-list", label: "Coupons" },
  { slug: "trip-accounting", label: "Accounting" },
  { slug: "subscription-and-billing", label: "Subscription" },
  { slug: "employees-list", label: "Employees" },
  { slug: "invoices-list", label: "Invoices" },
  { slug: "analytics-and-reports", label: "Analytics" },
  { slug: "live-operations", label: "Live operations" },
  { slug: "organization-profile-settings-and-branding", label: "Settings" },
];

interface OrganizationNavProps {
  currentSlug: OrgSlug;
}

/** Surface navigation. The current area is marked with aria-current="page". */
export function OrganizationNav({ currentSlug }: OrganizationNavProps) {
  return (
    <nav aria-label="Organization areas">
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
