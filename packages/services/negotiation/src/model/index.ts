// Entities and aggregates with their invariants. No I/O.
import {
  type CurrencyCode,
  findPlanCatalogEntry,
  type Money,
  money,
  type NegotiationOfferParty,
  type NegotiationStatus,
  type PlatformSupplierRole,
  type UserRole,
} from "@trips-app/domain";

export {
  type CurrencyCode,
  findPlanCatalogEntry,
  type Money,
  money,
  type NegotiationOfferParty,
  type NegotiationStatus,
  type PlatformSupplierRole,
  type UserRole,
};

export const PLATFORM_SUPPLIER_ROLES = [
  "platform_driver",
  "platform_photographer",
] as const satisfies readonly PlatformSupplierRole[];

export const NEGOTIATION_STATUSES = [
  "pending_supplier",
  "countered_by_supplier",
  "countered_by_org",
  "accepted",
  "declined",
  "expired",
  "cancelled",
] as const satisfies readonly NegotiationStatus[];

export const SUPPORTED_CURRENCIES = [
  "EGP",
  "SAR",
  "AED",
] as const satisfies readonly CurrencyCode[];

export function isActiveNegotiationStatus(status: NegotiationStatus): boolean {
  return (
    status === "pending_supplier" ||
    status === "countered_by_supplier" ||
    status === "countered_by_org"
  );
}
