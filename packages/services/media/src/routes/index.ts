// oRPC procedures for Media. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  cleanupExpiredFilesSchema,
  confirmUploadIntentSchema,
  createUploadIntentSchema,
  deleteFileSchema,
  getFileSchema,
  getUploadPurposesSchema,
  listFilesSchema,
  uploadFileSchema,
} from "../schemas/validation";
import { createMediaService, type MediaActorContext } from "../services";
import { authedProcedure, opsOrSuperAdminProcedure, procedure } from "./procedure";

function toActor(auth: {
  accountId: string;
  activeRole: string;
  activeTenantId?: string | null;
  adminSubRole?: string | null;
}): MediaActorContext {
  return {
    accountId: auth.accountId,
    role: auth.activeRole,
    tenantId: auth.activeTenantId ?? null,
    adminSubRole: auth.adminSubRole ?? null,
  };
}

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/media/status",
      operationId: "mediaStatus",
      summary: "Media service health status",
      tags: ["media"],
    })
    .handler(() => ({ service: "media", status: "ok" as const })),

  getUploadPurposes: authedProcedure
    .route({
      method: "POST",
      path: "/media/purposes",
      operationId: "mediaGetUploadPurposes",
      summary:
        "Get purpose-based upload validation policies (allowed MIME types, extensions, max size, and 12h unlinked TTL).",
      tags: ["media"],
    })
    .input(getUploadPurposesSchema)
    .handler(({ context, input }) =>
      createMediaService(context.db, {
        storage: context.disks ?? null,
        queue: context.queue ?? null,
      }).getUploadPurposes(input),
    ),

  createUploadIntent: authedProcedure
    .route({
      method: "POST",
      path: "/media/intents/create",
      operationId: "mediaCreateUploadIntent",
      summary:
        "Validate file metadata against purpose policy and create an upload intent with a 12-hour unlinked TTL.",
      tags: ["media"],
    })
    .input(createUploadIntentSchema)
    .handler(({ context, input }) =>
      createMediaService(context.db, {
        storage: context.disks ?? null,
        queue: context.queue ?? null,
      }).createUploadIntent(toActor(context.auth), input),
    ),

  confirmUploadIntent: authedProcedure
    .route({
      method: "POST",
      path: "/media/intents/confirm",
      operationId: "mediaConfirmUploadIntent",
      summary:
        "Confirm a direct/presigned upload intent by verifying stored object existence, size, and SHA-256 checksum.",
      tags: ["media"],
    })
    .input(confirmUploadIntentSchema)
    .handler(({ context, input }) =>
      createMediaService(context.db, {
        storage: context.disks ?? null,
        queue: context.queue ?? null,
      }).confirmUploadIntent(toActor(context.auth), input),
    ),

  uploadFile: authedProcedure
    .route({
      method: "POST",
      path: "/media/files/upload",
      operationId: "mediaUploadFile",
      summary:
        "Upload a file to storage with purpose-based validation. Files are linked automatically on item create or update; unlinked files expire after 12 hours.",
      tags: ["media"],
    })
    .input(uploadFileSchema)
    .handler(({ context, input }) =>
      createMediaService(context.db, {
        storage: context.disks ?? null,
        queue: context.queue ?? null,
      }).uploadFile(toActor(context.auth), input),
    ),

  getFile: authedProcedure
    .route({
      method: "POST",
      path: "/media/files/get",
      operationId: "mediaGetFile",
      summary: "Get uploaded file metadata and a fresh signed download URL.",
      tags: ["media"],
    })
    .input(getFileSchema)
    .handler(({ context, input }) =>
      createMediaService(context.db, {
        storage: context.disks ?? null,
        queue: context.queue ?? null,
      }).getFile(toActor(context.auth), input),
    ),

  listFiles: authedProcedure
    .route({
      method: "POST",
      path: "/media/files/list",
      operationId: "mediaListFiles",
      summary: "List uploaded files for the authenticated user or linked entity.",
      tags: ["media"],
    })
    .input(listFilesSchema)
    .handler(({ context, input }) =>
      createMediaService(context.db, {
        storage: context.disks ?? null,
        queue: context.queue ?? null,
      }).listFiles(toActor(context.auth), input),
    ),

  deleteFile: authedProcedure
    .route({
      method: "POST",
      path: "/media/files/delete",
      operationId: "mediaDeleteFile",
      summary: "Delete an uploaded file from storage and mark it deleted.",
      tags: ["media"],
    })
    .input(deleteFileSchema)
    .handler(({ context, input }) =>
      createMediaService(context.db, {
        storage: context.disks ?? null,
        queue: context.queue ?? null,
      }).deleteFile(toActor(context.auth), input),
    ),

  cleanupExpiredFiles: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/media/files/cleanup-expired",
      operationId: "mediaCleanupExpiredFiles",
      summary:
        "Clean up uploaded files that have remained unlinked to any item for 12 hours or longer.",
      tags: ["media"],
    })
    .input(cleanupExpiredFilesSchema)
    .handler(({ context, input }) =>
      createMediaService(context.db, {
        storage: context.disks ?? null,
        queue: context.queue ?? null,
      }).cleanupExpiredFiles(input),
    ),
};
