import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireSurface } from "@/auth/guard";
import { AdminShell } from "@/components/shells/admin-shell";
import { findScreen } from "@/screens/registry";
import { loadApiStatus } from "@/utils/api-status";

/** `/admin` — platform admins only (AC-6). Loader prefetches status and AdminHome queries safely. */
export const Route = createFileRoute("/admin")({
  beforeLoad: requireSurface("admin"),
  loader: async ({ context, location }) => {
    await loadApiStatus({ context });

    // Handle unauthenticated SSR safely: avoid 401 cache dehydration
    if (typeof window === "undefined" && !context.auth.accessToken()) {
      return;
    }

    const screen = findScreen("admin", "admin-home");
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

    // Prefetch for AdminHome queries when authenticated
    await Promise.allSettled([
      context.queryClient.prefetchQuery(
        context.orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
      ),
      context.queryClient.prefetchQuery(
        context.orpc.accounting.listAdminReconciliationExceptions.queryOptions(),
      ),
      context.queryClient.prefetchQuery(
        context.orpc.coupons.listPlatformCoupons.queryOptions({ input: {} }),
      ),
    ]);
  },
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
});
