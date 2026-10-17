// oRPC procedures for Seats. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/seats/status",
      operationId: "seatsStatus",
      summary: "Seats service health status",
      tags: ["seats"],
    })
    .handler(() => ({ service: "seats", status: "ok" as const })),
};
