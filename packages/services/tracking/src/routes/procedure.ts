import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireRoles,
} from "@trips-app/rpc";

import { mapTrackingError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapTrackingError, "tracking");

export const procedure = publicProcedure.use(mapErrors);
export const trackingAuthenticatedProcedure = authenticatedProcedure.use(mapErrors);
export const trackingGpsPingProcedure = requireRoles(
  "platform_driver",
  "org_driver",
  "moderator",
  "organization_owner",
  "organization_employee",
).use(mapErrors);
export const trackingChildSafetyProcedure = requireRoles(
  "moderator",
  "organization_owner",
  "organization_employee",
).use(mapErrors);
export const trackingAlertsProcedure = requireRoles(
  "organization_owner",
  "organization_employee",
  "admin",
).use(mapErrors);
