// Request and response shapes derived from the validation schemas.
import type { z } from "zod/v4";

import type {
  createProgramInputSchema,
  deleteProgramInputSchema,
  listPublicTripProgramsInputSchema,
  listTripProgramsInputSchema,
  updateProgramInputSchema,
} from "../validation";

export type CreateProgramInput = z.infer<typeof createProgramInputSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramInputSchema>;
export type DeleteProgramInput = z.infer<typeof deleteProgramInputSchema>;
export type ListTripProgramsInput = z.infer<typeof listTripProgramsInputSchema>;
export type ListPublicTripProgramsInput = z.infer<typeof listPublicTripProgramsInputSchema>;
