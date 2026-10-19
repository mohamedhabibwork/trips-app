import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { accounts, organizations } from "./auth";

export type MediaStorageDisk = "uploads" | "documents" | "temp";
export type UploadedFileStatus = "pending" | "linked" | "expired" | "deleted";

export const uploadedFiles = pgTable(
  "uploaded_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    uploaderAccountId: uuid("uploader_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    tenantId: uuid("tenant_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    disk: text("disk").$type<MediaStorageDisk>().default("uploads").notNull(),
    storageKey: text("storage_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    checksumSha256: text("checksum_sha256").notNull(),
    publicUrl: text("public_url"),
    purpose: text("purpose").default("general").notNull(),
    status: text("status").$type<UploadedFileStatus>().default("pending").notNull(),
    linkedEntityType: text("linked_entity_type"),
    linkedEntityId: text("linked_entity_id"),
    linkedAt: timestamp("linked_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uploaded_files_storage_key_uidx").on(table.storageKey),
    index("uploaded_files_uploader_idx").on(table.uploaderAccountId),
    index("uploaded_files_tenant_idx").on(table.tenantId),
    index("uploaded_files_status_expires_idx").on(table.status, table.expiresAt),
    index("uploaded_files_linked_entity_idx").on(table.linkedEntityType, table.linkedEntityId),
  ],
);
