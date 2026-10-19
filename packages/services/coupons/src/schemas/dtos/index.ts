// Request and response shapes derived from the validation schemas.
import type { z } from "zod/v4";

import type {
  createCouponInputSchema,
  listCouponsInputSchema,
  updateCouponStatusInputSchema,
  validateCouponInputSchema,
} from "../validation";

export type CreateCouponInput = z.infer<typeof createCouponInputSchema>;
export type UpdateCouponStatusInput = z.infer<typeof updateCouponStatusInputSchema>;
export type ListCouponsInput = z.infer<typeof listCouponsInputSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponInputSchema>;
