import { Link, createFileRoute } from "@tanstack/react-router";

import { findScreen, SURFACE_LABELS } from "@/screens/registry";
import type { ScreenSurface } from "@/screens/types";
import { t } from "@trips-app/i18n";

export const Route = createFileRoute("/screens/$surface/$slug")({
  loader: async ({ context, params, location }) => {
    const screen = findScreen(params.surface, params.slug);
    if (screen?.loader) {
      try {
        await screen.loader({
          queryClient: context.queryClient,
          orpc: context.orpc,
          auth: context.auth,
          params,
          search: (location?.search as Record<string, unknown>) ?? {},
        });
      } catch {
        // Gracefully allow route to render if prefetch fails (e.g. unauthenticated SSR or offline preview)
      }
    }
  },
  component: ScreenRoute,
});

function ScreenRoute() {
  const { surface, slug } = Route.useParams();
  const entry = findScreen(surface, slug);

  if (!entry) {
    return (
      <main className="container mx-auto max-w-5xl px-4 py-6">
        <p className="te-body">{t("route.screens$surface$slug.noScreenMatchesThisAddress")}</p>
        <Link to="/screens" className="te-label underline">
          {t("route.screens$surface$slug.allScreens")}
        </Link>
      </main>
    );
  }

  const Screen = entry.component;
  const label = SURFACE_LABELS[entry.surface as ScreenSurface];
  return (
    <main className="container mx-auto grid max-w-5xl gap-6 px-4 py-6">
      <nav className="flex flex-wrap items-center gap-3">
        <Link to="/screens" className="te-label underline">
          {t("route.screens$surface$slug.allScreens2")}
        </Link>
        <span className="te-caption">
          {label} · {entry.id}
        </span>
      </nav>
      <Screen />
    </main>
  );
}
