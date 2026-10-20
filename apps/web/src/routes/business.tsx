import { Outlet, createFileRoute } from "@tanstack/react-router";
import { serverQueryOptions } from "@/utils/server-rpc";

import { requireSurface } from "@/auth/guard";
import { OrganizationShell } from "@/components/shells/organization-shell";
import { pageHead } from "@/navigation/seo";
import { findScreen } from "@/screens/registry";
import { loadApiStatus } from "@/utils/api-status";

/** `/business` — organization owners and employees (AC-6). Loader prefetches status and WorkspaceHome queries safely. */
export const Route = createFileRoute("/business")({
  beforeLoad: requireSurface("business"),
  head: pageHead("SCR-ORG-01"),
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
        serverQueryOptions(
          context.orpc.trips.listOrganizationTrips,
          "trips/listOrganizationTrips",
          { input: {} },
        ),
      ),
      context.queryClient.prefetchQuery(
        serverQueryOptions(
          context.orpc.organization.getOrganizationSettings,
          "organization/getOrganizationSettings",
          { input: {} },
        ),
      ),
      context.queryClient.prefetchQuery(
        serverQueryOptions(context.orpc.notifications.listInbox, "notifications/listInbox", {
          input: {},
        }),
      ),
    ]);
  },
  component: () => (
    <OrganizationShell>
      <Outlet />
    </OrganizationShell>
  ),
});
