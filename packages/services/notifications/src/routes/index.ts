// oRPC procedures for Notifications. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/notifications/status",
      operationId: "notificationsStatus",
      summary: "Notifications service health status",
      tags: ["notifications"],
    })
    .handler(() => ({ service: "notifications", status: "ok" as const })),
};
