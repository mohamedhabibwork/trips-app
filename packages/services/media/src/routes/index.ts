// oRPC procedures for Media. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/media/status",
      operationId: "mediaStatus",
      summary: "Media service health status",
      tags: ["media"],
    })
    .handler(() => ({ service: "media", status: "ok" as const })),
};
