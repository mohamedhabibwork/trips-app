import { createDb, type Database } from "@trips-app/db";

import { ENV } from "./env.server";

// SQL text is logged in development only. Parameters are never logged.
export const db: Database = createDb({
  DATABASE_URL: ENV.DATABASE_URL,
  logQueries: ENV.NODE_ENV === "development",
});
