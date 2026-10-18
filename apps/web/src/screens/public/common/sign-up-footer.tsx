import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { t } from "@trips-app/i18n";
import { ScreenLink } from "../../shared/screen-link";
import { AUTH_ROUTES } from "./auth-routes";

interface SignUpFooterProps {
  submitLabel: string;
  disabled: boolean;
}

/** Submit for a sign-up form, the next step after it, and the way back to sign-in. */
export function SignUpFooter({ submitLabel, disabled }: SignUpFooterProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <TeButton type="submit" variant="primary" size="lg" disabled={disabled}>
          {submitLabel}
        </TeButton>
      </div>
      <p className="te-body">
        {t("screen.public.common.signUpFooter.nextConfirmYourDetailsWith")}{" "}
        <ScreenLink surface="public" slug="verification-by-code">
          {t("screen.public.common.signUpFooter.verificationByCode")}
        </ScreenLink>
      </p>
      <p className="te-body">
        {t("screen.public.common.signUpFooter.alreadyHaveAnAccount")}{" "}
        <Link to={AUTH_ROUTES.signIn} className="te-link">
          {t("screen.public.common.signUpFooter.signIn")}
        </Link>
      </p>
    </div>
  );
}
