// oRPC procedures for Check In. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/check-in/status",
      operationId: "checkInStatus",
      summary: "Check In service health status",
      tags: ["check-in"],
    })
    .handler(() => ({ service: "check-in", status: "ok" as const })),
};
