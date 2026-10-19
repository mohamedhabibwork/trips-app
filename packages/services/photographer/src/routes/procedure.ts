import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireRoles,
} from "@trips-app/rpc";

import { mapPhotographerError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapPhotographerError, "photographer");

export const procedure = publicProcedure.use(mapErrors);
export const photographerAuthenticatedProcedure = authenticatedProcedure.use(mapErrors);
export const photographerRoleProcedure = requireRoles(
  "platform_photographer",
  "org_photographer",
).use(mapErrors);
export const photographerAlbumManageProcedure = requireRoles(
  "platform_photographer",
  "org_photographer",
  "organization_owner",
  "organization_employee",
).use(mapErrors);
