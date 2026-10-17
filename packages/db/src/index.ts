import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "./relations";
import type { DatabaseConfig } from "./types";

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
export * from "./lookups";
export * as schema from "./schema";
export { createInsertSchema, createSelectSchema, createUpdateSchema } from "./zod";
export * from "./seed";
export type * from "./types";

export function createDb(env: DatabaseConfig) {
  return drizzle(env.DATABASE_URL, { relations });
}
