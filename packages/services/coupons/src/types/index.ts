// Shared TypeScript types, ids and enums. No I/O.
import type {
  CouponDiscountType,
  CouponScope,
  CouponStatus,
  CurrencyCode,
  UserRole,
} from "@trips-app/domain";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
  SharedErrorCode as CouponsErrorCode,
} from "@trips-app/domain";
export type * from "../schemas/dtos";

export interface CouponsActorContext {
  accountId: string;
  role: UserRole;
  activeTenantId?: string | null;
}

export interface CouponDto {
  id: string;
  scope: CouponScope;
  tenantId: string | null;
  ownerAccountId: string | null;
  code: string;
  titleAr: string;
  titleEn: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscountMinor: number | null;
  minOrderMinor: number;
  currencyCode: CurrencyCode;
  maxRedemptions: number | null;
  redemptionsCount: number;
  tripId: string | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  status: CouponStatus;
  createdAt: Date;
  updatedAt: Date;
}
