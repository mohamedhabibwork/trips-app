import { pathFor, webRouteById } from "@/navigation/web-routes";

/** Slug of every organization screen, in spec order (SCR-ORG-01 onwards). */
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
  "company-analytics",
  "trip-analytics",
  "customer-analytics",
  "provider-analytics",
  "page-analytics",
  "api-keys",
  "webhooks",
  "webhook-new",
  "webhook-detail",
  "my-organizations",
  "choose-workspace",
  "support",
  "roles-permissions",
  "passenger-roster",
  "crm-campaigns",
  "crm-campaign-new",
  "crm-customers",
  "crm-customer",
  "crm-leads",
  "crm-lead",
  "crm-inbox",
  "crm-reviews",
  "crm-segments",
  "choose-plan",
  "billing-checkout",
  "plan-ended",
  "b2b-invoice",
  "settlement-statement",
] as const;

/** Screen IDs whose number does not follow the slug order (the later design batches). */
const EXTENDED_SCREEN_IDS: Readonly<Partial<Record<OrgSlug, string>>> = {
  "company-analytics": "SCR-ORG-43",
  "trip-analytics": "SCR-ORG-44",
  "customer-analytics": "SCR-ORG-45",
  "provider-analytics": "SCR-ORG-46",
  "page-analytics": "SCR-ORG-47",
  "api-keys": "SCR-ORG-57",
  webhooks: "SCR-ORG-58",
  "webhook-new": "SCR-ORG-59",
  "webhook-detail": "SCR-ORG-60",
  "my-organizations": "SCR-ORG-61",
  "choose-workspace": "SCR-ORG-62",
  support: "SCR-ORG-63",
  "roles-permissions": "SCR-ORG-64",
  "passenger-roster": "SCR-ORG-65",
  "choose-plan": "SCR-ORG-66",
  "billing-checkout": "SCR-ORG-67",
  "plan-ended": "SCR-ORG-68",
  "b2b-invoice": "SCR-ORG-69",
  "settlement-statement": "SCR-ORG-70",
};

/** Links accept only these, so a link to a missing screen fails type checking. */
export type OrgSlug = (typeof ORG_SLUGS)[number];

/** Screen ID of a slug, e.g. `trips-list` → `SCR-ORG-04`. */
export function orgScreenId(slug: OrgSlug): string {
  const extended = EXTENDED_SCREEN_IDS[slug];
  if (extended) return extended;
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
  endpointId: "webhooks",
  customerId: "crm-customers",
  leadId: "crm-leads",
  invoiceId: "invoices-list",
  settlementId: "settlements",
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
