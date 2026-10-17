// oRPC procedures for Programs. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/programs/status",
      operationId: "programsStatus",
      summary: "Programs service health status",
      tags: ["programs"],
    })
    .handler(() => ({ service: "programs", status: "ok" as const })),
};
