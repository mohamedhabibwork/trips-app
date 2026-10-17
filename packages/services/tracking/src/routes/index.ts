// oRPC procedures for Tracking. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/tracking/status",
      operationId: "trackingStatus",
      summary: "Tracking service health status",
      tags: ["tracking"],
    })
    .handler(() => ({ service: "tracking", status: "ok" as const })),
};
