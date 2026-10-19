// SCR-SHR-02 Permission denied (403), also the `/forbidden` page: a signed-in user whose role does
// not include the area. Static: no API call and the session is kept.
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { buttonClass } from "@/components/kit/controls";

import { ErrorPage } from "./error-page";

export function ScrShr02PermissionDenied() {
  const { t } = useAuth();
  return (
    <ErrorPage
      status={403}
      icon="lock"
      tone="danger"
      title={t("screen.shared.permissionDenied.title")}
      body={t("screen.shared.permissionDenied.body")}
      action={
        <Link to="/" className={buttonClass("primary", true)}>
          {t("screen.shared.errorPage.backHome")}
        </Link>
      }
    />
  );
}
