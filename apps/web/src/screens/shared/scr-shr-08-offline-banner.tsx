import { TeOfflineBanner } from "@trips-app/ui/components/te-offline-banner";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { retryPage } from "./screen-actions";

/** Connection lost. The banner stays above the current screen until the connection returns. */
export function ScrShr08OfflineBanner() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <TeOfflineBanner
        message="You are offline. Viewing saved trips still works. Booking and payment actions are paused until the connection returns."
        onRetry={retryPage}
        retryLabel="Retry"
      />
      <TePageHeader
        title="Offline banner"
        description="The banner sits above the current screen and clears when the connection returns."
      />
      <p className="te-body">
        Content already on screen stays visible. Actions that need a connection are disabled until
        the app is back online.
      </p>
    </div>
  );
}
