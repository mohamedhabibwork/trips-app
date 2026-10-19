// Pieces shared by the staffing deal screens (SCR-ORG-21, SCR-ORG-22).
import type { ReactNode } from "react";

import { t } from "@trips-app/i18n";

import { NO_VALUE, OrgBadge, type OrgTone } from "../common/org-ui";

export type PlatformRole = "platform_driver" | "platform_photographer";

export type DealStatus =
  | "pending_supplier"
  | "countered_by_supplier"
  | "countered_by_org"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled";

interface RoutePoint {
  nameAr: string;
  nameEn: string;
}

interface TripRouteLike {
  origin?: RoutePoint | null;
  destinations?: readonly RoutePoint[];
}

function pointName(point: RoutePoint | null | undefined, locale: string): string {
  if (!point) return "";
  return (locale === "ar" ? point.nameAr || point.nameEn : point.nameEn || point.nameAr) || "";
}

/** "Nasr City to Hurghada", or whichever end is known. */
export function routeText(trip: TripRouteLike | null | undefined, locale: string): string {
  const from = pointName(trip?.origin, locale);
  const to = pointName(trip?.destinations?.[trip.destinations.length - 1], locale);
  if (from && to) return t("screen.organization.staffing.staffingParts.routeFromTo", { from, to });
  return from || to || NO_VALUE;
}

/** Minor units and currency as "150.00 EGP". */
export function formatMinor(minor: number | null | undefined, currency: string): string {
  if (minor === null || minor === undefined) return NO_VALUE;
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

export function platformRoleLabel(role: PlatformRole): string {
  return role === "platform_driver"
    ? t("screen.organization.staffing.staffingParts.driver")
    : t("screen.organization.staffing.staffingParts.photographer");
}

const STATUS_TONE: Record<DealStatus, OrgTone> = {
  pending_supplier: "neu",
  countered_by_supplier: "info",
  countered_by_org: "info",
  accepted: "ok",
  declined: "err",
  expired: "err",
  cancelled: "neu",
};

export function dealStatusLabel(status: DealStatus): string {
  switch (status) {
    case "pending_supplier":
      return t("screen.organization.staffing.staffingParts.proposed");
    case "countered_by_supplier":
      return t("screen.organization.staffing.staffingParts.counteredByProvider");
    case "countered_by_org":
      return t("screen.organization.staffing.staffingParts.counteredByOrganization");
    case "accepted":
      return t("screen.organization.staffing.staffingParts.accepted");
    case "declined":
      return t("screen.organization.staffing.staffingParts.rejected");
    case "expired":
      return t("screen.organization.staffing.staffingParts.expired");
    default:
      return t("screen.organization.staffing.staffingParts.cancelled");
  }
}

export function DealStatusBadge({ status }: { status: DealStatus }) {
  return (
    <OrgBadge tone={STATUS_TONE[status]} icon={status === "pending_supplier" ? false : undefined}>
      {dealStatusLabel(status)}
    </OrgBadge>
  );
}

/** A label over its value, as the artboards' detail grids show them. */
export function DetailItem({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-sm leading-5 font-semibold">{label}</dt>
      <dd className="m-0 text-sm leading-5">{children}</dd>
    </div>
  );
}

/** A label and value on one line ("Trip · Bus 3"). */
export function InlineDetail({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="text-sm leading-5">
      <span className="font-semibold">{label}</span> · {children}
    </div>
  );
}
