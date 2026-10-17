// Renders a protected surface only once the client has hydrated and the session is known.
//
// This is the "hydration shell" of ARCHITECTURE §4.3: the server and the first client paint show the
// loading shell (identical markup), and the guard's redirect lands on the next frame.
import { useAuth, useAuthStatus } from "@/auth/auth-context";
import { LoadingShell } from "@/auth/components/loading-shell";
import { useHydrated } from "@/auth/hydration";
import { SurfacePage } from "@/components/surface-page";
import type { SurfaceInfo } from "@/types";

export function GuardedSurface({ surface }: { surface: SurfaceInfo }) {
  const hydrated = useHydrated();
  const status = useAuthStatus();
  const { locale } = useAuth();

  if (!hydrated || status === "loading") {
    return <LoadingShell locale={locale} />;
  }

  return <SurfacePage surface={surface} />;
}
