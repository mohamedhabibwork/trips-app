import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { goSignIn } from "./screen-actions";

/** 401. The session is missing or no longer valid. Sign-in returns the user to the app. */
export function ScrShr04Unauthorized() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-12">
      <TeErrorState
        kind="unauthorized"
        title="Sign in to continue"
        description="Your session is no longer valid. Sign in again and you return to this page."
        actionLabel="Sign in"
        onAction={goSignIn}
      />
    </div>
  );
}
