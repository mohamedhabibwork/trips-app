// Procedure for Employees. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapEmployeesError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapEmployeesError, "employees");

export const procedure = publicProcedure.use(mapErrors);
