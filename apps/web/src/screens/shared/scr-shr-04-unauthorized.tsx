// SCR-SHR-04 Unauthorized (401): the session has ended; signing in returns to the app.
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { buttonClass } from "@/components/kit/controls";
import { pathFor } from "@/navigation/web-routes";

import { ErrorPage } from "./error-page";

export function ScrShr04Unauthorized() {
  const { t } = useAuth();
  return (
    <ErrorPage
      status={401}
      icon="user"
      tone="warning"
      title={t("screen.shared.unauthorized.title")}
      body={t("screen.shared.unauthorized.body")}
      action={
        <Link to={pathFor("SCR-PUB-08")} className={buttonClass("primary", true)}>
          {t("screen.auth.signIn.submit")}
        </Link>
      }
    />
  );
}
