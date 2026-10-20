import {
  and,
  desc,
  eq,
  inArray,
  isNull,
  linkUploadedFilesOnItemSave,
  type LinkUploadedFilesOnItemSaveInput,
  lte,
  or,
  schema,
  type ServiceDatabase,
} from "@trips-app/db";

import type { UploadedFileStatus } from "../model";

export type { ServiceDatabase, LinkUploadedFilesOnItemSaveInput } from "@trips-app/db";

export type UploadedFileRow = typeof schema.uploadedFiles.$inferSelect;
export type NewUploadedFileRow = typeof schema.uploadedFiles.$inferInsert;

export function createMediaRepository(db: ServiceDatabase) {
  return {
    async insertUploadedFile(input: NewUploadedFileRow): Promise<UploadedFileRow> {
      const [created] = await db.insert(schema.uploadedFiles).values(input).returning();
      return created!;
    },

    async getUploadedFileById(fileId: string): Promise<UploadedFileRow | null> {
      const [row] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.id, fileId))
        .limit(1);
      return row ?? null;
    },

    async getUploadedFileByStorageKey(storageKey: string): Promise<UploadedFileRow | null> {
      const [row] = await db
        .select()
        .from(schema.uploadedFiles)
        .where(eq(schema.uploadedFiles.storageKey, storageKey))
        .limit(1);
      return row ?? null;
    },

    async getUploadedFilesByIds(fileIds: readonly string[]): Promise<UploadedFileRow[]> {
      if (fileIds.length === 0) return [];
      return db
        .select()
        .from(schema.uploadedFiles)
        .where(inArray(schema.uploadedFiles.id, [...fileIds]));
    },

    async getUploadedFilesByStorageKeys(
      storageKeys: readonly string[],
    ): Promise<UploadedFileRow[]> {
      if (storageKeys.length === 0) return [];
      return db
        .select()
        .from(schema.uploadedFiles)
        .where(inArray(schema.uploadedFiles.storageKey, [...storageKeys]));
    },

    async updateUploadedFileAfterWrite(
      fileId: string,
      patch: {
        fileSizeBytes: number;
        checksumSha256: string;
        publicUrl?: string | null;
        metadata?: Record<string, unknown> | null;
        updatedAt?: Date;
      },
    ): Promise<UploadedFileRow | null> {
      const now = patch.updatedAt ?? new Date();
      const [updated] = await db
        .update(schema.uploadedFiles)
        .set({
          fileSizeBytes: patch.fileSizeBytes,
          checksumSha256: patch.checksumSha256,
          ...(patch.publicUrl !== undefined ? { publicUrl: patch.publicUrl } : {}),
          ...(patch.metadata !== undefined ? { metadata: patch.metadata } : {}),
          updatedAt: now,
        })
        .where(eq(schema.uploadedFiles.id, fileId))
        .returning();
      return updated ?? null;
    },

    async listUploadedFiles(filter: {
      uploaderAccountId?: string;
      tenantId?: string | null;
      status?: UploadedFileStatus;
      purpose?: string;
      linkedEntityType?: string;
      linkedEntityId?: string;
      limit: number;
    }): Promise<UploadedFileRow[]> {
      const conditions = [];
      if (filter.uploaderAccountId) {
        conditions.push(eq(schema.uploadedFiles.uploaderAccountId, filter.uploaderAccountId));
      }
      if (filter.tenantId) {
        conditions.push(eq(schema.uploadedFiles.tenantId, filter.tenantId));
      }
      if (filter.status) {
        conditions.push(eq(schema.uploadedFiles.status, filter.status));
      }
      if (filter.purpose) {
        conditions.push(eq(schema.uploadedFiles.purpose, filter.purpose));
      }
      if (filter.linkedEntityType) {
        conditions.push(eq(schema.uploadedFiles.linkedEntityType, filter.linkedEntityType));
      }
      if (filter.linkedEntityId) {
        conditions.push(eq(schema.uploadedFiles.linkedEntityId, filter.linkedEntityId));
      }

      const query = db.select().from(schema.uploadedFiles).$dynamic();
      const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query;
      return filtered.orderBy(desc(schema.uploadedFiles.createdAt)).limit(filter.limit);
    },

    async linkFilesOnItemSave(input: LinkUploadedFilesOnItemSaveInput): Promise<UploadedFileRow[]> {
      return linkUploadedFilesOnItemSave(db, input);
    },

    async markUploadedFileDeleted(
      fileId: string,
      deletedAt: Date = new Date(),
    ): Promise<UploadedFileRow | null> {
      const [updated] = await db
        .update(schema.uploadedFiles)
        .set({
          status: "deleted",
          expiresAt: null,
          deletedAt,
          updatedAt: deletedAt,
        })
        .where(eq(schema.uploadedFiles.id, fileId))
        .returning();
      return updated ?? null;
    },

    async findExpiredUnlinkedFiles(params: {
      now: Date;
      createdBeforeCutoff: Date;
      limit: number;
    }): Promise<UploadedFileRow[]> {
      return db
        .select()
        .from(schema.uploadedFiles)
        .where(
          and(
            eq(schema.uploadedFiles.status, "pending"),
            isNull(schema.uploadedFiles.linkedEntityId),
            or(
              lte(schema.uploadedFiles.expiresAt, params.now),
              lte(schema.uploadedFiles.createdAt, params.createdBeforeCutoff),
            ),
          ),
        )
        .orderBy(schema.uploadedFiles.createdAt)
        .limit(params.limit);
    },

    async markUploadedFileExpired(
      fileId: string,
      expiredAt: Date = new Date(),
    ): Promise<UploadedFileRow | null> {
      const [updated] = await db
        .update(schema.uploadedFiles)
        .set({
          status: "expired",
          deletedAt: expiredAt,
          updatedAt: expiredAt,
        })
        .where(
          and(
            eq(schema.uploadedFiles.id, fileId),
            eq(schema.uploadedFiles.status, "pending"),
            isNull(schema.uploadedFiles.linkedEntityId),
          ),
        )
        .returning();
      return updated ?? null;
    },
  };
}
