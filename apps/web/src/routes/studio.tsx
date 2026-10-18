import { createFileRoute } from "@tanstack/react-router";

import { requireSurface } from "@/auth/guard";
import { GuardedSurface } from "@/components/guarded-surface";
import { findScreen } from "@/screens/registry";
import { STUDIO_SURFACE } from "@/surfaces/studio";
import { loadApiStatus } from "@/utils/api-status";

/** `/studio` — photographers (platform and organization). Loader prefetches status and StaffingBoard queries safely. */
export const Route = createFileRoute("/studio")({
  beforeLoad: requireSurface("studio"),
  loader: async ({ context, location }) => {
    await loadApiStatus({ context });

    // Handle unauthenticated SSR safely: avoid 401 cache dehydration
    if (typeof window === "undefined" && !context.auth.accessToken()) {
      return;
    }

    const screen = findScreen("organization", "staffing-board");
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

    // Prefetch for StaffingBoard queries when authenticated
    await Promise.allSettled([
      context.queryClient.prefetchQuery(
        context.orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
      ),
    ]);
  },
  component: () => <GuardedSurface surface={STUDIO_SURFACE} />,
});
