import { createDb, type Database } from "@trips-app/db";

import { ENV } from "./env.server";

export const db: Database = createDb(ENV);
