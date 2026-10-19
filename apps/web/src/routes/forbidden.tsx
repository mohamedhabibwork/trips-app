import { createFileRoute } from "@tanstack/react-router";
import { isSurfaceId } from "@trips-app/auth";
import type { SurfaceId } from "@trips-app/auth";

import { ScrShr02PermissionDenied } from "@/screens/shared/scr-shr-02-permission-denied";

interface ForbiddenSearch {
  from?: SurfaceId;
}

/**
 * `/forbidden` — A3: a signed-in user who lacks the role for a surface (SCR-SHR-02).
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
  return <ScrShr02PermissionDenied />;
}
