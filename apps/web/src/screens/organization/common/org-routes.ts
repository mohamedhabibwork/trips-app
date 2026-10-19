import { pathFor, webRouteById } from "@/navigation/web-routes";

/** Slug of every organization screen, in spec order (SCR-ORG-01 to SCR-ORG-42). */
export const ORG_SLUGS = [
  "workspace-home",
  "employee-invitation-acceptance",
  "organization-profile-settings-and-branding",
  "trips-list",
  "trip-wizard-step-1-basics",
  "trip-wizard-step-2-schedule-and-route",
  "trip-wizard-step-3-vehicles",
  "trip-wizard-step-4-staffing",
  "trip-wizard-step-5-programs",
  "trip-wizard-step-6-seating",
  "trip-wizard-step-7-pricing-and-capacity",
  "trip-wizard-step-8-publish",
  "program-editor",
  "trip-command-view",
  "cancel-trip-decision",
  "vehicle-registry",
  "vehicle-editor",
  "vehicle-types-and-seat-layout",
  "staffing-board",
  "organization-owned-drivers-and-photographers",
  "platform-supplier-search-and-deal-start",
  "deal-detail-and-negotiation",
  "bookings-and-travelers",
  "booking-detail",
  "seat-map-and-seat-assignment",
  "program-enrollment-report",
  "coupons-list",
  "coupon-editor",
  "coupon-analytics",
  "trip-accounting",
  "ledger-and-exports",
  "settlements",
  "subscription-and-billing",
  "employees-list",
  "employee-invitation-and-permissions",
  "crm-and-webhooks",
  "invoices-list",
  "issue-invoice-b2b-or-b2c",
  "analytics-and-reports",
  "live-operations",
  "trip-report-review",
  "child-safety-reports",
] as const;

/** Links accept only these, so a link to a missing screen fails type checking. */
export type OrgSlug = (typeof ORG_SLUGS)[number];

/** Screen ID of a slug, e.g. `trips-list` → `SCR-ORG-04`. */
export function orgScreenId(slug: OrgSlug): string {
  return `SCR-ORG-${String(ORG_SLUGS.indexOf(slug) + 1).padStart(2, "0")}`;
}

/** Params a detail page needs in its URL, e.g. `tripId` for `/business/trips/$tripId`. */
export function orgParamNames(slug: OrgSlug): string[] {
  const path = webRouteById(orgScreenId(slug))?.path ?? "";
  return [...path.matchAll(/\$([A-Za-z]+)/g)].map((match) => match[1] as string);
}

/** Where a detail link goes while the record it needs is unknown: the section's list page. */
const PARAM_FALLBACK: Record<string, OrgSlug> = {
  tripId: "trips-list",
  programId: "trips-list",
  vehicleId: "vehicle-registry",
  dealId: "staffing-board",
  bookingId: "bookings-and-travelers",
  couponId: "coupons-list",
  token: "employees-list",
};

export type OrgParams = Readonly<Record<string, string | null | undefined>>;

/** URL of an organization screen. A missing detail param sends the link to the section list. */
export function orgHref(slug: OrgSlug, params: OrgParams = {}): string {
  const names = orgParamNames(slug);
  const missing = names.find((name) => !params[name]);
  if (missing) {
    return pathFor(orgScreenId(PARAM_FALLBACK[missing] ?? "workspace-home"));
  }
  const filled: Record<string, string> = {};
  for (const name of names) filled[name] = params[name] as string;
  return pathFor(orgScreenId(slug), filled);
}
