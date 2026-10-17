import { Link } from "@tanstack/react-router";
import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { retryPage } from "./screen-actions";

// Placeholder. Each response carries its own request identifier (IF-03).
const REQUEST_REFERENCE = "req_example";

/** 500. Something failed on the server. The request identifier is shown for support. */
export function ScrShr05ServerError() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center gap-4 px-4 py-12">
      <TeErrorState
        kind="server"
        referenceId={REQUEST_REFERENCE}
        referenceLabel="Request ID"
        actionLabel="Try again"
        onAction={retryPage}
      />
      <Link to="/" className="te-link">
        Go to home
      </Link>
    </div>
  );
}
