import { Link, createFileRoute } from "@tanstack/react-router";

import { ALL_SCREENS, SURFACE_LABELS, screenPath } from "@/screens/registry";
import type { ScreenSurface } from "@/screens/types";
import { t } from "@trips-app/i18n";

export const Route = createFileRoute("/screens/")({
  component: ScreensIndex,
});

const SURFACE_ORDER: readonly ScreenSurface[] = ["public", "shared", "organization", "admin"];

function ScreensIndex() {
  return (
    <main className="container mx-auto grid max-w-5xl gap-8 px-4 py-6">
      <header className="grid gap-2">
        <h1 className="te-h1">{t("route.screensIndex.screens")}</h1>
        <p className="te-body">
          {ALL_SCREENS.length} {t("route.screensIndex.screensAcrossTheWebSurfaces")}
        </p>
      </header>
      {SURFACE_ORDER.map((surface) => {
        const screens = ALL_SCREENS.filter((screen) => screen.surface === surface);
        return (
          <section key={surface} className="grid gap-3">
            <h2 className="te-h2">{SURFACE_LABELS[surface]}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {screens.map((screen) => (
                <li key={screen.id}>
                  <Link to={screenPath(screen)} className="te-card flex flex-col gap-1 p-4">
                    <span className="te-label">{t(screen.titleKey)}</span>
                    <span className="te-caption">{screen.id}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
