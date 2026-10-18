import { useRouterState } from "@tanstack/react-router";
import { AdminScreenLink, type AdminSlug } from "./admin-links";
import { t } from "@trips-app/i18n";

interface AdminNavArea {
  slug: AdminSlug;
  label: string;
}

export const ADMIN_NAV_AREAS: readonly AdminNavArea[] = [
  {
    slug: "admin-home",
    get label() {
      return t("screen.admin.nav.adminHome");
    },
  },
  {
    slug: "application-queue",
    get label() {
      return t("screen.admin.nav.applicationQueue");
    },
  },
  {
    slug: "users-and-entities-directory",
    get label() {
      return t("screen.admin.nav.usersAndEntitiesDirectory");
    },
  },
  {
    slug: "lab-tests-queue",
    get label() {
      return t("screen.admin.nav.labTestsQueue");
    },
  },
  {
    slug: "plans-catalog",
    get label() {
      return t("screen.admin.nav.plansCatalog");
    },
  },
  {
    slug: "platform-coupons",
    get label() {
      return t("screen.admin.nav.platformCoupons");
    },
  },
  {
    slug: "deal-audit-list",
    get label() {
      return t("screen.admin.nav.dealAuditList");
    },
  },
  {
    slug: "disputes-queue",
    get label() {
      return t("screen.admin.nav.disputesQueue");
    },
  },
  {
    slug: "platform-financial-view",
    get label() {
      return t("screen.admin.nav.platformFinancialView");
    },
  },
  {
    slug: "trip-oversight",
    get label() {
      return t("screen.admin.nav.tripOversight");
    },
  },
  {
    slug: "audit-log",
    get label() {
      return t("screen.admin.nav.auditLog");
    },
  },
  {
    slug: "feature-flags-and-platform-configuration",
    get label() {
      return t("screen.admin.nav.featureFlagsAndPlatformConfiguration");
    },
  },
  {
    slug: "operations-health-dashboard",
    get label() {
      return t("screen.admin.nav.operationsHealthDashboard");
    },
  },
];

export interface AdminNavProps {
  /** The area the person is in. It is marked aria-current="page". */
  current: AdminSlug;
}

export function AdminNav({ current }: AdminNavProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }
  return (
    <nav aria-label={t("screen.admin.common.adminNav.adminAreas")}>
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
