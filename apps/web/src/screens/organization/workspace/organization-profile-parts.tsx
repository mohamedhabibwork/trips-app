// Helpers of SCR-ORG-03 Organization profile: the settings fields it reads, options and checks.
import { t } from "@trips-app/i18n";

import { NO_VALUE } from "../common/org-ui";
import type { OrgOption } from "../common/org-form";

/** The fields of `organization.getOrganizationSettings` this page reads. */
export interface ProfileSettings {
  organization: {
    legalEntityName: string;
    displayNameEn: string;
    displayNameAr: string;
    countryCode: string;
    headquartersAddress: string | null;
  };
  settings: {
    timeZone: string;
    taxNumber: string | null;
    billingAddress: string | null;
    logoUrl: string | null;
    primaryColorHex: string | null;
  };
  planEntitlements: { features: { customBranding: boolean } | null };
}

/** Time zones offered for the organization; the saved one is kept when it is not listed. */
const TIME_ZONES = [
  "Africa/Cairo",
  "Asia/Riyadh",
  "Asia/Dubai",
  "Asia/Kuwait",
  "Asia/Qatar",
  "Asia/Bahrain",
  "Asia/Muscat",
  "Asia/Amman",
  "Asia/Beirut",
  "Africa/Casablanca",
  "Africa/Tunis",
  "Europe/London",
  "UTC",
] as const;

export function timeZoneOptions(current: string): readonly OrgOption[] {
  const zones: readonly string[] = TIME_ZONES.includes(current as (typeof TIME_ZONES)[number])
    ? TIME_ZONES
    : [current, ...TIME_ZONES];
  return zones.map((zone) => ({ value: zone, label: zone }));
}

/** Country name in the reader's language, from its ISO code. */
export function countryName(code: string | null | undefined, locale: string): string {
  if (!code) return NO_VALUE;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Field errors of the branding inputs, shown once the form was submitted. */
export function brandingErrors(
  logoUrl: string,
  brandColor: string,
  check: boolean,
): { logo?: string; color?: string } {
  if (!check) return {};
  const logo = logoUrl.trim();
  const color = brandColor.trim();
  return {
    logo:
      logo && !isWebUrl(logo)
        ? t("screen.organization.workspace.organizationProfileParts.logoUrlInvalid")
        : undefined,
    color:
      color && !HEX_COLOR.test(color)
        ? t("screen.organization.workspace.organizationProfileParts.brandColorInvalid")
        : undefined,
  };
}
