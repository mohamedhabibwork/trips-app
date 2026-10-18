// Loader shared by the catch-all routes: maps the URL to a screen and runs that screen's prefetch.
import { notFound } from "@tanstack/react-router";

import { findScreenById } from "@/screens/registry";
import type { ScreenLoaderContext } from "@/screens/types";

import { matchWebRoute } from "./web-routes";
import type { RouteMatch, WebArea } from "./web-routes";

interface LoaderArguments {
  context: Pick<ScreenLoaderContext, "queryClient" | "orpc" | "auth">;
  location: { pathname: string; search?: unknown };
}

/**
 * Throws `notFound()` for a path no screen owns. On the server a protected page is not prefetched
 * without a token, so no 401 is dehydrated into the page (same rule as the surface routes).
 */
export async function loadScreenForPath(
  area: WebArea,
  { context, location }: LoaderArguments,
): Promise<RouteMatch> {
  const match = matchWebRoute(area, location.pathname);
  if (!match) throw notFound();

  const isProtected = area !== "public";
  if (isProtected && typeof window === "undefined" && !context.auth.accessToken()) return match;

  const loader = findScreenById(match.route.id)?.loader;
  if (!loader) return match;

  try {
    await loader({
      ...context,
      params: match.params,
      search: (location.search as Record<string, unknown> | undefined) ?? {},
    });
  } catch {
    // A failed prefetch must not block the page: the screen's own query shows its error state.
  }
  return match;
}
