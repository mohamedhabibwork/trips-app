// D5: a pending application stores **no** session. The screen is static and only shows the contact
// the applicant gave, so they know where the decision will arrive.
import { Link } from "@tanstack/react-router";

import { useAuth } from "../auth-context";
import { AuthShell } from "../components/auth-shell";

export function PendingApprovalScreen({ contact }: { contact: string }) {
  const { t } = useAuth();

  return (
    <AuthShell title={t("auth.pending.title")} subtitle={t("auth.pending.body", { contact })}>
      <p className="text-muted-foreground text-xs">{t("auth.error.pendingApproval")}</p>
      <Link to="/sign-in" className="text-xs underline underline-offset-4">
        {t("auth.pending.backToSignIn")}
      </Link>
    </AuthShell>
  );
}
