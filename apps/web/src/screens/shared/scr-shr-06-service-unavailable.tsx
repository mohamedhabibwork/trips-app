// SCR-SHR-06 Service unavailable (503): payments are queued, not lost.
import { useAuth } from "@/auth/auth-context";
import { Button } from "@/components/kit/controls";

import { ErrorPage } from "./error-page";

export function ScrShr06ServiceUnavailable() {
  const { t } = useAuth();
  return (
    <ErrorPage
      status={503}
      icon="clock"
      tone="warning"
      title={t("screen.shared.serviceUnavailable.title")}
      body={t("screen.shared.serviceUnavailable.body")}
      action={
        <Button block onClick={() => window.location.reload()}>
          {t("screen.shared.errorPage.tryAgain")}
        </Button>
      }
    />
  );
}
