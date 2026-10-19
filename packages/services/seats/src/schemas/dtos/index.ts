// Request and response shapes derived from the validation schemas.
import type { z } from "zod/v4";

import type {
  assignSeatByOrgInputSchema,
  getSeatMapInputSchema,
  holdSeatsInputSchema,
  releaseSeatHoldInputSchema,
} from "../validation";

export type GetSeatMapInput = z.infer<typeof getSeatMapInputSchema>;
export type HoldSeatsInput = z.infer<typeof holdSeatsInputSchema>;
export type ReleaseSeatHoldInput = z.infer<typeof releaseSeatHoldInputSchema>;
export type AssignSeatByOrgInput = z.infer<typeof assignSeatByOrgInputSchema>;
