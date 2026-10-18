// SCR-SHR-08 Offline banner on its catalog page. The public shell mounts `OfflineBanner`, which
// shows itself only while the browser is offline.
import { useAuth } from "@/auth/auth-context";

import { OfflineBanner } from "./offline-banner";

export function ScrShr08OfflineBanner() {
  const { t } = useAuth();
  return (
    <div className="flex flex-col">
      <OfflineBanner forceVisible />
      <div className="mx-auto flex w-full max-w-[440px] flex-col gap-3 px-4 py-4">
        <h1 className="m-0 text-2xl leading-8 font-bold">{t("screen.shared.offline.example")}</h1>
        <p className="m-0 text-sm text-[var(--te-ink-muted)]">
          {t("screen.shared.offline.exampleBody")}
        </p>
      </div>
    </div>
  );
}
