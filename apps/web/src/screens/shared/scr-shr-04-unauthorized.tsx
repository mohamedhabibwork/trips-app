import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { t } from "@trips-app/i18n";
import { goSignIn } from "./screen-actions";

/** 401. The session is missing or no longer valid. Sign-in returns the user to the app. */
export function ScrShr04Unauthorized() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-12">
      <TeErrorState
        kind="unauthorized"
        title={t("screen.shared.scrShr04Unauthorized.signInToContinue")}
        description={t("screen.shared.scrShr04Unauthorized.yourSessionIsNoLonger")}
        actionLabel={t("screen.shared.scrShr04Unauthorized.signIn")}
        onAction={goSignIn}
      />
    </div>
  );
}
