// Request and response shapes derived from the validation schemas.
import type { z } from "zod/v4";

import type {
  createNegotiationOfferInputSchema,
  listNegotiationsInputSchema,
  respondNegotiationOfferInputSchema,
} from "../validation";

export type CreateNegotiationOfferInput = z.infer<typeof createNegotiationOfferInputSchema>;
export type RespondNegotiationOfferInput = z.infer<typeof respondNegotiationOfferInputSchema>;
export type ListNegotiationsInput = z.infer<typeof listNegotiationsInputSchema>;
