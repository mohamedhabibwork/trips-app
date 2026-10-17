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
  LINKABLE_ENTITY_TYPES,
  MEDIA_STORAGE_DISKS,
  UNLINKED_FILE_TTL_HOURS,
  UPLOADED_FILE_STATUSES,
} from "../../model";

const uploadedFileDiskSchema = z.enum(MEDIA_STORAGE_DISKS);
const uploadedFileStatusSchema = z.enum(UPLOADED_FILE_STATUSES);
const linkableEntityTypeSchema = z.enum(LINKABLE_ENTITY_TYPES);
const allowedMimeTypeSchema = z.enum(ALLOWED_MEDIA_MIME_TYPES);

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
  purpose: z.string().trim().min(1).max(64),
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

export const uploadFileSchema = uploadedFileInsertSchema
  .pick({
    originalFilename: true,
    mimeType: true,
  })
  .extend({
    contentBase64: z.string().trim().min(1),
    purpose: z.string().trim().min(1).max(64).default("general"),
    disk: uploadedFileDiskSchema.optional(),
    linkedEntityType: linkableEntityTypeSchema.optional(),
    linkedEntityId: z.string().trim().min(1).max(128).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (data) =>
      (data.linkedEntityType === undefined && data.linkedEntityId === undefined) ||
      (data.linkedEntityType !== undefined && data.linkedEntityId !== undefined),
    {
      message:
        "Both linkedEntityType and linkedEntityId must be provided together when linking at upload time.",
      path: ["linkedEntityId"],
    },
  );

export const linkFileSchema = z
  .object({
    fileId: z.uuid().optional(),
    storageKey: z.string().trim().min(1).max(512).optional(),
    linkedEntityType: linkableEntityTypeSchema,
    linkedEntityId: z.string().trim().min(1).max(128),
  })
  .refine((data) => Boolean(data.fileId || data.storageKey), {
    message: "Either fileId or storageKey is required to link an uploaded file.",
    path: ["fileId"],
  });

export const linkFilesSchema = z
  .object({
    fileIds: z.array(z.uuid()).max(50).optional(),
    storageKeys: z.array(z.string().trim().min(1).max(512)).max(50).optional(),
    linkedEntityType: linkableEntityTypeSchema,
    linkedEntityId: z.string().trim().min(1).max(128),
  })
  .refine((data) => (data.fileIds?.length ?? 0) + (data.storageKeys?.length ?? 0) > 0, {
    message: "At least one fileId or storageKey is required to link uploaded files.",
    path: ["fileIds"],
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
