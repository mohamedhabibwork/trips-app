// Shared TypeScript types, ids and enums. No I/O.
import type { z } from "zod";

import type {
  cleanupExpiredFilesSchema,
  confirmUploadIntentSchema,
  createUploadIntentSchema,
  deleteFileSchema,
  getFileSchema,
  listFilesSchema,
  uploadFileSchema,
} from "../schemas/validation";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
  SharedErrorCode as MediaErrorCode,
} from "@trips-app/domain";

export type CreateUploadIntentInput = z.infer<typeof createUploadIntentSchema>;
export type ConfirmUploadIntentInput = z.infer<typeof confirmUploadIntentSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type GetFileInput = z.infer<typeof getFileSchema>;
export type ListFilesInput = z.infer<typeof listFilesSchema>;
export type DeleteFileInput = z.infer<typeof deleteFileSchema>;
export type CleanupExpiredFilesInput = z.infer<typeof cleanupExpiredFilesSchema>;
