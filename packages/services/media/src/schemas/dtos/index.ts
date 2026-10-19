// Request and response shapes derived from the validation schemas.
import type { z } from "zod";

import type {
  AllowedMediaMimeType,
  MediaStorageDisk,
  UploadedFileStatus,
  UploadPurpose,
} from "../../model";
import type {
  cleanupExpiredFilesSchema,
  confirmUploadIntentSchema,
  createUploadIntentSchema,
  deleteFileSchema,
  getFileSchema,
  listFilesSchema,
  uploadFileSchema,
} from "../validation";

export type CreateUploadIntentDto = z.infer<typeof createUploadIntentSchema>;
export type ConfirmUploadIntentDto = z.infer<typeof confirmUploadIntentSchema>;
export type UploadFileDto = z.infer<typeof uploadFileSchema>;
export type GetFileDto = z.infer<typeof getFileSchema>;
export type ListFilesDto = z.infer<typeof listFilesSchema>;
export type DeleteFileDto = z.infer<typeof deleteFileSchema>;
export type CleanupExpiredFilesDto = z.infer<typeof cleanupExpiredFilesSchema>;

export interface UploadPurposePolicyDto {
  purpose: UploadPurpose;
  disk: MediaStorageDisk;
  directory: string;
  maxSizeBytes: number;
  allowedMimeTypes: readonly AllowedMediaMimeType[];
  allowedExtensions: readonly string[];
  unlinkedTtlHours: number;
}

export interface UploadIntentViewDto {
  fileId: string;
  storageKey: string;
  disk: MediaStorageDisk;
  purpose: UploadPurpose;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadUrl: string;
  uploadMethod: "PUT" | "POST";
  signedUrlSupported: boolean;
  intentExpiresInSeconds: number;
  unlinkedExpiresAt: string;
  policy: UploadPurposePolicyDto;
}

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
