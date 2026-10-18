import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireSurface } from "@/auth/guard";
import { OrganizationShell } from "@/components/shells/organization-shell";
import { findScreen } from "@/screens/registry";
import { loadApiStatus } from "@/utils/api-status";

/** `/business` — organization owners and employees (AC-6). Loader prefetches status and WorkspaceHome queries safely. */
export const Route = createFileRoute("/business")({
  beforeLoad: requireSurface("business"),
  loader: async ({ context, location }) => {
    await loadApiStatus({ context });

    // Handle unauthenticated SSR safely: avoid 401 cache dehydration
    if (typeof window === "undefined" && !context.auth.accessToken()) {
      return;
    }

    const screen = findScreen("organization", "workspace-home");
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

    // Prefetch for WorkspaceHome queries when authenticated
    await Promise.allSettled([
      context.queryClient.prefetchQuery(
        context.orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
      ),
      context.queryClient.prefetchQuery(
        context.orpc.organization.getOrganizationSettings.queryOptions({ input: {} }),
      ),
      context.queryClient.prefetchQuery(
        context.orpc.notifications.listInbox.queryOptions({ input: {} }),
      ),
    ]);
  },
  component: () => (
    <OrganizationShell>
      <Outlet />
    </OrganizationShell>
  ),
});
