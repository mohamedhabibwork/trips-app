// Procedure for Notifications. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
} from "@trips-app/rpc";

import { mapNotificationsError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapNotificationsError, "notifications");

export const procedure = publicProcedure.use(mapErrors);
export const notificationsAuthenticatedProcedure = authenticatedProcedure.use(mapErrors);
