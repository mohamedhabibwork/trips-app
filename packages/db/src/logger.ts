// Query logger for development. It prints the SQL text only. Parameters are dropped, because they hold
// password hashes, encrypted fields and blind indexes.
import type { Logger } from "drizzle-orm/logger";

export class QueryTextLogger implements Logger {
  logQuery(query: string): void {
    console.debug(`[db] ${query}`);
  }
}
