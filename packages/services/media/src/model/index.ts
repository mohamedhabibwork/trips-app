// Entities and aggregates with their invariants. No I/O.

export const UNLINKED_FILE_TTL_HOURS = 12;
export const UNLINKED_FILE_TTL_MS = UNLINKED_FILE_TTL_HOURS * 60 * 60 * 1000;
export const MAX_UPLOAD_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS = 3600;
export const MEDIA_CLEANUP_QUEUE_NAME = "media.cleanup-expired";

export const MEDIA_STORAGE_DISKS = ["uploads", "documents", "temp"] as const;
export type MediaStorageDisk = (typeof MEDIA_STORAGE_DISKS)[number];

export const UPLOADED_FILE_STATUSES = ["pending", "linked", "expired", "deleted"] as const;
export type UploadedFileStatus = (typeof UPLOADED_FILE_STATUSES)[number];

export const LINKABLE_ENTITY_TYPES = [
  "application",
  "trip",
  "vehicle",
  "profile",
  "organization",
  "document",
  "booking",
  "driver",
  "photographer",
] as const;
export type LinkableEntityType = (typeof LINKABLE_ENTITY_TYPES)[number];

export const ALLOWED_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
  "video/mp4",
] as const;
export type AllowedMediaMimeType = (typeof ALLOWED_MEDIA_MIME_TYPES)[number];

const DOCUMENT_PURPOSES = new Set([
  "document",
  "kyc",
  "national_id",
  "driver_license",
  "commercial_register",
  "tax_card",
  "insurance",
  "vehicle_license",
  "contract",
]);

export function computeUnlinkedExpiresAt(now: Date = new Date()): Date {
  return new Date(now.getTime() + UNLINKED_FILE_TTL_MS);
}

export function isUnlinkedFileExpired(
  file: {
    status: UploadedFileStatus;
    linkedEntityId: string | null;
    expiresAt: Date | null;
  },
  now: Date = new Date(),
): boolean {
  if (file.status !== "pending") return false;
  if (file.linkedEntityId !== null) return false;
  if (!file.expiresAt) return false;
  return file.expiresAt.getTime() <= now.getTime();
}

export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "file";
  const cleaned = base
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 120);
  return cleaned.length > 0 ? cleaned : "file";
}

export function resolveDiskForPurpose(
  purpose: string,
  requestedDisk?: MediaStorageDisk,
): MediaStorageDisk {
  if (requestedDisk) return requestedDisk;
  const normalized = purpose.trim().toLowerCase();
  if (DOCUMENT_PURPOSES.has(normalized)) return "documents";
  return "uploads";
}

export function buildStorageKey(input: {
  accountId: string;
  purpose: string;
  originalFilename: string;
  fileId: string;
  now?: Date;
}): string {
  const now = input.now ?? new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const safePurpose =
    input.purpose
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 40) || "general";
  const safeName = sanitizeFilename(input.originalFilename);
  return `${safePurpose}/${yyyy}/${mm}/${dd}/${input.accountId}/${input.fileId}-${safeName}`;
}
