// Request and response DTOs inferred from validation schemas.
import type { z } from "zod/v4";

import type {
  browsePublicTripsInputSchema,
  cancelTripInputSchema,
  createDraftTripInputSchema,
  getOrganizationTripInputSchema,
  getPublicTripDetailInputSchema,
  listOrganizationTripsInputSchema,
  publishTripInputSchema,
  saveWizardStepInputSchema,
  transitionTripStateInputSchema,
} from "../validation";

export type CreateDraftTripInput = z.infer<typeof createDraftTripInputSchema>;
export type SaveWizardStepInput = z.infer<typeof saveWizardStepInputSchema>;
export type PublishTripInput = z.infer<typeof publishTripInputSchema>;
export type TransitionTripStateInput = z.infer<typeof transitionTripStateInputSchema>;
export type CancelTripInput = z.infer<typeof cancelTripInputSchema>;
export type ListOrganizationTripsInput = z.infer<typeof listOrganizationTripsInputSchema>;
export type GetOrganizationTripInput = z.infer<typeof getOrganizationTripInputSchema>;
export type BrowsePublicTripsInput = z.infer<typeof browsePublicTripsInputSchema>;
export type GetPublicTripDetailInput = z.infer<typeof getPublicTripDetailInputSchema>;
