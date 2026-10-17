import { randomUUID } from "node:crypto";

import type { LookupLocalizedText } from "@trips-app/domain";
import {
  type AnyPgColumn,
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { accounts } from "./auth";

export const lookupTypes = pgTable(
  "lookup_types",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    uuid: uuid("uuid")
      .defaultRandom()
      .$defaultFn(() => randomUUID())
      .notNull(),
    name: jsonb("name").$type<LookupLocalizedText>().notNull(),
    description: jsonb("description").$type<LookupLocalizedText | null>(),
    value: varchar("value", { length: 255 }).notNull(),
    code: varchar("code", { length: 128 }).notNull(),
    parentId: bigint("parent_id", { mode: "number" }).references(
      (): AnyPgColumn => lookupTypes.id,
      { onDelete: "set null" },
    ),
    sortBy: integer("sort_by").default(0).notNull(),
    isPublic: boolean("is_public").default(true).notNull(),
    isSystem: boolean("is_system").default(true).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdBy: uuid("created_by").references(() => accounts.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => accounts.id, { onDelete: "set null" }),
    deletedBy: uuid("deleted_by").references(() => accounts.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("lookup_types_uuid_uk").on(table.uuid),
    uniqueIndex("lookup_types_code_uk").on(table.code),
    index("lookup_types_parent_idx").on(table.parentId),
    index("lookup_types_public_deleted_idx").on(table.isPublic, table.isDeleted, table.sortBy),
  ],
);

export const lookups = pgTable(
  "lookups",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    uuid: uuid("uuid")
      .defaultRandom()
      .$defaultFn(() => randomUUID())
      .notNull(),
    name: jsonb("name").$type<LookupLocalizedText>().notNull(),
    description: jsonb("description").$type<LookupLocalizedText | null>(),
    value: varchar("value", { length: 255 }).notNull(),
    code: varchar("code", { length: 128 }).notNull(),
    lookupTypeId: bigint("lookup_type_id", { mode: "number" })
      .references(() => lookupTypes.id, { onDelete: "cascade" })
      .notNull(),
    parentId: bigint("parent_id", { mode: "number" }).references((): AnyPgColumn => lookups.id, {
      onDelete: "set null",
    }),
    sortBy: integer("sort_by").default(0).notNull(),
    isPublic: boolean("is_public").default(true).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdBy: uuid("created_by").references(() => accounts.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => accounts.id, { onDelete: "set null" }),
    deletedBy: uuid("deleted_by").references(() => accounts.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("lookups_uuid_uk").on(table.uuid),
    uniqueIndex("lookups_type_code_uk").on(table.lookupTypeId, table.code),
    index("lookups_code_idx").on(table.code),
    index("lookups_type_idx").on(table.lookupTypeId, table.isDeleted, table.sortBy),
    index("lookups_parent_idx").on(table.parentId),
  ],
);
