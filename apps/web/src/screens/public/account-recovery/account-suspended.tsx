import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { t } from "@trips-app/i18n";
import { AuthFrame } from "../common/auth-frame";

/** Access is stopped by an admin. No data is shown and sign-in is refused while the suspension lasts. */
export function AccountSuspended() {
  return (
    <AuthFrame
      title={t("screen.public.accountRecovery.accountSuspended.accountSuspended")}
      description={t("screen.public.accountRecovery.accountSuspended.accessToThisAccountIs")}
    >
      <TeInlineAlert
        tone="error"
        title={t("screen.public.accountRecovery.accountSuspended.reason")}
      >
        {t("screen.public.accountRecovery.accountSuspended.theReasonFromTheSuspension")}
      </TeInlineAlert>
      <p className="te-body">
        {t("screen.public.accountRecovery.accountSuspended.toAskForAReview")}
      </p>
    </AuthFrame>
  );
}
