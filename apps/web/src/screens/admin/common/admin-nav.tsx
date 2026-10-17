import { AdminScreenLink, type AdminSlug } from "./admin-links";

interface AdminNavArea {
  slug: AdminSlug;
  label: string;
}

export const ADMIN_NAV_AREAS: readonly AdminNavArea[] = [
  { slug: "admin-home", label: "Home" },
  { slug: "application-queue", label: "Applications" },
  { slug: "users-and-entities-directory", label: "Users" },
  { slug: "lab-tests-queue", label: "Lab tests" },
  { slug: "plans-catalog", label: "Plans" },
  { slug: "platform-coupons", label: "Coupons" },
  { slug: "deal-audit-list", label: "Deals" },
  { slug: "disputes-queue", label: "Disputes" },
  { slug: "platform-financial-view", label: "Finance" },
  { slug: "trip-oversight", label: "Trips" },
  { slug: "audit-log", label: "Audit" },
  { slug: "feature-flags-and-platform-configuration", label: "Configuration" },
  { slug: "operations-health-dashboard", label: "Operations" },
];

export interface AdminNavProps {
  /** The area the person is in. It is marked aria-current="page". */
  current: AdminSlug;
}

export function AdminNav({ current }: AdminNavProps) {
  return (
    <nav aria-label="Admin areas">
      <ul className="flex flex-wrap gap-2">
        {ADMIN_NAV_AREAS.map((area) => {
          const isCurrent = area.slug === current;
          return (
            <li key={area.slug}>
              <AdminScreenLink
                slug={area.slug}
                variant={isCurrent ? "primary" : "ghost"}
                current={isCurrent}
              >
                {area.label}
              </AdminScreenLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
