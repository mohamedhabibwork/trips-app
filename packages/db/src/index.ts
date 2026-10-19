import { drizzle } from "drizzle-orm/node-postgres";

import { QueryTextLogger } from "./logger";
import { relations } from "./relations";
import type { Database, DatabaseConfig } from "./types";

export {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
export * from "./columns";
export * from "./lookups";
export * from "./media-links";
export * as schema from "./schema";
export { createInsertSchema, createSelectSchema, createUpdateSchema } from "./zod";
export * from "./seed";
export type * from "./types";

export function createDb(env: DatabaseConfig) {
  return drizzle(env.DATABASE_URL, {
    relations,
    logger: env.logQueries ? new QueryTextLogger() : false,
  });
}

// A typed database with no connection. Any query on it fails, so unit tests can prove a code path never queries.
// The mock has no pool, so its $client type differs. The cast lets services accept it where a Database is expected.
export function createMockDatabase(): Database {
  return drizzle.mock({ relations }) as unknown as Database;
}
