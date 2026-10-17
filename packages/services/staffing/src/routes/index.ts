// oRPC procedures for Staffing. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/staffing/status",
      operationId: "staffingStatus",
      summary: "Staffing service health status",
      tags: ["staffing"],
    })
    .handler(() => ({ service: "staffing", status: "ok" as const })),
};
