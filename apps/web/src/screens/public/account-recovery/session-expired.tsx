import { Link } from "@tanstack/react-router";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { t } from "@trips-app/i18n";
import { buttonLinkClass } from "../../shared/button-link";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";

/** Shown after 12 hours of web use or a refused token. Drafts are kept. Sign-in returns to the same app. */
export function SessionExpired() {
  return (
    <AuthFrame
      title={t("screen.public.accountRecovery.sessionExpired.sessionExpired")}
      description={t("screen.public.accountRecovery.sessionExpired.forYourSecurityYouWere")}
    >
      <TeInlineAlert
        tone="info"
        title={t("screen.public.accountRecovery.sessionExpired.draftsKept")}
      >
        {t("screen.public.accountRecovery.sessionExpired.signInToContinueWhere")}
      </TeInlineAlert>
      <div>
        <Link to={AUTH_ROUTES.signIn} className={buttonLinkClass("primary", "lg")}>
          {t("screen.public.accountRecovery.sessionExpired.signIn")}
        </Link>
      </div>
    </AuthFrame>
  );
}
