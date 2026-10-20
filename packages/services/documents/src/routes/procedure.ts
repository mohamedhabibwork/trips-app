// Procedure for Documents. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
} from "@trips-app/rpc";

import { mapDocumentsError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapDocumentsError, "documents");

export const procedure = publicProcedure.use(mapErrors);
export const documentsAuthenticatedProcedure = authenticatedProcedure.use(mapErrors);
