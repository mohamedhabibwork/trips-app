// Column maps built with getColumns, so a select can drop columns it must never return.
import { getColumns, type Table } from "drizzle-orm";

import { accounts } from "./schema/auth";

// Returns the table's column map without the listed keys. Pass the result to db.select(...).
export function omitColumns<TTable extends Table, const TKey extends keyof TTable["_"]["columns"]>(
  table: TTable,
  keys: readonly TKey[],
): Omit<TTable["_"]["columns"], TKey> {
  const hidden = new Set<PropertyKey>(keys);
  return Object.fromEntries(
    Object.entries(getColumns(table)).filter(([key]) => !hidden.has(key)),
  ) as Omit<TTable["_"]["columns"], TKey>;
}

// Credential and lookup-only account columns. Only the sign-in flow reads these, through the auth repository.
export const ACCOUNT_SECRET_COLUMNS = [
  "passwordHash",
  "passwordChangedAt",
  "totpSecretEncrypted",
  "emailBlindIndex",
  "phoneBlindIndex",
] as const;

export const accountPublicColumns = omitColumns(accounts, ACCOUNT_SECRET_COLUMNS);
