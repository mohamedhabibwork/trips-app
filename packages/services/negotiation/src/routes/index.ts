// oRPC procedures for Negotiation. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/negotiation/status",
      operationId: "negotiationStatus",
      summary: "Negotiation service health status",
      tags: ["negotiation"],
    })
    .handler(() => ({ service: "negotiation", status: "ok" as const })),
};
