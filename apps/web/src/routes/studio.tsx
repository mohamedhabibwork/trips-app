import { Outlet, createFileRoute } from "@tanstack/react-router";
import { serverQueryOptions } from "@/utils/server-rpc";

import { requireSurface } from "@/auth/guard";
import { StudioShell } from "@/components/shells/studio-shell";
import { findScreen } from "@/screens/registry";
import { loadApiStatus } from "@/utils/api-status";

/** `/studio` — photographers (SCR-PHO, docs/design/web/PhoWeb*). Loader prefetches status and the studio home queries safely. */
export const Route = createFileRoute("/studio")({
  beforeLoad: requireSurface("studio"),
  loader: async ({ context, location }) => {
    await loadApiStatus({ context });

    // Handle unauthenticated SSR safely: avoid 401 cache dehydration
    if (typeof window === "undefined" && !context.auth.accessToken()) {
      return;
    }

    const screen = findScreen("studio", "studio-home");
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

    // Prefetch for the studio home queries when authenticated
    await Promise.allSettled([
      context.queryClient.prefetchQuery(
        serverQueryOptions(context.orpc.photographer.getProfile, "photographer/getProfile", {
          input: undefined,
        }),
      ),
      context.queryClient.prefetchQuery(
        serverQueryOptions(
          context.orpc.negotiation.listSupplierOffers,
          "negotiation/listSupplierOffers",
          { input: {} },
        ),
      ),
    ]);
  },
  component: () => (
    <StudioShell>
      <Outlet />
    </StudioShell>
  ),
});
