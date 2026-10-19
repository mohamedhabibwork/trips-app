import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireAdminSubRoles,
} from "@trips-app/rpc";

import { mapPaymentsError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapPaymentsError, "payments");

export const procedure = publicProcedure.use(mapErrors);
export const paymentsAuthenticatedProcedure = authenticatedProcedure.use(mapErrors);
export const paymentsAdminProcedure = requireAdminSubRoles(
  "finance",
  "operations",
  "super_admin",
).use(mapErrors);
