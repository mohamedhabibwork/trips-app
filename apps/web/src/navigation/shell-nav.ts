// Sidebar items of the organization dashboard and the admin console, in the order the designs show
// them (docs/design/web/organization/SCR-ORG-01, docs/design/web/admin/SCR-ADM-01). Each item opens
// the first screen of its section; a page is highlighted by the `section` in its web route.
import { pathFor } from "./web-routes";

export interface ShellNavItem {
  section: string;
  labelKey: string;
  screenId: string;
}

const item = (section: string, labelKey: string, screenId: string): ShellNavItem => ({
  section,
  labelKey,
  screenId,
});

export const ORGANIZATION_NAV: readonly ShellNavItem[] = [
  item("home", "component.shell.org.nav.home", "SCR-ORG-01"),
  item("trips", "component.shell.org.nav.trips", "SCR-ORG-04"),
  item("vehicles", "component.shell.org.nav.vehicles", "SCR-ORG-16"),
  item("staffing", "component.shell.org.nav.staffing", "SCR-ORG-19"),
  item("bookings", "component.shell.org.nav.bookings", "SCR-ORG-23"),
  item("coupons", "component.shell.org.nav.coupons", "SCR-ORG-27"),
  item("accounting", "component.shell.org.nav.accounting", "SCR-ORG-30"),
  item("employees", "component.shell.org.nav.employees", "SCR-ORG-34"),
  item("invoices", "component.shell.org.nav.invoices", "SCR-ORG-37"),
  item("reports", "component.shell.org.nav.reports", "SCR-ORG-39"),
  item("live", "component.shell.org.nav.live", "SCR-ORG-40"),
  item("subscription", "component.shell.org.nav.subscription", "SCR-ORG-33"),
  item("settings", "component.shell.org.nav.settings", "SCR-ORG-03"),
];

export const ADMIN_NAV: readonly ShellNavItem[] = [
  item("home", "component.shell.admin.nav.home", "SCR-ADM-01"),
  item("applications", "component.shell.admin.nav.applications", "SCR-ADM-02"),
  item("directory", "component.shell.admin.nav.directory", "SCR-ADM-07"),
  item("labTests", "component.shell.admin.nav.labTests", "SCR-ADM-12"),
  item("plans", "component.shell.admin.nav.plans", "SCR-ADM-15"),
  item("coupons", "component.shell.admin.nav.coupons", "SCR-ADM-19"),
  item("disputes", "component.shell.admin.nav.disputes", "SCR-ADM-23"),
  item("money", "component.shell.admin.nav.money", "SCR-ADM-25"),
  item("trips", "component.shell.admin.nav.trips", "SCR-ADM-29"),
  item("audit", "component.shell.admin.nav.audit", "SCR-ADM-30"),
  item("notifications", "component.shell.admin.nav.notifications", "SCR-ADM-31"),
  item("platform", "component.shell.admin.nav.platform", "SCR-ADM-32"),
];

export function navHref(navItem: ShellNavItem): string {
  return pathFor(navItem.screenId);
}
