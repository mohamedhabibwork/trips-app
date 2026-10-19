// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions (see .claude/rules/drizzle-zod-schemas.md).
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  schema,
} from "@trips-app/db/zod";
import { z } from "zod";

import {
  ALLOWED_MEDIA_MIME_TYPES,
  DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS,
  DEFAULT_UPLOAD_INTENT_EXPIRES_IN_SECONDS,
  LINKABLE_ENTITY_TYPES,
  MEDIA_STORAGE_DISKS,
  UNLINKED_FILE_TTL_HOURS,
  UPLOAD_PURPOSES,
  UPLOADED_FILE_STATUSES,
  validateFileForPurpose,
} from "../../model";

const uploadedFileDiskSchema = z.enum(MEDIA_STORAGE_DISKS);
const uploadedFileStatusSchema = z.enum(UPLOADED_FILE_STATUSES);
const linkableEntityTypeSchema = z.enum(LINKABLE_ENTITY_TYPES);
const allowedMimeTypeSchema = z.enum(ALLOWED_MEDIA_MIME_TYPES);
const uploadPurposeSchema = z.enum(UPLOAD_PURPOSES);

// ---------------------------------------------------------------------------
// Drizzle Table Base Schemas (uploadedFiles)
// ---------------------------------------------------------------------------

export const uploadedFileSelectSchema = createSelectSchema(schema.uploadedFiles);

export const uploadedFileInsertSchema = createInsertSchema(schema.uploadedFiles, {
  disk: uploadedFileDiskSchema,
  storageKey: z.string().trim().min(1).max(512),
  originalFilename: z.string().trim().min(1).max(255),
  mimeType: allowedMimeTypeSchema,
  fileSizeBytes: z.number().int().min(1),
  checksumSha256: z.string().trim().min(16).max(128),
  purpose: uploadPurposeSchema,
  status: uploadedFileStatusSchema,
  linkedEntityType: linkableEntityTypeSchema.nullable().optional(),
  linkedEntityId: z.string().trim().min(1).max(128).nullable().optional(),
});

export const uploadedFileUpdateSchema = createUpdateSchema(schema.uploadedFiles, {
  status: uploadedFileStatusSchema.optional(),
  linkedEntityType: linkableEntityTypeSchema.nullable().optional(),
  linkedEntityId: z.string().trim().min(1).max(128).nullable().optional(),
});

// ---------------------------------------------------------------------------
// Boundary Procedure Input Schemas
// ---------------------------------------------------------------------------

export const getUploadPurposesSchema = z.object({
  purpose: uploadPurposeSchema.optional(),
});

export const createUploadIntentSchema = uploadedFileInsertSchema
  .pick({
    originalFilename: true,
    mimeType: true,
    fileSizeBytes: true,
  })
  .extend({
    purpose: uploadPurposeSchema.default("general"),
    disk: uploadedFileDiskSchema.optional(),
    expiresInSeconds: z
      .number()
      .int()
      .min(60)
      .max(86400)
      .default(DEFAULT_UPLOAD_INTENT_EXPIRES_IN_SECONDS),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((data, ctx) => {
    const check = validateFileForPurpose({
      purpose: data.purpose,
      originalFilename: data.originalFilename,
      mimeType: data.mimeType,
      fileSizeBytes: data.fileSizeBytes,
    });
    if (!check.valid) {
      ctx.addIssue({
        code: "custom",
        message: check.reason ?? "Invalid file for purpose.",
        path: [check.field ?? "purpose"],
      });
    }
  });

export const confirmUploadIntentSchema = z.object({
  fileId: z.uuid(),
});

export const uploadFileSchema = uploadedFileInsertSchema
  .pick({
    originalFilename: true,
    mimeType: true,
  })
  .extend({
    intentId: z.uuid().optional(),
    contentBase64: z.string().trim().min(1),
    purpose: uploadPurposeSchema.default("general"),
    disk: uploadedFileDiskSchema.optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate MIME type and extension against purpose (exact byte size is validated after base64 decode)
    const check = validateFileForPurpose({
      purpose: data.purpose,
      originalFilename: data.originalFilename,
      mimeType: data.mimeType,
      fileSizeBytes: 1,
    });
    if (!check.valid) {
      ctx.addIssue({
        code: "custom",
        message: check.reason ?? "Invalid file for purpose.",
        path: [check.field ?? "purpose"],
      });
    }
  });

export const getFileSchema = z.object({
  fileId: z.uuid(),
  expiresInSeconds: z
    .number()
    .int()
    .min(60)
    .max(86400)
    .default(DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS),
});

export const listFilesSchema = z.object({
  status: uploadedFileStatusSchema.optional(),
  purpose: uploadPurposeSchema.optional(),
  linkedEntityType: linkableEntityTypeSchema.optional(),
  linkedEntityId: z.string().trim().min(1).max(128).optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export const deleteFileSchema = z.object({
  fileId: z.uuid(),
});

export const cleanupExpiredFilesSchema = z.object({
  olderThanHours: z.number().min(0).max(720).default(UNLINKED_FILE_TTL_HOURS),
  limit: z.number().int().min(1).max(500).default(100),
});
