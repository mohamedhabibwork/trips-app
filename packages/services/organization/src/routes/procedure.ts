// Procedure for Organization. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure, requireTenantScope } from "@trips-app/rpc";

import { mapOrganizationError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapOrganizationError, "organization");

export const procedure = publicProcedure.use(mapErrors);
export const orgSettingsViewProcedure = requireTenantScope("settings", "view").use(mapErrors);
export const orgSettingsManageProcedure = requireTenantScope("settings", "manage").use(mapErrors);
