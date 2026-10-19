// Request and response shapes derived from the validation schemas.
import type { z } from "zod/v4";

import type {
  checkSupplierAvailabilityInputSchema,
  deleteAvailabilityBlockInputSchema,
  listMyBlocksInputSchema,
  upsertAvailabilityBlockInputSchema,
} from "../validation";

export type ListMyBlocksInput = z.infer<typeof listMyBlocksInputSchema>;
export type UpsertAvailabilityBlockInput = z.infer<typeof upsertAvailabilityBlockInputSchema>;
export type DeleteAvailabilityBlockInput = z.infer<typeof deleteAvailabilityBlockInputSchema>;
export type CheckSupplierAvailabilityInput = z.infer<typeof checkSupplierAvailabilityInputSchema>;
