import { Link, createFileRoute } from "@tanstack/react-router";
import { isSurfaceId } from "@trips-app/auth";
import type { SurfaceId } from "@trips-app/auth";

import { useAuth } from "@/auth/auth-context";
import { AuthShell } from "@/auth/components/auth-shell";

interface ForbiddenSearch {
  from?: SurfaceId;
}

/**
 * `/forbidden` — A3: a signed-in user who lacks the role for a surface.
 *
 * Static by design: no API call, no store write, and the session is never cleared. Reloading or
 * following the link home must still work.
 */
export const Route = createFileRoute("/forbidden")({
  validateSearch: (search: Record<string, unknown>): ForbiddenSearch => ({
    from: isSurfaceId(search.from) ? search.from : undefined,
  }),
  component: ForbiddenRoute,
});

function ForbiddenRoute() {
  const { t } = useAuth();
  const { from } = Route.useSearch();
  const surface = from ?? "traveler";

  return (
    <AuthShell title={t("auth.forbidden.title")} subtitle={t("auth.forbidden.body", { surface })}>
      <Link to="/" className="text-xs underline underline-offset-4">
        {t("auth.forbidden.backHome")}
      </Link>
    </AuthShell>
  );
}
