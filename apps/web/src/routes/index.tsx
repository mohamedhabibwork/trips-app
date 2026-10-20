import { createFileRoute } from "@tanstack/react-router";

import { findScreen } from "@/screens/registry";
import { pageHead } from "@/navigation/seo";
import { Landing } from "@/screens/public/landing/landing";
import { loadApiStatus } from "@/utils/api-status";
import { serverQueryOptions } from "@/utils/server-rpc";

/** `/` — the landing page (SCR-PUB-01): prefetches the API status and the public trips. */
export const Route = createFileRoute("/")({
  loader: async ({ context, location }) => {
    await Promise.all([
      loadApiStatus({ context }),
      context.queryClient.ensureQueryData(
        serverQueryOptions(context.orpc.trips.browsePublicTrips, "trips/browsePublicTrips", {
          input: {},
        }),
      ),
    ]);
    const screen = findScreen("public", "landing");
    if (screen?.loader) {
      await screen.loader({
        queryClient: context.queryClient,
        orpc: context.orpc,
        auth: context.auth,
        params: {},
        search: (location?.search as Record<string, unknown>) ?? {},
      });
    }
  },
  head: pageHead("SCR-PUB-01"),
  component: Landing,
});
