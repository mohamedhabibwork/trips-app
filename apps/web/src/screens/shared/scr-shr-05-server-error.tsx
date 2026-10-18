// SCR-SHR-05 Server error (500), also the router's default error component. Shows the request
// identifier for support when the failed response carried one (IF-03).
import { Link, useRouter } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { extractTransportError } from "@/auth/errors";
import { Button, linkClass } from "@/components/kit/controls";

import { ErrorPage } from "./error-page";

interface ServerErrorProps {
  /** The error the router caught, when shown as the default error component. */
  error?: unknown;
  /** Clears the router's error boundary before retrying. */
  reset?: () => void;
}

export function ScrShr05ServerError({ error, reset }: ServerErrorProps = {}) {
  const { t } = useAuth();
  const router = useRouter();
  const requestId = error === undefined ? undefined : extractTransportError(error).requestId;

  function retry() {
    if (reset) {
      reset();
      void router.invalidate();
      return;
    }
    window.location.reload();
  }

  return (
    <ErrorPage
      status={500}
      icon="alert"
      tone="danger"
      title={t("screen.shared.serverError.title")}
      body={t("screen.shared.serverError.body")}
      note={
        requestId ? (
          <p className="m-0 text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
            {t("screen.shared.serverError.reference")}{" "}
            <span dir="ltr" className="font-semibold text-[var(--te-ink)]">
              {requestId}
            </span>
          </p>
        ) : null
      }
      action={
        <Button block onClick={retry}>
          {t("screen.shared.errorPage.tryAgain")}
        </Button>
      }
      secondary={
        <Link to="/" className={linkClass("ink")}>
          {t("screen.shared.errorPage.goHome")}
        </Link>
      }
    />
  );
}
