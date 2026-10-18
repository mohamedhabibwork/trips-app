import { TeOfflineBanner } from "@trips-app/ui/components/te-offline-banner";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { retryPage } from "./screen-actions";

/** Connection lost. The banner stays above the current screen until the connection returns. */
export function ScrShr08OfflineBanner() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <TeOfflineBanner
        message={t("screen.shared.scrShr08OfflineBanner.youAreOfflineViewingSaved")}
        onRetry={retryPage}
        retryLabel={t("screen.shared.scrShr08OfflineBanner.retry")}
      />
      <TePageHeader
        title={t("screen.shared.scrShr08OfflineBanner.offlineBanner")}
        description={t("screen.shared.scrShr08OfflineBanner.theBannerSitsAboveThe")}
      />
      <p className="te-body">
        {t("screen.shared.scrShr08OfflineBanner.contentAlreadyOnScreenStays")}
      </p>
    </div>
  );
}
