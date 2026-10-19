// The URL of every web screen (docs/design/web), in one table.
//
// `path` is a pattern: static segments plus `$name` params. Every page has its own file route under
// `routes/` with the same path (`web-routes.test.ts` checks this), and links are built from the
// screen ID alone. Screens that are components rather than pages (dialogs, banners, the seat map)
// have no path; they are mounted inside other pages.
import type { ScreenSurface } from "@/screens/types";

export type WebArea = "public" | "organization" | "admin";

export interface WebRoute {
  /** Screen ID from the design canvases, e.g. `SCR-ORG-04`. */
  id: string;
  /** Full path pattern, e.g. `/business/trips/$tripId`. */
  path: string;
  /** Which shell frames the page. */
  area: WebArea;
  /** Sidebar section the page belongs to (organization and admin only). */
  section?: string;
  /** A public-area page that still needs a session (any role), e.g. the notification centre. */
  signedIn?: boolean;
  /**
   * A second URL of a screen that already has one, e.g. trip wizard step 1 for a saved draft.
   * It matches like any route, but `pathFor()` builds the screen's main URL.
   */
  alias?: boolean;
}

export const ORGANIZATION_BASE = "/business";
export const ADMIN_BASE = "/admin";

const org = (id: string, path: string, section: string): WebRoute => ({
  id,
  path: `${ORGANIZATION_BASE}${path}`,
  area: "organization",
  section,
});

const admin = (id: string, path: string, section: string): WebRoute => ({
  id,
  path: `${ADMIN_BASE}${path}`,
  area: "admin",
  section,
});

const pub = (id: string, path: string): WebRoute => ({ id, path, area: "public" });

const signedIn = (id: string, path: string): WebRoute => ({ ...pub(id, path), signedIn: true });

export const WEB_ROUTES: readonly WebRoute[] = [
  // Public site, sign-up and sign-in (SCR-PUB)
  pub("SCR-PUB-01", "/"),
  pub("SCR-PUB-02", "/sign-up"),
  pub("SCR-PUB-03", "/sign-up/traveler"),
  pub("SCR-PUB-04", "/sign-up/driver"),
  pub("SCR-PUB-05", "/sign-up/photographer"),
  pub("SCR-PUB-06", "/sign-up/organization"),
  pub("SCR-PUB-07", "/verify"),
  pub("SCR-PUB-08", "/sign-in"),
  pub("SCR-PUB-09", "/admin/sign-in"),
  pub("SCR-PUB-10", "/admin/sign-in/authenticator"),
  pub("SCR-PUB-11", "/business/sign-in"),
  pub("SCR-PUB-12", "/business/sign-in/set-up-code"),
  pub("SCR-PUB-13", "/reset-password"),
  pub("SCR-PUB-14", "/session-expired"),
  pub("SCR-PUB-15", "/account/suspended"),
  pub("SCR-PUB-16", "/account/deletion"),
  signedIn("SCR-PUB-17", "/application-status"),
  signedIn("SCR-PUB-18", "/application-status/appeal"),
  pub("SCR-PUB-19", "/crew/sign-in"),

  // Shared pages (SCR-SHR). 01, 08–10 and 13–16 are components, not pages.
  pub("SCR-SHR-02", "/forbidden"),
  pub("SCR-SHR-04", "/unauthorized"),
  pub("SCR-SHR-06", "/unavailable"),
  pub("SCR-SHR-07", "/maintenance"),
  signedIn("SCR-SHR-11", "/notifications"),
  signedIn("SCR-SHR-12", "/receipts/$receiptId"),

  // Organization dashboard (SCR-ORG)
  org("SCR-ORG-01", "", "home"),
  org("SCR-ORG-02", "/invitation/$token", "employees"),
  org("SCR-ORG-03", "/settings", "settings"),
  org("SCR-ORG-04", "/trips", "trips"),
  // The wizard creates the draft on step 1, then every step carries the trip in its URL.
  org("SCR-ORG-05", "/trips/new", "trips"),
  { ...org("SCR-ORG-05", "/trips/$tripId/edit", "trips"), alias: true },
  org("SCR-ORG-06", "/trips/$tripId/edit/schedule", "trips"),
  org("SCR-ORG-07", "/trips/$tripId/edit/vehicles", "trips"),
  org("SCR-ORG-08", "/trips/$tripId/edit/staffing", "trips"),
  org("SCR-ORG-09", "/trips/$tripId/edit/programs", "trips"),
  org("SCR-ORG-10", "/trips/$tripId/edit/seating", "trips"),
  org("SCR-ORG-11", "/trips/$tripId/edit/pricing", "trips"),
  org("SCR-ORG-12", "/trips/$tripId/edit/publish", "trips"),
  org("SCR-ORG-13", "/trips/$tripId/programs/$programId", "trips"),
  org("SCR-ORG-14", "/trips/$tripId", "trips"),
  org("SCR-ORG-15", "/trips/$tripId/cancel", "trips"),
  org("SCR-ORG-16", "/vehicles", "vehicles"),
  org("SCR-ORG-17", "/vehicles/$vehicleId", "vehicles"),
  org("SCR-ORG-18", "/vehicles/types", "vehicles"),
  org("SCR-ORG-19", "/staffing", "staffing"),
  org("SCR-ORG-20", "/staffing/own-suppliers", "staffing"),
  org("SCR-ORG-21", "/staffing/suppliers", "staffing"),
  org("SCR-ORG-22", "/staffing/deals/$dealId", "staffing"),
  org("SCR-ORG-23", "/bookings", "bookings"),
  org("SCR-ORG-24", "/bookings/$bookingId", "bookings"),
  org("SCR-ORG-25", "/trips/$tripId/seats", "trips"),
  org("SCR-ORG-26", "/trips/$tripId/enrollment", "trips"),
  org("SCR-ORG-27", "/coupons", "coupons"),
  org("SCR-ORG-28", "/coupons/$couponId", "coupons"),
  org("SCR-ORG-29", "/coupons/$couponId/analytics", "coupons"),
  org("SCR-ORG-30", "/accounting", "accounting"),
  org("SCR-ORG-31", "/accounting/ledger", "accounting"),
  org("SCR-ORG-32", "/accounting/settlements", "accounting"),
  org("SCR-ORG-33", "/subscription", "subscription"),
  org("SCR-ORG-34", "/employees", "employees"),
  org("SCR-ORG-35", "/employees/invite", "employees"),
  org("SCR-ORG-36", "/settings/crm", "settings"),
  org("SCR-ORG-37", "/invoices", "invoices"),
  org("SCR-ORG-38", "/invoices/new", "invoices"),
  org("SCR-ORG-39", "/reports", "reports"),
  org("SCR-ORG-40", "/live", "live"),
  org("SCR-ORG-41", "/reports/trips/$tripId", "reports"),
  org("SCR-ORG-42", "/reports/child-safety", "reports"),

  // Admin console (SCR-ADM)
  admin("SCR-ADM-01", "", "home"),
  admin("SCR-ADM-02", "/applications", "applications"),
  admin("SCR-ADM-03", "/applications/$applicationId", "applications"),
  admin("SCR-ADM-04", "/applications/$applicationId/request-changes", "applications"),
  admin("SCR-ADM-05", "/applications/$applicationId/reject", "applications"),
  admin("SCR-ADM-06", "/applications/appeals/$appealId", "applications"),
  admin("SCR-ADM-07", "/directory", "directory"),
  admin("SCR-ADM-08", "/directory/$entityId", "directory"),
  admin("SCR-ADM-09", "/directory/$entityId/suspension", "directory"),
  admin("SCR-ADM-10", "/directory/data-requests", "directory"),
  admin("SCR-ADM-11", "/staff", "directory"),
  admin("SCR-ADM-12", "/lab-tests", "labTests"),
  admin("SCR-ADM-13", "/lab-tests/$labTestId", "labTests"),
  admin("SCR-ADM-14", "/lab-tests/request", "labTests"),
  admin("SCR-ADM-15", "/plans", "plans"),
  admin("SCR-ADM-16", "/plans/$planId", "plans"),
  admin("SCR-ADM-17", "/plans/subscriptions", "plans"),
  admin("SCR-ADM-18", "/plans/revenue", "plans"),
  admin("SCR-ADM-19", "/coupons", "coupons"),
  admin("SCR-ADM-20", "/coupons/$couponId", "coupons"),
  admin("SCR-ADM-21", "/deals", "coupons"),
  admin("SCR-ADM-22", "/deals/$dealId", "coupons"),
  admin("SCR-ADM-23", "/disputes", "disputes"),
  admin("SCR-ADM-24", "/disputes/$disputeId", "disputes"),
  admin("SCR-ADM-25", "/money", "money"),
  admin("SCR-ADM-26", "/money/payouts", "money"),
  admin("SCR-ADM-27", "/money/reconciliation", "money"),
  admin("SCR-ADM-28", "/money/settlements", "money"),
  admin("SCR-ADM-29", "/trips", "trips"),
  admin("SCR-ADM-30", "/audit-log", "audit"),
  admin("SCR-ADM-31", "/notifications", "notifications"),
  admin("SCR-ADM-32", "/platform", "platform"),
  admin("SCR-ADM-33", "/platform/health", "platform"),
];

const BY_ID = new Map(WEB_ROUTES.filter((route) => !route.alias).map((route) => [route.id, route]));

export function webRouteById(id: string): WebRoute | undefined {
  return BY_ID.get(id);
}

/** Every URL of a screen: its main one first, then its aliases. */
export function webRoutesById(id: string): WebRoute[] {
  return WEB_ROUTES.filter((route) => route.id === id).sort(
    (a, b) => Number(a.alias ?? false) - Number(b.alias ?? false),
  );
}

/** Builds the URL of a screen. Throws for an unknown ID or a missing param, so a bad link fails loudly. */
export function pathFor(id: string, params: Readonly<Record<string, string>> = {}): string {
  const route = BY_ID.get(id);
  if (!route) throw new Error(`No web route for screen ${id}`);
  const path = route.path.replace(/\$([A-Za-z]+)/g, (_, name: string) => {
    const value = params[name];
    if (!value) throw new Error(`Screen ${id} needs the "${name}" param`);
    return encodeURIComponent(value);
  });
  return path === "" ? "/" : path;
}

export interface RouteMatch {
  route: WebRoute;
  params: Record<string, string>;
}

function splitPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

/** Static segments outrank params, so `/vehicles/types` wins over `/vehicles/$vehicleId`. */
function specificity(route: WebRoute): number[] {
  return splitPath(route.path).map((segment) => (segment.startsWith("$") ? 1 : 2));
}

function compareSpecificity(a: WebRoute, b: WebRoute): number {
  const sa = specificity(a);
  const sb = specificity(b);
  for (let index = 0; index < Math.min(sa.length, sb.length); index += 1) {
    const diff = (sb[index] ?? 0) - (sa[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function matchOne(route: WebRoute, segments: readonly string[]): Record<string, string> | null {
  const pattern = splitPath(route.path);
  if (pattern.length !== segments.length) return null;
  const params: Record<string, string> = {};
  for (let index = 0; index < pattern.length; index += 1) {
    const expected = pattern[index] as string;
    const actual = segments[index] as string;
    if (expected.startsWith("$")) {
      params[expected.slice(1)] = decodeURIComponent(actual);
    } else if (expected !== actual) {
      return null;
    }
  }
  return params;
}

/** Finds the screen for a pathname within one area. File-routed pages are skipped: they match first. */
export function matchWebRoute(area: WebArea, pathname: string): RouteMatch | undefined {
  const segments = splitPath(pathname);
  const candidates = WEB_ROUTES.filter((route) => route.area === area).sort(compareSpecificity);
  for (const route of candidates) {
    const params = matchOne(route, segments);
    if (params) return { route, params };
  }
  return undefined;
}

/** The registry surface that holds a screen's component, from its ID prefix. */
export function surfaceForScreenId(id: string): ScreenSurface {
  if (id.startsWith("SCR-ORG")) return "organization";
  if (id.startsWith("SCR-ADM")) return "admin";
  if (id.startsWith("SCR-SHR")) return "shared";
  return "public";
}
