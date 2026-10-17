import { publicProcedure } from "../index";
import type { AppRouter, AppRouterClient } from "../types";
import { lookupsRouter } from "./lookups";
import { serviceRouters } from "./services";

export type { AppRouter, AppRouterClient };

export const appRouter = {
  healthCheck: publicProcedure
    .route({
      method: "GET",
      path: "/healthCheck",
      operationId: "healthCheck",
      summary: "Platform API health check",
      description: "Returns OK when the Trips Enjoy backend API is healthy.",
      tags: ["system"],
    })
    .handler(() => {
      return "OK";
    }),
  lookups: lookupsRouter,
  ...serviceRouters,
};
