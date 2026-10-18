import { createFileRoute } from "@tanstack/react-router";

import { findScreen } from "@/screens/registry";
import { Landing } from "@/screens/public/landing/landing";
import { loadApiStatus } from "@/utils/api-status";

export const Route = createFileRoute("/")({
  loader: async ({ context, location }) => {
    await Promise.all([
      loadApiStatus({ context }),
      context.queryClient.ensureQueryData(
        context.orpc.trips.browsePublicTrips.queryOptions({ input: {} }),
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
  component: HomeComponent,
});

function HomeComponent() {
  return <Landing />;
}
