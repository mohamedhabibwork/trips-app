import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { retryPage } from "./screen-actions";

/** 503. Temporary outage. Payment callbacks queue during the outage (NFR-AVL-03). */
export function ScrShr06ServiceUnavailable() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center gap-4 px-4 py-12">
      <TeErrorState
        kind="unavailable"
        title="Service is temporarily unavailable"
        description="We are restoring the service. Booking payments are not lost: callbacks are queued and processed when the service returns."
        actionLabel="Retry"
        onAction={retryPage}
      />
      <p className="te-caption">Updates are posted on the status page.</p>
    </div>
  );
}
