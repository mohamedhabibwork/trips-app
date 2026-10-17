// Shared TypeScript types, ids and enums. No I/O.
import type { z } from "zod";

import type {
  configureWebhooksSchema,
  getOrganizationSettingsSchema,
  updateOrganizationSettingsSchema,
} from "../schemas/validation";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
  SharedErrorCode as OrganizationErrorCode,
} from "@trips-app/domain";

export interface OrganizationRequestMeta {
  requestId?: string;
  ipAddress?: string;
}

export type GetOrganizationSettingsInput = z.infer<typeof getOrganizationSettingsSchema>;
export type UpdateOrganizationSettingsInput = z.infer<typeof updateOrganizationSettingsSchema>;
export type ConfigureWebhooksInput = z.infer<typeof configureWebhooksSchema>;
