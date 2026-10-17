// SSR / hydration helpers (ARCHITECTURE §4.3).
//
// The first client render must be byte-identical to the server render, so anything that depends on
// `localStorage` renders only after mount. Written without JSX to keep this file a plain `.ts`
// module (it is imported by route components and by tests).
import { Fragment, createElement, useEffect, useState } from "react";
import type { ReactNode } from "react";

/** False during SSR and on the first client paint, true afterwards. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

/**
 * Renders `fallback` until the client has hydrated, then `children`.
 *
 * Protected pages wrap their content in this: the server sends the loading shell, the first client
 * paint repeats it, and the guard's redirect lands on the next frame — no sign-in flash (AC-4).
 */
export function HydrationGate({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}): ReactNode {
  const hydrated = useHydrated();
  return createElement(Fragment, null, hydrated ? children : fallback);
}
