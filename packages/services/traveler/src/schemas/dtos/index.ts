// Request and response DTOs inferred from validation schemas.
import type { z } from "zod/v4";

import type {
  requestPrivacyActionInputSchema,
  updateNotificationPreferencesInputSchema,
  updateProfileInputSchema,
} from "../validation";

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesInputSchema
>;
export type RequestPrivacyActionInput = z.infer<typeof requestPrivacyActionInputSchema>;
