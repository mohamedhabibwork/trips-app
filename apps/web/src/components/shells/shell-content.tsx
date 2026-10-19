// What the shells share besides chrome: waiting for the session before showing a protected page
// and knowing which sidebar section is open. (ScreenById lives in screen-by-id.tsx so this module
// never imports the screen registry back.)
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth, useAuthStatus } from "@/auth/auth-context";
import { LoadingShell } from "@/auth/components/loading-shell";
import { useHydrated } from "@/auth/hydration";
import { matchWebRoute } from "@/navigation/web-routes";
import type { WebArea } from "@/navigation/web-routes";

interface ShellContentProps {
  children: ReactNode;
}

/**
 * The hydration shell (ARCHITECTURE §4.3) for a protected page: server and first client paint show
 * the loading state, and the guard's redirect lands on the next frame.
 */
export function ShellContent({ children }: ShellContentProps) {
  const hydrated = useHydrated();
  const status = useAuthStatus();
  const { locale } = useAuth();

  if (!hydrated || status === "loading") {
    return <LoadingShell locale={locale} />;
  }
  return <>{children}</>;
}

export function usePathname(): string {
  return useRouterState({ select: (state) => state.location.pathname });
}

/** The sidebar section of the page being shown, from its web route. */
export function useActiveSection(area: WebArea): string | undefined {
  const pathname = usePathname();
  return matchWebRoute(area, pathname)?.route.section;
}
