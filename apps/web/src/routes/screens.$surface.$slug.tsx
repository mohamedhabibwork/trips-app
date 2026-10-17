import { Link, createFileRoute } from "@tanstack/react-router";

import { findScreen, SURFACE_LABELS } from "@/screens/registry";
import type { ScreenSurface } from "@/screens/types";

export const Route = createFileRoute("/screens/$surface/$slug")({
  component: ScreenRoute,
});

function ScreenRoute() {
  const { surface, slug } = Route.useParams();
  const entry = findScreen(surface, slug);

  if (!entry) {
    return (
      <main className="container mx-auto max-w-5xl px-4 py-6">
        <p className="te-body">No screen matches this address.</p>
        <Link to="/screens" className="te-label underline">
          All screens
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
          All screens
        </Link>
        <span className="te-caption">
          {label} · {entry.id}
        </span>
      </nav>
      <Screen />
    </main>
  );
}
