import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
} from "@trips-app/rpc";

import { mapParentError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapParentError, "parent");

export const procedure = publicProcedure.use(mapErrors);
export const parentAuthenticatedProcedure = authenticatedProcedure.use(mapErrors);
