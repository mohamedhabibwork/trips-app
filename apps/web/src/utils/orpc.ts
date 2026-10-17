import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { redactMessage } from "@trips-app/auth";
import type { AppRouterClient } from "@trips-app/api/routers/index";
import { toast } from "sonner";

import { authController } from "../auth/instance";
import { buildAuthLink } from "../auth/orpc-link";
import { extractTransportError } from "../auth/errors";
import { ENV } from "../env.public";

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // A 401 that survived the one allowed refresh is a session end, not a toast (F3): the
        // session-expired dialog is already on screen. Never surface it as a generic error.
        const failure = extractTransportError(error);
        if (failure.status === 401) return;

        // T4: nothing that could carry a token reaches the UI or the logs.
        toast.error(`Error: ${redactMessage(error.message)}`, {
          action: {
            label: "retry",
            onClick: () => {
              query.invalidate();
            },
          },
        });
      },
    }),
    defaultOptions: { queries: { staleTime: 60 * 1000 } },
  });
}

// One link for the whole app: dynamic bearer headers + the reactive refresh of R2 (ARCHITECTURE §4.2).
const link = buildAuthLink({ controller: authController, baseUrl: ENV.VITE_SERVER_URL });

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
