// SCR-SHR-03 Not found (404): the root not-found page for any path no screen owns.
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { buttonClass } from "@/components/kit/controls";

import { ErrorPage } from "./error-page";

export function ScrShr03NotFound() {
  const { t } = useAuth();
  return (
    <ErrorPage
      status={404}
      icon="search"
      tone="info"
      title={t("screen.shared.notFound.title")}
      body={t("screen.shared.notFound.body")}
      action={
        <Link to="/" className={buttonClass("primary", true)}>
          {t("screen.shared.errorPage.backHome")}
        </Link>
      }
    />
  );
}
