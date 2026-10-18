import { createFileRoute } from "@tanstack/react-router";

import { requireSurface } from "@/auth/guard";
import { GuardedSurface } from "@/components/guarded-surface";
import { findScreen } from "@/screens/registry";
import { CREW_SURFACE } from "@/surfaces/crew";
import { loadApiStatus } from "@/utils/api-status";

/** `/crew` — vehicle moderators (AC-6). Loader prefetches status and LiveOperations queries safely. */
export const Route = createFileRoute("/crew")({
  beforeLoad: requireSurface("crew"),
  loader: async ({ context, location }) => {
    await loadApiStatus({ context });

    // Handle unauthenticated SSR safely: avoid 401 cache dehydration
    if (typeof window === "undefined" && !context.auth.accessToken()) {
      return;
    }

    const screen = findScreen("organization", "live-operations");
    if (screen?.loader) {
      await screen.loader({
        queryClient: context.queryClient,
        orpc: context.orpc,
        auth: context.auth,
        params: {},
        search: (location?.search as Record<string, unknown>) ?? {},
      });
      return;
    }

    // Prefetch for LiveOperations queries when authenticated
    await Promise.allSettled([
      context.queryClient.prefetchQuery(
        context.orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
      ),
      context.queryClient.prefetchQuery(
        context.orpc.fleet.listVehicles.queryOptions({ input: {} }),
      ),
    ]);
  },
  component: () => <GuardedSurface surface={CREW_SURFACE} />,
});
