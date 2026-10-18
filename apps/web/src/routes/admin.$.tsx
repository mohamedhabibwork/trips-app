import { createFileRoute } from "@tanstack/react-router";

import { ScreenById } from "@/components/shells/shell-content";
import { loadScreenForPath } from "@/navigation/load-screen";

/** Every other admin page, mapped by `navigation/web-routes.ts` (e.g. `/admin/applications`). */
export const Route = createFileRoute("/admin/$")({
  loader: (args) => loadScreenForPath("admin", args),
  component: AdminScreenRoute,
});

function AdminScreenRoute() {
  const match = Route.useLoaderData();
  return <ScreenById screenId={match.route.id} />;
}
