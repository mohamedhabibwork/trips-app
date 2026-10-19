// Loader shared by the screen routes: runs the screen's prefetch with the route's params.
import { findScreenById } from "@/screens/registry";
import type { ScreenLoaderContext } from "@/screens/types";

import { webRouteById } from "./web-routes";

interface LoaderArguments {
  context: Pick<ScreenLoaderContext, "queryClient" | "orpc" | "auth">;
  params: Record<string, string>;
  location: { search?: unknown };
}

/**
 * The `loader` of a screen's file route. On the server a page that needs a session is not
 * prefetched without a token, so no 401 is dehydrated into the page (same rule as the surface
 * routes). A failed prefetch never blocks the page: the screen's own query shows its error state.
 */
export function screenLoader(screenId: string) {
  const route = webRouteById(screenId);
  if (!route) throw new Error(`No web route for screen ${screenId}`);
  const needsSession = route.area !== "public" || route.signedIn === true;

  return async ({ context, params, location }: LoaderArguments): Promise<void> => {
    if (needsSession && typeof window === "undefined" && !context.auth.accessToken()) return;

    const loader = findScreenById(screenId)?.loader;
    if (!loader) return;

    try {
      await loader({
        ...context,
        params,
        search: (location.search as Record<string, unknown> | undefined) ?? {},
      });
    } catch {
      // The screen's query renders its own error state.
    }
  };
}
