// Procedure for Availability. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireRoles,
} from "@trips-app/rpc";

import { mapAvailabilityError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapAvailabilityError, "availability");

export const procedure = publicProcedure.use(mapErrors);
export const supplierAvailabilityProcedure = requireRoles(
  "platform_driver",
  "org_driver",
  "platform_photographer",
  "org_photographer",
).use(mapErrors);
export const authenticatedAvailabilityProcedure = authenticatedProcedure.use(mapErrors);
