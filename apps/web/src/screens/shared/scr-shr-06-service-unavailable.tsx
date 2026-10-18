import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { t } from "@trips-app/i18n";
import { retryPage } from "./screen-actions";

/** 503. Temporary outage. Payment callbacks queue during the outage (NFR-AVL-03). */
export function ScrShr06ServiceUnavailable() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center gap-4 px-4 py-12">
      <TeErrorState
        kind="unavailable"
        title={t("screen.shared.scrShr06ServiceUnavailable.serviceIsTemporarilyUnavailable")}
        description={t("screen.shared.scrShr06ServiceUnavailable.weAreRestoringTheService")}
        actionLabel={t("screen.shared.scrShr06ServiceUnavailable.retry")}
        onAction={retryPage}
      />
      <p className="te-caption">
        {t("screen.shared.scrShr06ServiceUnavailable.updatesArePostedOnThe")}
      </p>
    </div>
  );
}
