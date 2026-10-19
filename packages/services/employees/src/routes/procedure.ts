// Procedure for Employees. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireTenantScope,
} from "@trips-app/rpc";

import { mapEmployeesError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapEmployeesError, "employees");

export const procedure = publicProcedure.use(mapErrors);
export const authedProcedure = authenticatedProcedure.use(mapErrors);
export const employeesViewProcedure = requireTenantScope("employees", "view").use(mapErrors);
export const employeesManageProcedure = requireTenantScope("employees", "manage").use(mapErrors);
