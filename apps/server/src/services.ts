import { createDb } from "@trips-app/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
