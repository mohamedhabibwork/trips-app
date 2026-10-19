import {
  createServiceErrorMiddleware,
  publicProcedure,
  requireAdminSubRoles,
  requireRoles,
} from "@trips-app/rpc";

import { mapDriverError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapDriverError, "driver");

export const procedure = publicProcedure.use(mapErrors);
export const driverRoleProcedure = requireRoles("platform_driver", "org_driver").use(mapErrors);
export const driverSafetyAdminProcedure = requireAdminSubRoles("operations", "super_admin").use(
  mapErrors,
);
