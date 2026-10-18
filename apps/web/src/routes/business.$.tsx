import { createFileRoute } from "@tanstack/react-router";

import { ScreenById } from "@/components/shells/shell-content";
import { loadScreenForPath } from "@/navigation/load-screen";

/** Every other organization page, mapped by `navigation/web-routes.ts` (e.g. `/business/trips`). */
export const Route = createFileRoute("/business/$")({
  loader: (args) => loadScreenForPath("organization", args),
  component: OrganizationScreenRoute,
});

function OrganizationScreenRoute() {
  const match = Route.useLoaderData();
  return <ScreenById screenId={match.route.id} />;
}
