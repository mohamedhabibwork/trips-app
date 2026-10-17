import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { goBack } from "./screen-actions";

/** 403. Shown on a direct URL or action the user may not perform. Restricted data is never shown. */
export function ScrShr02PermissionDenied() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-12">
      <TeErrorState
        kind="forbidden"
        title="You don't have permission for this"
        description="Your role does not include this action. Go back to the screen you came from."
        actionLabel="Go back"
        onAction={goBack}
      />
    </div>
  );
}
