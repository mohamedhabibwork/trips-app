// E2: a blocking notice above the current route when the session ends (never a toast, never a
// redirect loop). Drafts stay mounted because the route is not unmounted by this component.
import { useLocation, useRouter } from "@tanstack/react-router";
import { Button } from "@trips-app/ui/components/button";

import { useAuth } from "../auth-context";

export function SessionExpiredDialog() {
  const { status, controller, t } = useAuth();
  const router = useRouter();
  const location = useLocation();

  if (status !== "sessionExpired") return null;

  // F2: the 12-hour cap has its own wording; every other failure gets the generic one.
  const body = controller.expiredByMaxSession
    ? t("auth.sessionExpired.bodyMax")
    : `${t("auth.sessionExpired.body")} ${t("auth.sessionExpired.drafts")}`;

  const signInAgain = async (): Promise<void> => {
    controller.clearSession("anonymous");
    await router.navigate({ to: "/sign-in", search: { returnTo: location.href }, replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
        aria-describedby="session-expired-body"
        className="bg-card text-card-foreground w-full max-w-sm border p-5 shadow-lg"
      >
        <h2 id="session-expired-title" className="mb-2 text-sm font-semibold">
          {t("auth.sessionExpired.title")}
        </h2>
        <p id="session-expired-body" className="text-muted-foreground mb-4 text-xs">
          {body}
        </p>
        <Button type="button" className="w-full" onClick={() => void signInAgain()}>
          {t("auth.sessionExpired.signInAgain")}
        </Button>
      </div>
    </div>
  );
}
