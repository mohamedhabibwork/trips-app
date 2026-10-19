// Media service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "media";
export { MediaServiceError, mapMediaError } from "./errors";
export {
  type AllowedMediaMimeType,
  type LinkableEntityType,
  MEDIA_CLEANUP_QUEUE_NAME,
  type MediaStorageDisk,
  UNLINKED_FILE_TTL_HOURS,
  UNLINKED_FILE_TTL_MS,
  UPLOAD_PURPOSE_POLICIES,
  UPLOAD_PURPOSES,
  type UploadedFileStatus,
  type UploadPurpose,
  type UploadPurposePolicy,
  validateFileForPurpose,
} from "./model";
export { routes } from "./routes";
export type * from "./schemas/dtos";
export { createMediaService, type MediaActorContext, type MediaServiceDeps } from "./services";
export type * from "./types";
