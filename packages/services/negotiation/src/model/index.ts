// Entities and aggregates with their invariants. No I/O.
import {
  CURRENCY_CODES,
  type CurrencyCode,
  findPlanCatalogEntry,
  type Money,
  money,
  type NegotiationOfferParty,
  NEGOTIATION_STATUSES,
  type NegotiationStatus,
  PLATFORM_SUPPLIER_ROLES,
  type PlatformSupplierRole,
  type UserRole,
} from "@trips-app/domain";

export {
  CURRENCY_CODES,
  CURRENCY_CODES as SUPPORTED_CURRENCIES,
  type CurrencyCode,
  findPlanCatalogEntry,
  type Money,
  money,
  type NegotiationOfferParty,
  NEGOTIATION_STATUSES,
  type NegotiationStatus,
  PLATFORM_SUPPLIER_ROLES,
  type PlatformSupplierRole,
  type UserRole,
};

export function isActiveNegotiationStatus(status: NegotiationStatus): boolean {
  return (
    status === "pending_supplier" ||
    status === "countered_by_supplier" ||
    status === "countered_by_org"
  );
}
