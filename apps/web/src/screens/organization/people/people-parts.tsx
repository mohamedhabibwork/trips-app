// Shared pieces of the people screens (SCR-ORG-02, 34, 35): permission areas and their badges.
import { t } from "@trips-app/i18n";

import { OrgBadge, type OrgTone } from "../common/org-ui";

/** Every permission area of the organization dashboard, in the order the artboards list them. */
export const PERMISSION_AREAS = [
  "trips",
  "bookings",
  "accounting",
  "coupons",
  "employees",
  "fleet",
  "subscription",
  "tracking",
  "settings",
] as const;

export type PermissionArea = (typeof PERMISSION_AREAS)[number];
export type PermissionLevel = "none" | "view" | "manage";
export type PermissionMatrix = Record<PermissionArea, PermissionLevel>;

export function permissionAreaLabel(area: PermissionArea): string {
  switch (area) {
    case "trips":
      return t("screen.organization.people.peopleParts.areaTrips");
    case "bookings":
      return t("screen.organization.people.peopleParts.areaBookings");
    case "accounting":
      return t("screen.organization.people.peopleParts.areaAccounting");
    case "coupons":
      return t("screen.organization.people.peopleParts.areaCoupons");
    case "employees":
      return t("screen.organization.people.peopleParts.areaEmployees");
    case "fleet":
      return t("screen.organization.people.peopleParts.areaFleet");
    case "subscription":
      return t("screen.organization.people.peopleParts.areaSubscription");
    case "tracking":
      return t("screen.organization.people.peopleParts.areaTracking");
    case "settings":
      return t("screen.organization.people.peopleParts.areaSettings");
  }
}

/** Areas the matrix opens (view or manage), in display order. */
export function grantedAreas(
  permissions: Partial<Record<string, string>> | null | undefined,
): PermissionArea[] {
  if (!permissions) return [];
  return PERMISSION_AREAS.filter((area) => {
    const level = permissions[area];
    return level !== undefined && level !== "none";
  });
}

interface AreaBadgesProps {
  areas: readonly PermissionArea[];
  tone?: OrgTone;
  /** Shown when no area is granted. */
  emptyLabel: string;
}

/** Badges naming each granted area; the word, not the colour, carries the meaning. */
export function AreaBadges({ areas, tone = "info", emptyLabel }: AreaBadgesProps) {
  if (areas.length === 0) return <span className="text-[var(--te-ink-muted)]">{emptyLabel}</span>;
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {areas.map((area) => (
        <li key={area}>
          <OrgBadge tone={tone} icon={tone === "ok" ? "check" : false}>
            {permissionAreaLabel(area)}
          </OrgBadge>
        </li>
      ))}
    </ul>
  );
}
