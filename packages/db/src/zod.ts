// Table-derived Zod schemas. One factory for the package, so every schema binds to the same zod instance.
// Coercion stays off: boundary input is validated exactly as it arrives.
import { createSchemaFactory } from "drizzle-orm/zod";
import { z } from "zod/v4";

// Backend schemas import from "@trips-app/db/zod" only. That subpath exposes the factory and the table
// definitions for derivation, and nothing that opens a database connection.
export * as schema from "./schema";

export const { createSelectSchema, createInsertSchema, createUpdateSchema } = createSchemaFactory({
  zodInstance: z,
  coerce: undefined,
});
