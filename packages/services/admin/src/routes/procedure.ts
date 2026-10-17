// Procedure for Admin. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  createServiceErrorMiddleware,
  publicProcedure,
  requireAdminSubRoles,
} from "@trips-app/rpc";

import { mapAdminError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapAdminError, "admin");

export const procedure = publicProcedure.use(mapErrors);
export const anyAdminProcedure = requireAdminSubRoles("super_admin", "operations", "finance").use(
  mapErrors,
);
export const superAdminProcedure = requireAdminSubRoles("super_admin").use(mapErrors);
