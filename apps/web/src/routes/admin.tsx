import { Outlet, createFileRoute } from "@tanstack/react-router";
import { serverQueryOptions } from "@/utils/server-rpc";

import { requireSurface } from "@/auth/guard";
import { AdminShell } from "@/components/shells/admin-shell";
import { findScreen } from "@/screens/registry";
import { pageHead } from "@/navigation/seo";
import { loadApiStatus } from "@/utils/api-status";

/** `/admin` — platform admins only (AC-6). Loader prefetches status and AdminHome queries safely. */
export const Route = createFileRoute("/admin")({
  beforeLoad: requireSurface("admin"),
  head: pageHead("SCR-ADM-01"),
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
        serverQueryOptions(context.orpc.onboarding.listReviewQueue, "onboarding/listReviewQueue", {
          input: {},
        }),
      ),
      context.queryClient.prefetchQuery(
        serverQueryOptions(
          context.orpc.accounting.listAdminReconciliationExceptions,
          "accounting/listAdminReconciliationExceptions",
          { input: undefined },
        ),
      ),
      context.queryClient.prefetchQuery(
        serverQueryOptions(
          context.orpc.coupons.listPlatformCoupons,
          "coupons/listPlatformCoupons",
          { input: {} },
        ),
      ),
    ]);
  },
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
});
