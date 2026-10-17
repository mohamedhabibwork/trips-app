import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { goHome } from "./screen-actions";

/** 404. Also used for revoked links and another organization's data, so existence is never revealed. */
export function ScrShr03NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-12">
      <TeErrorState
        kind="not-found"
        description="The link may be out of date or the item was removed. Check the address, or go to home."
        actionLabel="Go to home"
        onAction={goHome}
      />
    </div>
  );
}
