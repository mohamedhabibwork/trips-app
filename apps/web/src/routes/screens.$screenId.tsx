import { Link, createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { findScreenById, screenPath } from "@/screens/registry";
import { t } from "@trips-app/i18n";

// Old SCR-… addresses redirect to the readable path of the same screen.
export const Route = createFileRoute("/screens/$screenId")({
  beforeLoad: ({ params }) => {
    const entry = findScreenById(params.screenId);
    if (!entry) {
      throw notFound();
    }
    throw redirect({ href: screenPath(entry) });
  },
  notFoundComponent: () => (
    <main className="container mx-auto max-w-5xl px-4 py-6">
      <p className="te-body">{t("route.screens$screenId.noScreenMatchesThisAddress")}</p>
      <Link to="/screens" className="te-label underline">
        {t("route.screens$screenId.allScreens")}
      </Link>
    </main>
  ),
});
