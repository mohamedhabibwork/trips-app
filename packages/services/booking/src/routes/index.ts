// oRPC procedures for Booking. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/booking/status",
      operationId: "bookingStatus",
      summary: "Booking service health status",
      tags: ["booking"],
    })
    .handler(() => ({ service: "booking", status: "ok" as const })),
};
