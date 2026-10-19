// Coupons service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "coupons";
export { COUPONS_ERROR_CODE_MAP, CouponsServiceError, mapCouponsError } from "./errors";
export {
  calculateCouponDiscountMinor,
  COUPON_DISCOUNT_TYPES,
  COUPON_SCOPES,
  COUPON_STATUSES,
  normalizeCouponCode,
  SUPPORTED_CURRENCIES,
} from "./model";
export { routes } from "./routes";
export {
  createCouponInputSchema,
  listCouponsInputSchema,
  updateCouponStatusInputSchema,
  validateCouponInputSchema,
} from "./schemas/validation";
export { createCouponsService } from "./services";
export type * from "./types";
