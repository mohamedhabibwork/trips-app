// oRPC procedures for Moderator. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/moderator/status",
      operationId: "moderatorStatus",
      summary: "Moderator service health status",
      tags: ["moderator"],
    })
    .handler(() => ({ service: "moderator", status: "ok" as const })),
};
