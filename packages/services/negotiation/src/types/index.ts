// Shared TypeScript types, ids and enums. No I/O.
import type {
  CurrencyCode,
  Money,
  NegotiationOfferParty,
  NegotiationStatus,
  PlatformSupplierRole,
  UserRole,
} from "@trips-app/domain";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
  SharedErrorCode as NegotiationErrorCode,
} from "@trips-app/domain";
export type * from "../schemas/dtos";

export interface NegotiationActorContext {
  accountId: string;
  role: UserRole;
  activeTenantId?: string | null;
}

export interface SupplierNegotiationDto {
  id: string;
  tenantId: string;
  tripId: string;
  vehicleId: string | null;
  supplierAccountId: string;
  supplierRole: PlatformSupplierRole;
  status: NegotiationStatus;
  initialOffer: Money;
  initialOfferMinor: number;
  currentOffer: Money;
  currentOfferMinor: number;
  agreedPrice: Money | null;
  agreedPriceMinor: number | null;
  currencyCode: CurrencyCode;
  lastOfferedBy: NegotiationOfferParty;
  roundsCount: number;
  notes: string | null;
  expiresAt: Date;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
