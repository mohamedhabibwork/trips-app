// Shared pieces of the vehicle screens (SCR-ORG-16, 17, 18): registration status and type names.
import { t } from "@trips-app/i18n";

import type { OrgOption } from "../common/org-form";
import { NO_VALUE, OrgBadge } from "../common/org-ui";

/** `vehicleId` of the editor URL that adds a vehicle instead of editing one. */
export const NEW_VEHICLE_ID = "new";

export type RegistrationStatus = "valid" | "pending_renewal" | "expired";

export function registrationLabel(status: RegistrationStatus): string {
  if (status === "valid") return t("screen.organization.vehicles.vehicleParts.registered");
  if (status === "pending_renewal")
    return t("screen.organization.vehicles.vehicleParts.pendingReview");
  return t("screen.organization.vehicles.vehicleParts.expired");
}

export function registrationOptions(): readonly OrgOption[] {
  return (["valid", "pending_renewal", "expired"] as const).map((status) => ({
    value: status,
    label: registrationLabel(status),
  }));
}

export function RegistrationBadge({ status }: { status: RegistrationStatus }) {
  const tone = status === "valid" ? "ok" : status === "pending_renewal" ? "warn" : "err";
  return <OrgBadge tone={tone}>{registrationLabel(status)}</OrgBadge>;
}

/** A vehicle type's name in the reader's language, else the other one. */
export function vehicleTypeName(
  type: { nameEn: string; nameAr: string } | null,
  locale: string,
): string {
  if (!type) return NO_VALUE;
  return (locale === "ar" ? type.nameAr || type.nameEn : type.nameEn || type.nameAr) || NO_VALUE;
}
