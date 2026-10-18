// SCR-PUB-15 Account suspended (`/account/suspended?reason=…`): access is stopped by an admin. The
// reason comes from the sign-in refusal that sent the user here.
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Button, StatusPill, buttonClass } from "@/components/kit/controls";
import { ActionRow, CenteredPanel, Lead, PanelHeading } from "@/components/kit/layout";
import { pathFor } from "@/navigation/web-routes";

export function AccountSuspended() {
  const { t, status, signOut } = useAuth();
  const navigate = useNavigate();
  const reason = useRouterState({
    select: (state) => {
      const value = (state.location.search as Record<string, unknown>).reason;
      return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
    },
  });

  return (
    <CenteredPanel width={560} role="alert" accent="danger">
      <StatusPill tone="danger" icon="lock">
        {t("screen.public.accountSuspended.badge")}
      </StatusPill>
      <PanelHeading>{t("screen.public.accountSuspended.title")}</PanelHeading>
      {reason ? (
        <p className="m-0 text-base leading-6">
          {t("screen.public.accountSuspended.reason", { reason })}
        </p>
      ) : null}
      <Lead>{t("screen.public.accountSuspended.body")}</Lead>
      <ActionRow>
        {status === "authenticated" ? (
          <Button
            tone="outline"
            onClick={() => {
              void signOut().then(() => navigate({ to: pathFor("SCR-PUB-08") }));
            }}
          >
            {t("screen.public.accountSuspended.signOut")}
          </Button>
        ) : (
          <Link to={pathFor("SCR-PUB-08")} className={buttonClass("outline")}>
            {t("auth.pending.backToSignIn")}
          </Link>
        )}
      </ActionRow>
    </CenteredPanel>
  );
}
