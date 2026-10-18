import { createFileRoute } from "@tanstack/react-router";

import { ScreenById } from "@/components/shells/shell-content";
import { loadScreenForPath } from "@/navigation/load-screen";

/**
 * Public and shared pages without a file route of their own (e.g. `/verify`, `/maintenance`),
 * mapped by `navigation/web-routes.ts`. Anything else is the 404 page.
 */
export const Route = createFileRoute("/$")({
  loader: (args) => loadScreenForPath("public", args),
  component: PublicScreenRoute,
});

function PublicScreenRoute() {
  const match = Route.useLoaderData();
  return <ScreenById screenId={match.route.id} />;
}
