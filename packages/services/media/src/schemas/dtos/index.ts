// Request and response shapes derived from the validation schemas.
import type { z } from "zod";

import type { MediaStorageDisk, UploadedFileStatus } from "../../model";
import type {
  cleanupExpiredFilesSchema,
  deleteFileSchema,
  getFileSchema,
  linkFileSchema,
  linkFilesSchema,
  listFilesSchema,
  uploadFileSchema,
} from "../validation";

export type UploadFileDto = z.infer<typeof uploadFileSchema>;
export type LinkFileDto = z.infer<typeof linkFileSchema>;
export type LinkFilesDto = z.infer<typeof linkFilesSchema>;
export type GetFileDto = z.infer<typeof getFileSchema>;
export type ListFilesDto = z.infer<typeof listFilesSchema>;
export type DeleteFileDto = z.infer<typeof deleteFileSchema>;
export type CleanupExpiredFilesDto = z.infer<typeof cleanupExpiredFilesSchema>;

export interface UploadedFileViewDto {
  id: string;
  uploaderAccountId: string;
  tenantId: string | null;
  disk: MediaStorageDisk;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  checksumSha256: string;
  url: string;
  signedUrl?: string;
  purpose: string;
  status: UploadedFileStatus;
  linkedEntityType: string | null;
  linkedEntityId: string | null;
  linkedAt: string | null;
  expiresAt: string | null;
  deletedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CleanupExpiredFilesResultDto {
  scannedCount: number;
  deletedCount: number;
  failedCount: number;
  expiredFileIds: string[];
  deletedStorageKeys: string[];
  cutoffIso: string;
}
