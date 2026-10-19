import { and, eq, inArray, isNull, ne, or } from "drizzle-orm";

import * as schema from "./schema";
import type { Database } from "./types";

const UNLINKED_TTL_MS = 12 * 60 * 60 * 1000;

export interface LinkUploadedFilesOnItemSaveInput {
  entityType: string;
  entityId: string;
  uploaderAccountId?: string;
  tenantId?: string | null;
  fileIds?: readonly string[];
  storageKeys?: readonly string[];
  urls?: readonly (string | null | undefined)[];
  /**
   * When true (e.g. on item update), any file previously linked to `(entityType, entityId)`
   * that is no longer in the provided set is unlinked back to `status = "pending"` with a
   * 12-hour expiration window so it will be cleaned up by the 12h worker if unused.
   */
  replaceExistingForEntity?: boolean;
  now?: Date;
}

function extractStorageKeyFromUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const withoutQuery = trimmed.split("?")[0] ?? trimmed;
  for (const marker of ["/uploads/media/", "/uploads/documents/", "/uploads/temp/", "/uploads/"]) {
    const idx = withoutQuery.indexOf(marker);
    if (idx !== -1) {
      const key = withoutQuery.slice(idx + marker.length).replace(/^\/+/, "");
      if (key.length > 0) return key;
    }
  }
  return null;
}

/**
 * Links uploaded files to a domain item when the item is created or updated.
 * Clears `expiresAt` (`null`) and transitions `status` from `"pending"` to `"linked"`
 * so the 12-hour unlinked cleanup worker retains the files permanently.
 */
export async function linkUploadedFilesOnItemSave(
  db: Database,
  input: LinkUploadedFilesOnItemSaveInput,
) {
  const now = input.now ?? new Date();
  const fileIds = [...new Set((input.fileIds ?? []).filter(Boolean))];
  const rawKeys = new Set((input.storageKeys ?? []).filter(Boolean));
  const rawUrls = new Set<string>();

  for (const rawUrl of input.urls ?? []) {
    if (!rawUrl) continue;
    const trimmed = rawUrl.trim();
    if (!trimmed) continue;
    rawUrls.add(trimmed);
    const extracted = extractStorageKeyFromUrl(trimmed);
    if (extracted) {
      rawKeys.add(extracted);
    }
  }

  const storageKeys = [...rawKeys];
  const urls = [...rawUrls];

  const matchClauses = [];
  if (fileIds.length > 0) {
    matchClauses.push(inArray(schema.uploadedFiles.id, fileIds));
  }
  if (storageKeys.length > 0) {
    matchClauses.push(inArray(schema.uploadedFiles.storageKey, storageKeys));
  }
  if (urls.length > 0) {
    matchClauses.push(inArray(schema.uploadedFiles.publicUrl, urls));
  }

  let linkedRows: (typeof schema.uploadedFiles.$inferSelect)[] = [];

  if (matchClauses.length > 0) {
    linkedRows = await db
      .update(schema.uploadedFiles)
      .set({
        status: "linked",
        linkedEntityType: input.entityType,
        linkedEntityId: input.entityId,
        linkedAt: now,
        expiresAt: null,
        ...(input.tenantId !== undefined ? { tenantId: input.tenantId } : {}),
        updatedAt: now,
      })
      .where(
        and(
          or(...matchClauses),
          ne(schema.uploadedFiles.status, "expired"),
          ne(schema.uploadedFiles.status, "deleted"),
          or(
            isNull(schema.uploadedFiles.linkedEntityId),
            and(
              eq(schema.uploadedFiles.linkedEntityType, input.entityType),
              eq(schema.uploadedFiles.linkedEntityId, input.entityId),
            ),
          ),
        ),
      )
      .returning();
  }

  if (input.replaceExistingForEntity) {
    const keepIds = new Set(linkedRows.map((row) => row.id));
    const currentlyLinked = await db
      .select()
      .from(schema.uploadedFiles)
      .where(
        and(
          eq(schema.uploadedFiles.linkedEntityType, input.entityType),
          eq(schema.uploadedFiles.linkedEntityId, input.entityId),
          eq(schema.uploadedFiles.status, "linked"),
        ),
      );

    const detachedIds = currentlyLinked.filter((row) => !keepIds.has(row.id)).map((row) => row.id);

    if (detachedIds.length > 0) {
      const nextExpiresAt = new Date(now.getTime() + UNLINKED_TTL_MS);
      await db
        .update(schema.uploadedFiles)
        .set({
          status: "pending",
          linkedEntityType: null,
          linkedEntityId: null,
          linkedAt: null,
          expiresAt: nextExpiresAt,
          updatedAt: now,
        })
        .where(inArray(schema.uploadedFiles.id, detachedIds));
    }
  }

  return linkedRows;
}
