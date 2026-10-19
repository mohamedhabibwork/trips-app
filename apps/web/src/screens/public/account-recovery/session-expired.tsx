// SCR-PUB-14 Session expired (`/session-expired`): the same card as the in-app session dialog, on
// the dimmed page. Signing in returns to the app.
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { SessionEndedCard } from "@/auth/components/session-expired-dialog";
import { buttonClass } from "@/components/kit/controls";
import { pathFor } from "@/navigation/web-routes";

export function SessionExpired() {
  const { t } = useAuth();
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--te-glass-dim)] p-4 py-12">
      <SessionEndedCard
        maxSession
        modal={false}
        action={
          <Link to={pathFor("SCR-PUB-08")} className={buttonClass("primary")}>
            {t("screen.auth.signIn.submit")}
          </Link>
        }
      />
    </div>
  );
}
