// Shared TypeScript types, ids and enums. No I/O.
import type { z } from "zod";

import type {
  previewSystemSettingsChangeSchema,
  updateSystemSettingsSchema,
} from "../schemas/validation";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
  SharedErrorCode as AdminErrorCode,
} from "@trips-app/domain";

export interface AdminRequestMeta {
  requestId?: string;
  ipAddress?: string;
}

export type PreviewSystemSettingsChangeInput = z.infer<typeof previewSystemSettingsChangeSchema>;
export type UpdateSystemSettingsInput = z.infer<typeof updateSystemSettingsSchema>;
