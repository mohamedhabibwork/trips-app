import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { eq, is } from "drizzle-orm";
import { getTableConfig, PgTable, QueryBuilder } from "drizzle-orm/pg-core";

import { QueryTextLogger } from "../src/logger";
import {
  ACCOUNT_SECRET_COLUMNS,
  accountPublicColumns,
  createMockDatabase,
  omitColumns,
  schema,
} from "../src/index";

// Foreign-key columns that have no index yet. Adding an index means a schema change and a migration,
// so each gap is listed here until it is fixed. A new unindexed foreign key fails the test.
const KNOWN_UNINDEXED_FOREIGN_KEYS = new Set([
  "admin_invites.invited_by_account_id",
  "admin_invites.accepted_by_account_id",
  "applications.assigned_admin_account_id",
  "applications.reviewed_by_admin_account_id",
  "applications.appeal_decided_by_admin_account_id",
  "applications.provisioned_organization_id",
  "auth_sessions.active_tenant_id",
  "auth_settings.updated_by_account_id",
  "driver_profiles.lab_test_consent_id",
  "employee_memberships.invited_by_account_id",
  "lookup_types.created_by",
  "lookup_types.updated_by",
  "lookup_types.deleted_by",
  "lookups.created_by",
  "lookups.updated_by",
  "lookups.deleted_by",
  "organization_settings.updated_by_account_id",
  "system_settings.updated_by_account_id",
]);

// Every table in the schema, discovered with is() so a new table is covered without editing this file.
const tables = Object.values(schema).filter((value): value is PgTable => is(value, PgTable));

describe("Unit: schema invariants read from table metadata (@trips-app/db)", () => {
  test("discovers every table in the schema", () => {
    expect(tables.length).toBeGreaterThanOrEqual(24);
  });

  for (const table of tables) {
    test(`${getTableConfig(table).name} has a primary key`, () => {
      const config = getTableConfig(table);
      const hasPrimaryKey =
        config.columns.some((column) => column.primary) || config.primaryKeys.length > 0;
      expect(hasPrimaryKey).toBe(true);
    });
  }

  test("every foreign key column is indexed, except the known gaps", () => {
    const unindexed = new Set<string>();
    for (const table of tables) {
      const config = getTableConfig(table);
      const indexed = new Set(
        config.indexes.flatMap((index) =>
          index.config.columns.map((column) => (column as { name: string }).name),
        ),
      );
      // A primary key is indexed already, whether it is declared on the column or in a composite key.
      const primaryKeyColumns = new Set([
        ...config.columns.filter((column) => column.primary).map((column) => column.name),
        ...config.primaryKeys.flatMap((key) => key.columns.map((column) => column.name)),
      ]);
      for (const foreignKey of config.foreignKeys) {
        for (const column of foreignKey.reference().columns) {
          if (indexed.has(column.name) || primaryKeyColumns.has(column.name)) continue;
          unindexed.add(`${config.name}.${column.name}`);
        }
      }
    }
    const newGaps = [...unindexed].filter((key) => !KNOWN_UNINDEXED_FOREIGN_KEYS.has(key));
    expect(newGaps).toEqual([]);
  });

  test("the known unindexed foreign keys still exist, so the list cannot go stale", () => {
    const allForeignKeys = new Set<string>();
    for (const table of tables) {
      const config = getTableConfig(table);
      for (const foreignKey of config.foreignKeys) {
        for (const column of foreignKey.reference().columns) {
          allForeignKeys.add(`${config.name}.${column.name}`);
        }
      }
    }
    const stale = [...KNOWN_UNINDEXED_FOREIGN_KEYS].filter((key) => !allForeignKeys.has(key));
    expect(stale).toEqual([]);
  });
});

describe("Unit: column sets and generated SQL (@trips-app/db)", () => {
  const builder = new QueryBuilder();

  test("public account columns leave out every credential and blind-index column", () => {
    const { sql } = builder.select(accountPublicColumns).from(schema.accounts).toSQL();
    for (const column of ACCOUNT_SECRET_COLUMNS) {
      expect(Object.keys(accountPublicColumns)).not.toContain(column);
    }
    expect(sql).not.toContain("password_hash");
    expect(sql).not.toContain("totp_secret_encrypted");
  });

  test("omitColumns keeps every column except the listed keys", () => {
    const kept = omitColumns(schema.lookups, ["code", "value"]);
    expect(Object.keys(kept)).not.toContain("code");
    expect(Object.keys(kept)).not.toContain("value");
    expect(Object.keys(kept)).toContain("name");
  });

  test("filter values are bound as parameters, never written into the SQL text", () => {
    const hostile = "x' OR '1'='1";
    const { sql, params } = builder
      .select()
      .from(schema.lookups)
      .where(eq(schema.lookups.code, hostile))
      .toSQL();
    expect(sql).not.toContain(hostile);
    expect(params).toContain(hostile);
  });
});

describe("Unit: query logging and mock database (@trips-app/db)", () => {
  let debug: ReturnType<typeof spyOn>;

  beforeEach(() => {
    debug = spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    debug.mockRestore();
  });

  test("the query logger prints the SQL text it is given", () => {
    new QueryTextLogger().logQuery('select "id" from "accounts" where "id" = $1');
    expect(debug).toHaveBeenCalledTimes(1);
    expect(String(debug.mock.calls[0]?.[0])).toContain('select "id" from "accounts"');
  });

  test("the mock database cannot answer a query", async () => {
    const db = createMockDatabase();
    const run = async () => await db.select().from(schema.accounts);
    await expect(run()).rejects.toThrow();
  });
});
