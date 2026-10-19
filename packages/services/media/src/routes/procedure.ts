// Procedure for Media. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireAdminSubRoles,
} from "@trips-app/rpc";

import { mapMediaError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapMediaError, "media");

export const procedure = publicProcedure.use(mapErrors);
export const authedProcedure = authenticatedProcedure.use(mapErrors);
export const opsOrSuperAdminProcedure = requireAdminSubRoles("super_admin", "operations").use(
  mapErrors,
);
