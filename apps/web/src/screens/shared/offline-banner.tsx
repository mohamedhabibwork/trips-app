// The offline banner from SCR-SHR-08: appears under the header while the browser is offline. Saved
// content stays readable; actions that need the server wait until the connection returns.
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { useSyncExternalStore } from "react";

import { useAuth } from "@/auth/auth-context";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** Whether the browser reports a connection; the server render assumes it does. */
export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}

interface OfflineBannerProps {
  /** Show it even when online (the catalog page). */
  forceVisible?: boolean;
}

export function OfflineBanner({ forceVisible = false }: OfflineBannerProps) {
  const { t } = useAuth();
  const online = useOnline();
  if (online && !forceVisible) return null;
  return (
    <div
      role="status"
      className="mx-3 mt-3 flex flex-col gap-1 rounded-[var(--te-radius-md)] bg-[var(--te-warning-soft)] px-3.5 py-3 text-[var(--te-warning)] shadow-[var(--te-card-shadow)] md:mx-auto md:w-full md:max-w-[1184px]"
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <TeIcon name="offline" className="size-4" />
        {t("screen.shared.offline.title")}
      </span>
      <span className="text-[13px] leading-[18px] text-[var(--te-ink)]">
        {t("screen.shared.offline.body")}
      </span>
    </div>
  );
}
