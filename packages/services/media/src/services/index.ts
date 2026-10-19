// Business logic for Media. Routes call this factory with context.db; repositories are created here.
import { createHash, randomUUID } from "node:crypto";
import type { QueueProvider } from "@mohamedhabibwork/queuekit";
import {
  checksum,
  defineUploadIntent,
  randomKey,
  sanitizeFilename as sanitizeStoragekitFilename,
  saveUploadIntent,
  saveWebFile,
  type StorageConfig,
  type StorageManager,
} from "@mohamedhabibwork/storagekit";

import { MediaServiceError } from "../errors";
import {
  buildStorageKey,
  computeUnlinkedExpiresAt,
  DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS,
  getPurposePolicy,
  isUnlinkedFileExpired,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MEDIA_CLEANUP_QUEUE_NAME,
  type MediaStorageDisk,
  resolveDiskForPurpose,
  UNLINKED_FILE_TTL_HOURS,
  UNLINKED_FILE_TTL_MS,
  UPLOAD_PURPOSE_POLICIES,
  UPLOAD_PURPOSES,
  type UploadPurpose,
  validateFileForPurpose,
} from "../model";
import {
  createMediaRepository,
  type LinkUploadedFilesOnItemSaveInput,
  type ServiceDatabase,
  type UploadedFileRow,
} from "../repository";
import type {
  CleanupExpiredFilesResultDto,
  UploadedFileViewDto,
  UploadIntentViewDto,
  UploadPurposePolicyDto,
} from "../schemas/dtos";
import type {
  CleanupExpiredFilesInput,
  ConfirmUploadIntentInput,
  CreateUploadIntentInput,
  DeleteFileInput,
  GetFileInput,
  ListFilesInput,
  UploadFileInput,
} from "../types";

export interface MediaActorContext {
  accountId: string;
  role: string;
  tenantId?: string | null;
  adminSubRole?: string | null;
}

export type MediaStorageDisks = StorageManager<{
  readonly uploads: StorageConfig;
  readonly documents: StorageConfig;
  readonly temp: StorageConfig;
}>;

export interface MediaServiceDeps {
  storage?: MediaStorageDisks | null;
  queue?: QueueProvider | null;
  now?: () => Date;
}

function decodeBase64Payload(rawBase64: string): Buffer {
  const trimmed = rawBase64.trim();
  const commaIdx = trimmed.indexOf(",");
  const base64Part =
    trimmed.startsWith("data:") && commaIdx !== -1 ? trimmed.slice(commaIdx + 1) : trimmed;

  if (!/^[A-Za-z0-9+/=\s]+$/.test(base64Part)) {
    throw new MediaServiceError("VALIDATION_ERROR", "Invalid base64 file content.");
  }

  const buffer = Buffer.from(base64Part, "base64");
  if (buffer.byteLength === 0) {
    throw new MediaServiceError("VALIDATION_ERROR", "Uploaded file content cannot be empty.");
  }
  if (buffer.byteLength > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new MediaServiceError(
      "VALIDATION_ERROR",
      `Uploaded file exceeds the maximum allowed size of ${MAX_UPLOAD_FILE_SIZE_BYTES} bytes.`,
      { maxBytes: MAX_UPLOAD_FILE_SIZE_BYTES, actualBytes: buffer.byteLength },
    );
  }
  return buffer;
}

function assertPurposePolicyOrThrow(input: {
  purpose: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
}) {
  const validation = validateFileForPurpose(input);
  if (!validation.valid) {
    throw new MediaServiceError(
      "VALIDATION_ERROR",
      validation.reason ?? "Uploaded file violates purpose validation rules.",
      {
        field: validation.field,
        purpose: validation.policy.purpose,
        allowedMimeTypes: validation.policy.allowedMimeTypes,
        allowedExtensions: validation.policy.allowedExtensions,
        maxSizeBytes: validation.policy.maxSizeBytes,
      },
    );
  }
  return validation.policy;
}

function canAccessUploadedFile(actor: MediaActorContext, row: UploadedFileRow): boolean {
  if (actor.role === "admin") return true;
  if (row.uploaderAccountId === actor.accountId) return true;
  if (actor.tenantId && row.tenantId && actor.tenantId === row.tenantId) return true;
  return false;
}

function toPolicyDto(purpose: UploadPurpose): UploadPurposePolicyDto {
  const policy = UPLOAD_PURPOSE_POLICIES[purpose];
  return {
    purpose: policy.purpose,
    disk: policy.disk,
    directory: policy.directory,
    maxSizeBytes: policy.maxSizeBytes,
    allowedMimeTypes: policy.allowedMimeTypes,
    allowedExtensions: policy.allowedExtensions,
    unlinkedTtlHours: UNLINKED_FILE_TTL_HOURS,
  };
}

function toUploadedFileViewDto(row: UploadedFileRow, signedUrl?: string): UploadedFileViewDto {
  return {
    id: row.id,
    uploaderAccountId: row.uploaderAccountId,
    tenantId: row.tenantId,
    disk: row.disk,
    storageKey: row.storageKey,
    originalFilename: row.originalFilename,
    mimeType: row.mimeType,
    fileSizeBytes: row.fileSizeBytes,
    checksumSha256: row.checksumSha256,
    url: row.publicUrl ?? `/uploads/${row.storageKey}`,
    ...(signedUrl ? { signedUrl } : {}),
    purpose: row.purpose,
    status: row.status,
    linkedEntityType: row.linkedEntityType,
    linkedEntityId: row.linkedEntityId,
    linkedAt: row.linkedAt ? row.linkedAt.toISOString() : null,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    metadata: row.metadata ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function createMediaService(db: ServiceDatabase, deps: MediaServiceDeps = {}) {
  const repo = createMediaRepository(db);
  const nowFn = deps.now ?? (() => new Date());

  async function scheduleUnlinkedCleanup(row: {
    id: string;
    storageKey: string;
    expiresAt: Date | null;
  }): Promise<void> {
    if (!deps.queue) return;
    await deps.queue
      .publish(
        MEDIA_CLEANUP_QUEUE_NAME,
        {
          payload: {
            fileId: row.id,
            storageKey: row.storageKey,
            scheduledCheckAt: row.expiresAt?.toISOString() ?? null,
          },
        },
        {
          delay: UNLINKED_FILE_TTL_MS,
          idempotencyKey: `media-cleanup-${row.id}`,
        },
      )
      .catch(() => undefined);
  }

  async function resolveSignedReadUrl(
    disk: MediaStorageDisk,
    storageKey: string,
    expiresInSeconds: number = DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS,
  ): Promise<string | undefined> {
    if (!deps.storage) {
      return `http://localhost:3000/uploads/${storageKey}?expires=${expiresInSeconds}`;
    }
    const driver = await deps.storage.disk(disk);
    if (driver.capabilities().signedUrls) {
      try {
        return await driver.getSignedUrl(storageKey, {
          expiresIn: expiresInSeconds,
          action: "read",
        });
      } catch {
        // Fallback to public URL with expiry hint below
      }
    }
    const baseUrl = await driver.getUrl(storageKey);
    return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}expires=${expiresInSeconds}`;
  }

  return {
    getUploadPurposes(input?: { purpose?: UploadPurpose }): {
      purposes: UploadPurposePolicyDto[];
    } {
      const targetPurposes = input?.purpose ? [input.purpose] : UPLOAD_PURPOSES;
      return {
        purposes: targetPurposes.map((p) => toPolicyDto(p)),
      };
    },

    /**
     * Creates an upload intent (validates file type, extension, and size against the purpose policy,
     * reserves a traversal-safe storage key via storagekit's `randomKey`/`sanitizeFilename`,
     * generates a presigned write URL when supported or fallback `/upload?intentId=...`,
     * and records a `pending` row with 12-hour unlinked expiration).
     */
    async createUploadIntent(
      actor: MediaActorContext,
      input: CreateUploadIntentInput,
    ): Promise<{ intent: UploadIntentViewDto }> {
      const now = nowFn();
      const purpose = (input.purpose ?? "general") as UploadPurpose;
      const safeOriginalName = sanitizeStoragekitFilename(input.originalFilename);
      const policy = assertPurposePolicyOrThrow({
        purpose,
        originalFilename: safeOriginalName,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
      });

      const disk = resolveDiskForPurpose(purpose, input.disk);
      const fileId = randomUUID();
      const directory = `${policy.directory}/${actor.accountId}`;
      const storageKey = randomKey(directory, safeOriginalName);
      const expiresAt = computeUnlinkedExpiresAt(now);

      let uploadUrl = `/upload?intentId=${fileId}`;
      let uploadMethod: "PUT" | "POST" = "POST";
      let signedUrlSupported = false;
      let publicUrl = `http://localhost:3000/uploads/${storageKey}`;

      if (deps.storage) {
        const driver = await deps.storage.disk(disk);
        publicUrl = await driver.getUrl(storageKey);
        if (driver.capabilities().signedUrls) {
          try {
            uploadUrl = await driver.getSignedUrl(storageKey, {
              action: "write",
              expiresIn: input.expiresInSeconds,
            });
            uploadMethod = "PUT";
            signedUrlSupported = true;
          } catch {
            signedUrlSupported = false;
          }
        }
      }

      const created = await repo.insertUploadedFile({
        id: fileId,
        uploaderAccountId: actor.accountId,
        tenantId: actor.tenantId ?? null,
        disk,
        storageKey,
        originalFilename: safeOriginalName,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
        checksumSha256: `intent-pending-${fileId.replace(/-/g, "")}`,
        publicUrl,
        purpose,
        status: "pending",
        linkedEntityType: null,
        linkedEntityId: null,
        linkedAt: null,
        expiresAt,
        deletedAt: null,
        metadata: {
          ...input.metadata,
          intentConfirmed: false,
        },
        createdAt: now,
        updatedAt: now,
      });

      await scheduleUnlinkedCleanup(created);

      return {
        intent: {
          fileId: created.id,
          storageKey: created.storageKey,
          disk: created.disk,
          purpose,
          originalFilename: created.originalFilename,
          mimeType: created.mimeType,
          fileSizeBytes: created.fileSizeBytes,
          uploadUrl,
          uploadMethod,
          signedUrlSupported,
          intentExpiresInSeconds: input.expiresInSeconds,
          unlinkedExpiresAt: expiresAt.toISOString(),
          policy: toPolicyDto(purpose),
        },
      };
    },

    /**
     * Confirms an upload intent after the client has uploaded the object to storage.
     * Verifies existence, checks `stat.size` against the purpose policy, and computes SHA-256 via storagekit `checksum()`.
     */
    async confirmUploadIntent(
      actor: MediaActorContext,
      input: ConfirmUploadIntentInput,
    ): Promise<{ file: UploadedFileViewDto }> {
      const now = nowFn();
      const row = await repo.getUploadedFileById(input.fileId);
      if (!row) {
        throw new MediaServiceError("RESOURCE_NOT_FOUND", "Upload intent not found.");
      }
      if (!canAccessUploadedFile(actor, row)) {
        throw new MediaServiceError(
          "FORBIDDEN",
          "You do not have permission to confirm this upload intent.",
        );
      }
      if (row.status === "expired" || row.status === "deleted" || isUnlinkedFileExpired(row, now)) {
        throw new MediaServiceError(
          "INVALID_STATE_TRANSITION",
          "Upload intent has expired after 12 hours or been deleted.",
        );
      }

      let actualSize = row.fileSizeBytes;
      let sha256 = row.checksumSha256;
      let publicUrl = row.publicUrl;

      if (deps.storage) {
        const driver = await deps.storage.disk(row.disk);
        const exists = await driver.exists(row.storageKey);
        if (!exists) {
          throw new MediaServiceError(
            "PRECONDITION_FAILED",
            "Uploaded object was not found in storage for this intent.",
            { fileId: row.id, storageKey: row.storageKey },
          );
        }

        const stat = await driver.stat(row.storageKey);
        actualSize = stat.size;

        assertPurposePolicyOrThrow({
          purpose: row.purpose,
          originalFilename: row.originalFilename,
          mimeType: row.mimeType,
          fileSizeBytes: actualSize,
        });

        sha256 = await checksum(driver, row.storageKey, {
          algorithm: "sha256",
          encoding: "hex",
        });
        publicUrl = await driver.getUrl(row.storageKey);
      }

      const updated = await repo.updateUploadedFileAfterWrite(row.id, {
        fileSizeBytes: actualSize,
        checksumSha256: sha256,
        publicUrl,
        metadata: {
          ...row.metadata,
          intentConfirmed: true,
          confirmedAt: now.toISOString(),
        },
        updatedAt: now,
      });

      const finalRow = updated ?? row;
      const signedUrl = await resolveSignedReadUrl(finalRow.disk, finalRow.storageKey);
      return { file: toUploadedFileViewDto(finalRow, signedUrl) };
    },

    /**
     * Uploads file bytes using storagekit's `defineUploadIntent` + `saveUploadIntent` + `checksum`.
     * Validates MIME type, file extension, and byte size against the purpose policy.
     * Unlinked files receive a 12-hour expiration window (`expiresAt = now + 12h`) and are linked
     * automatically when an item is created or updated.
     */
    async uploadFile(
      actor: MediaActorContext,
      input: UploadFileInput,
    ): Promise<{ file: UploadedFileViewDto }> {
      const now = nowFn();
      const bytes = decodeBase64Payload(input.contentBase64);
      const purpose = (input.purpose ?? "general") as UploadPurpose;
      const safeOriginalName = sanitizeStoragekitFilename(input.originalFilename);

      assertPurposePolicyOrThrow({
        purpose,
        originalFilename: safeOriginalName,
        mimeType: input.mimeType,
        fileSizeBytes: bytes.byteLength,
      });

      // If fulfilling an existing upload intent:
      if (input.intentId) {
        const existingIntent = await repo.getUploadedFileById(input.intentId);
        if (!existingIntent) {
          throw new MediaServiceError("RESOURCE_NOT_FOUND", "Upload intent not found.");
        }
        if (!canAccessUploadedFile(actor, existingIntent)) {
          throw new MediaServiceError(
            "FORBIDDEN",
            "You do not have permission to upload to this intent.",
          );
        }
        if (
          existingIntent.status === "expired" ||
          existingIntent.status === "deleted" ||
          isUnlinkedFileExpired(existingIntent, now)
        ) {
          throw new MediaServiceError(
            "INVALID_STATE_TRANSITION",
            "Upload intent has expired or been deleted.",
          );
        }

        let sha256 = createHash("sha256").update(bytes).digest("hex");
        let publicUrl =
          existingIntent.publicUrl ?? `http://localhost:3000/uploads/${existingIntent.storageKey}`;

        if (deps.storage) {
          const driver = await deps.storage.disk(existingIntent.disk);
          const intent = defineUploadIntent({
            source: {
              body: bytes,
              originalName: safeOriginalName,
              mimeType: input.mimeType,
              size: bytes.byteLength,
            },
            key: existingIntent.storageKey,
            contentType: input.mimeType,
            overwrite: true,
            metadata: {
              accountId: actor.accountId,
              purpose: existingIntent.purpose,
            },
          });
          await saveUploadIntent(driver, intent);
          sha256 = await checksum(driver, existingIntent.storageKey, {
            algorithm: "sha256",
            encoding: "hex",
          });
          publicUrl = await driver.getUrl(existingIntent.storageKey);
        }

        const updated = await repo.updateUploadedFileAfterWrite(existingIntent.id, {
          fileSizeBytes: bytes.byteLength,
          checksumSha256: sha256,
          publicUrl,
          metadata: {
            ...existingIntent.metadata,
            ...input.metadata,
            intentConfirmed: true,
            confirmedAt: now.toISOString(),
          },
          updatedAt: now,
        });

        const finalRow = updated ?? existingIntent;
        const signedUrl = await resolveSignedReadUrl(finalRow.disk, finalRow.storageKey);
        return { file: toUploadedFileViewDto(finalRow, signedUrl) };
      }

      const fileId = randomUUID();
      const disk = resolveDiskForPurpose(purpose, input.disk);
      const targetKey = buildStorageKey({
        accountId: actor.accountId,
        purpose,
        originalFilename: safeOriginalName,
        fileId,
        now,
      });

      let storageKey = targetKey;
      let publicUrl = `http://localhost:3000/uploads/${targetKey}`;
      let checksumSha256 = createHash("sha256").update(bytes).digest("hex");

      if (deps.storage) {
        const driver = await deps.storage.disk(disk);
        const intent = defineUploadIntent({
          source: {
            body: bytes,
            originalName: safeOriginalName,
            mimeType: input.mimeType,
            size: bytes.byteLength,
          },
          key: targetKey,
          contentType: input.mimeType,
          metadata: {
            accountId: actor.accountId,
            purpose,
          },
        });
        const saved = await saveUploadIntent(driver, intent);
        storageKey = saved.key;
        publicUrl = await driver.getUrl(storageKey);
        checksumSha256 = await checksum(driver, storageKey, {
          algorithm: "sha256",
          encoding: "hex",
        });
      }

      const expiresAt = computeUnlinkedExpiresAt(now);
      const created = await repo.insertUploadedFile({
        id: fileId,
        uploaderAccountId: actor.accountId,
        tenantId: actor.tenantId ?? null,
        disk,
        storageKey,
        originalFilename: safeOriginalName,
        mimeType: input.mimeType,
        fileSizeBytes: bytes.byteLength,
        checksumSha256,
        publicUrl,
        purpose,
        status: "pending",
        linkedEntityType: null,
        linkedEntityId: null,
        linkedAt: null,
        expiresAt,
        deletedAt: null,
        metadata: input.metadata ?? null,
        createdAt: now,
        updatedAt: now,
      });

      await scheduleUnlinkedCleanup(created);

      const signedUrl = await resolveSignedReadUrl(disk, storageKey);
      return { file: toUploadedFileViewDto(created, signedUrl) };
    },

    /**
     * Streams a Web `File` directly into storage using storagekit's `saveWebFile()` + `checksum()`,
     * after validating MIME type, extension, and size against the `purpose` policy.
     */
    async uploadWebFile(
      actor: MediaActorContext,
      params: {
        file: File;
        purpose?: string;
        disk?: MediaStorageDisk;
        intentId?: string;
        metadata?: Record<string, unknown>;
      },
    ): Promise<{ file: UploadedFileViewDto }> {
      const now = nowFn();
      const purpose = (params.purpose ?? "general").trim().toLowerCase() as UploadPurpose;
      const safeOriginalName = sanitizeStoragekitFilename(params.file.name || "upload.bin");
      const mimeType = params.file.type || "application/octet-stream";

      assertPurposePolicyOrThrow({
        purpose,
        originalFilename: safeOriginalName,
        mimeType,
        fileSizeBytes: params.file.size,
      });

      if (params.intentId) {
        const bytes = Buffer.from(await params.file.arrayBuffer());
        return this.uploadFile(actor, {
          intentId: params.intentId,
          originalFilename: safeOriginalName,
          mimeType: mimeType as UploadFileInput["mimeType"],
          contentBase64: bytes.toString("base64"),
          purpose,
          disk: params.disk,
          metadata: params.metadata,
        });
      }

      const fileId = randomUUID();
      const policy = getPurposePolicy(purpose);
      const disk = resolveDiskForPurpose(purpose, params.disk);
      const targetKey = buildStorageKey({
        accountId: actor.accountId,
        purpose: policy.purpose,
        originalFilename: safeOriginalName,
        fileId,
        now,
      });

      let storageKey = targetKey;
      let publicUrl = `http://localhost:3000/uploads/${targetKey}`;
      let checksumSha256 = "";

      if (deps.storage) {
        const driver = await deps.storage.disk(disk);
        const saved = await saveWebFile(driver, params.file, {
          key: targetKey,
          contentType: mimeType,
          metadata: {
            accountId: actor.accountId,
            purpose: policy.purpose,
          },
        });
        storageKey = saved.key;
        publicUrl = await driver.getUrl(storageKey);
        checksumSha256 = await checksum(driver, storageKey, {
          algorithm: "sha256",
          encoding: "hex",
        });
      } else {
        const bytes = Buffer.from(await params.file.arrayBuffer());
        checksumSha256 = createHash("sha256").update(bytes).digest("hex");
      }

      const expiresAt = computeUnlinkedExpiresAt(now);
      const created = await repo.insertUploadedFile({
        id: fileId,
        uploaderAccountId: actor.accountId,
        tenantId: actor.tenantId ?? null,
        disk,
        storageKey,
        originalFilename: safeOriginalName,
        mimeType,
        fileSizeBytes: params.file.size,
        checksumSha256,
        publicUrl,
        purpose: policy.purpose,
        status: "pending",
        linkedEntityType: null,
        linkedEntityId: null,
        linkedAt: null,
        expiresAt,
        deletedAt: null,
        metadata: params.metadata ?? null,
        createdAt: now,
        updatedAt: now,
      });

      await scheduleUnlinkedCleanup(created);

      const signedUrl = await resolveSignedReadUrl(disk, storageKey);
      return { file: toUploadedFileViewDto(created, signedUrl) };
    },

    /**
     * Internal helper called when creating or updating a domain item (application, organization, trip, vehicle, etc.).
     * Links uploaded files to the item so they are retained permanently and excluded from the 12-hour cleanup.
     */
    async linkFilesOnItemSave(
      input: LinkUploadedFilesOnItemSaveInput,
    ): Promise<UploadedFileViewDto[]> {
      const rows = await repo.linkFilesOnItemSave({
        ...input,
        now: input.now ?? nowFn(),
      });
      return rows.map((row) => toUploadedFileViewDto(row));
    },

    async getFile(
      actor: MediaActorContext,
      input: GetFileInput,
    ): Promise<{ file: UploadedFileViewDto }> {
      const row = await repo.getUploadedFileById(input.fileId);
      if (!row) {
        throw new MediaServiceError("RESOURCE_NOT_FOUND", "Uploaded file not found.");
      }
      if (!canAccessUploadedFile(actor, row)) {
        throw new MediaServiceError(
          "FORBIDDEN",
          "You do not have permission to view this uploaded file.",
        );
      }

      const signedUrl =
        row.status === "pending" || row.status === "linked"
          ? await resolveSignedReadUrl(row.disk, row.storageKey, input.expiresInSeconds)
          : undefined;

      return { file: toUploadedFileViewDto(row, signedUrl) };
    },

    async listFiles(
      actor: MediaActorContext,
      input: ListFilesInput,
    ): Promise<{ files: UploadedFileViewDto[] }> {
      const rows = await repo.listUploadedFiles({
        uploaderAccountId: actor.role === "admin" ? undefined : actor.accountId,
        status: input.status,
        purpose: input.purpose,
        linkedEntityType: input.linkedEntityType,
        linkedEntityId: input.linkedEntityId,
        limit: input.limit,
      });

      return {
        files: rows.map((row) => toUploadedFileViewDto(row)),
      };
    },

    async deleteFile(
      actor: MediaActorContext,
      input: DeleteFileInput,
    ): Promise<{ file: UploadedFileViewDto }> {
      const now = nowFn();
      const row = await repo.getUploadedFileById(input.fileId);
      if (!row) {
        throw new MediaServiceError("RESOURCE_NOT_FOUND", "Uploaded file not found.");
      }
      if (!canAccessUploadedFile(actor, row)) {
        throw new MediaServiceError(
          "FORBIDDEN",
          "You do not have permission to delete this uploaded file.",
        );
      }

      if (row.status !== "deleted" && row.status !== "expired" && deps.storage) {
        const driver = await deps.storage.disk(row.disk);
        await driver.delete(row.storageKey);
      }

      const updated = await repo.markUploadedFileDeleted(row.id, now);
      return { file: toUploadedFileViewDto(updated ?? row) };
    },

    /**
     * Purges all uploaded files that have remained unlinked (`status === "pending"` and `linkedEntityId IS NULL`)
     * for 12 hours or longer (`expiresAt <= now` or `createdAt <= now - olderThanHours`).
     * Uses storagekit's `deleteMany()` per disk to batch-remove objects from physical storage.
     */
    async cleanupExpiredFiles(
      input: CleanupExpiredFilesInput = {
        olderThanHours: UNLINKED_FILE_TTL_HOURS,
        limit: 100,
      },
    ): Promise<CleanupExpiredFilesResultDto> {
      const now = nowFn();
      const ttlMs = input.olderThanHours * 60 * 60 * 1000;
      const createdBeforeCutoff = new Date(now.getTime() - ttlMs);

      const candidates = await repo.findExpiredUnlinkedFiles({
        now,
        createdBeforeCutoff,
        limit: input.limit,
      });

      const byDisk = new Map<MediaStorageDisk, UploadedFileRow[]>();
      for (const candidate of candidates) {
        const group = byDisk.get(candidate.disk) ?? [];
        group.push(candidate);
        byDisk.set(candidate.disk, group);
      }

      const expiredFileIds: string[] = [];
      const deletedStorageKeys: string[] = [];
      let failedCount = 0;

      for (const [disk, rows] of byDisk.entries()) {
        const failedPaths = new Set<string>();
        if (deps.storage && rows.length > 0) {
          try {
            const driver = await deps.storage.disk(disk);
            const batchResult = await driver.deleteMany(rows.map((r) => r.storageKey));
            for (const failure of batchResult.failed) {
              failedPaths.add(failure.path);
            }
          } catch {
            failedCount += rows.length;
            continue;
          }
        }

        for (const row of rows) {
          if (failedPaths.has(row.storageKey)) {
            failedCount += 1;
            continue;
          }
          const marked = await repo.markUploadedFileExpired(row.id, now);
          if (marked) {
            expiredFileIds.push(marked.id);
            deletedStorageKeys.push(marked.storageKey);
          }
        }
      }

      return {
        scannedCount: candidates.length,
        deletedCount: expiredFileIds.length,
        failedCount,
        expiredFileIds,
        deletedStorageKeys,
        cutoffIso: createdBeforeCutoff.toISOString(),
      };
    },
  };
}
