// Entities and aggregates with their invariants. No I/O.

export const UNLINKED_FILE_TTL_HOURS = 12;
export const UNLINKED_FILE_TTL_MS = UNLINKED_FILE_TTL_HOURS * 60 * 60 * 1000;
export const MAX_UPLOAD_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS = 3600;
export const DEFAULT_UPLOAD_INTENT_EXPIRES_IN_SECONDS = 900;
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

export const UPLOAD_PURPOSES = [
  "avatar",
  "profile_avatar",
  "organization_logo",
  "kyc",
  "national_id",
  "driver_license",
  "commercial_register",
  "tax_card",
  "tourism_license",
  "vehicle_license",
  "insurance",
  "contract",
  "document",
  "vehicle_photo",
  "portfolio_photo",
  "trip_cover",
  "trip_gallery",
  "temp",
  "general",
] as const;
export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number];

export const MIME_TYPE_EXTENSIONS: Readonly<Record<AllowedMediaMimeType, readonly string[]>> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
  "image/heif": [".heif"],
  "application/pdf": [".pdf"],
  "video/mp4": [".mp4"],
};

export interface UploadPurposePolicy {
  purpose: UploadPurpose;
  disk: MediaStorageDisk;
  directory: string;
  maxSizeBytes: number;
  allowedMimeTypes: readonly AllowedMediaMimeType[];
  allowedExtensions: readonly string[];
}

const IMAGE_MIME_TYPES: readonly AllowedMediaMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"] as const;

const DOCUMENT_MIME_TYPES: readonly AllowedMediaMimeType[] = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const DOCUMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"] as const;

const MB = 1024 * 1024;

export const UPLOAD_PURPOSE_POLICIES: Readonly<Record<UploadPurpose, UploadPurposePolicy>> = {
  avatar: {
    purpose: "avatar",
    disk: "uploads",
    directory: "avatars",
    maxSizeBytes: 5 * MB,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    allowedExtensions: IMAGE_EXTENSIONS,
  },
  profile_avatar: {
    purpose: "profile_avatar",
    disk: "uploads",
    directory: "avatars",
    maxSizeBytes: 5 * MB,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    allowedExtensions: IMAGE_EXTENSIONS,
  },
  organization_logo: {
    purpose: "organization_logo",
    disk: "uploads",
    directory: "logos",
    maxSizeBytes: 5 * MB,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
  kyc: {
    purpose: "kyc",
    disk: "documents",
    directory: "kyc",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
    allowedExtensions: DOCUMENT_EXTENSIONS,
  },
  national_id: {
    purpose: "national_id",
    disk: "documents",
    directory: "national_id",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
    allowedExtensions: DOCUMENT_EXTENSIONS,
  },
  driver_license: {
    purpose: "driver_license",
    disk: "documents",
    directory: "driver_license",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
    allowedExtensions: DOCUMENT_EXTENSIONS,
  },
  commercial_register: {
    purpose: "commercial_register",
    disk: "documents",
    directory: "commercial_register",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
    allowedExtensions: DOCUMENT_EXTENSIONS,
  },
  tax_card: {
    purpose: "tax_card",
    disk: "documents",
    directory: "tax_card",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
    allowedExtensions: DOCUMENT_EXTENSIONS,
  },
  tourism_license: {
    purpose: "tourism_license",
    disk: "documents",
    directory: "tourism_license",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
    allowedExtensions: DOCUMENT_EXTENSIONS,
  },
  vehicle_license: {
    purpose: "vehicle_license",
    disk: "documents",
    directory: "vehicle_license",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
    allowedExtensions: DOCUMENT_EXTENSIONS,
  },
  insurance: {
    purpose: "insurance",
    disk: "documents",
    directory: "insurance",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
    allowedExtensions: DOCUMENT_EXTENSIONS,
  },
  contract: {
    purpose: "contract",
    disk: "documents",
    directory: "contract",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: ["application/pdf"],
    allowedExtensions: [".pdf"],
  },
  document: {
    purpose: "document",
    disk: "documents",
    directory: "document",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
    allowedExtensions: DOCUMENT_EXTENSIONS,
  },
  vehicle_photo: {
    purpose: "vehicle_photo",
    disk: "uploads",
    directory: "vehicle_photo",
    maxSizeBytes: 10 * MB,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    allowedExtensions: IMAGE_EXTENSIONS,
  },
  portfolio_photo: {
    purpose: "portfolio_photo",
    disk: "uploads",
    directory: "portfolio_photo",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    allowedExtensions: IMAGE_EXTENSIONS,
  },
  trip_cover: {
    purpose: "trip_cover",
    disk: "uploads",
    directory: "trip_cover",
    maxSizeBytes: 10 * MB,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    allowedExtensions: IMAGE_EXTENSIONS,
  },
  trip_gallery: {
    purpose: "trip_gallery",
    disk: "uploads",
    directory: "trip_gallery",
    maxSizeBytes: 25 * MB,
    allowedMimeTypes: [...IMAGE_MIME_TYPES, "video/mp4"],
    allowedExtensions: [...IMAGE_EXTENSIONS, ".mp4"],
  },
  temp: {
    purpose: "temp",
    disk: "temp",
    directory: "temp",
    maxSizeBytes: 25 * MB,
    allowedMimeTypes: ALLOWED_MEDIA_MIME_TYPES,
    allowedExtensions: [...IMAGE_EXTENSIONS, ".pdf", ".mp4"],
  },
  general: {
    purpose: "general",
    disk: "uploads",
    directory: "general",
    maxSizeBytes: 15 * MB,
    allowedMimeTypes: ALLOWED_MEDIA_MIME_TYPES,
    allowedExtensions: [...IMAGE_EXTENSIONS, ".pdf", ".mp4"],
  },
};

export function getPurposePolicy(purpose: string): UploadPurposePolicy {
  const normalized = purpose.trim().toLowerCase() as UploadPurpose;
  return UPLOAD_PURPOSE_POLICIES[normalized] ?? UPLOAD_PURPOSE_POLICIES.general;
}

export function extractFileExtension(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "";
  const dotIdx = base.lastIndexOf(".");
  if (dotIdx <= 0 || dotIdx === base.length - 1) return "";
  return base.slice(dotIdx).toLowerCase();
}

export interface PurposeFileValidationResult {
  valid: boolean;
  policy: UploadPurposePolicy;
  reason?: string;
  field?: "purpose" | "mimeType" | "originalFilename" | "fileSizeBytes";
}

export function validateFileForPurpose(input: {
  purpose: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
}): PurposeFileValidationResult {
  const normalizedPurpose = input.purpose.trim().toLowerCase() as UploadPurpose;
  const policy = UPLOAD_PURPOSE_POLICIES[normalizedPurpose];
  if (!policy) {
    return {
      valid: false,
      policy: UPLOAD_PURPOSE_POLICIES.general,
      field: "purpose",
      reason: `Unsupported upload purpose "${input.purpose}". Allowed purposes: ${UPLOAD_PURPOSES.join(", ")}.`,
    };
  }

  if (!policy.allowedMimeTypes.includes(input.mimeType as AllowedMediaMimeType)) {
    return {
      valid: false,
      policy,
      field: "mimeType",
      reason: `MIME type "${input.mimeType}" is not allowed for purpose "${policy.purpose}". Allowed MIME types: ${policy.allowedMimeTypes.join(", ")}.`,
    };
  }

  const ext = extractFileExtension(input.originalFilename);
  if (ext && !policy.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      policy,
      field: "originalFilename",
      reason: `File extension "${ext}" is not allowed for purpose "${policy.purpose}". Allowed extensions: ${policy.allowedExtensions.join(", ")}.`,
    };
  }

  const expectedExtsForMime = MIME_TYPE_EXTENSIONS[input.mimeType as AllowedMediaMimeType] ?? [];
  if (ext && expectedExtsForMime.length > 0 && !expectedExtsForMime.includes(ext)) {
    return {
      valid: false,
      policy,
      field: "originalFilename",
      reason: `File extension "${ext}" does not match declared MIME type "${input.mimeType}" (expected ${expectedExtsForMime.join(" or ")}).`,
    };
  }

  if (input.fileSizeBytes <= 0) {
    return {
      valid: false,
      policy,
      field: "fileSizeBytes",
      reason: "Uploaded file size must be greater than 0 bytes.",
    };
  }

  if (input.fileSizeBytes > policy.maxSizeBytes) {
    return {
      valid: false,
      policy,
      field: "fileSizeBytes",
      reason: `File size (${input.fileSizeBytes} bytes) exceeds maximum allowed size (${policy.maxSizeBytes} bytes) for purpose "${policy.purpose}".`,
    };
  }

  return {
    valid: true,
    policy,
  };
}

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
  return getPurposePolicy(purpose).disk;
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
  const policy = getPurposePolicy(input.purpose);
  const safeName = sanitizeFilename(input.originalFilename);
  return `${policy.directory}/${yyyy}/${mm}/${dd}/${input.accountId}/${input.fileId}-${safeName}`;
}
