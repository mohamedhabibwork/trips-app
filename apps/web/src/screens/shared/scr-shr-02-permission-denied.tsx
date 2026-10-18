import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { t } from "@trips-app/i18n";
import { goBack } from "./screen-actions";

/** 403. Shown on a direct URL or action the user may not perform. Restricted data is never shown. */
export function ScrShr02PermissionDenied() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-12">
      <TeErrorState
        kind="forbidden"
        title={t("screen.shared.scrShr02PermissionDenied.youDonTHavePermission")}
        description={t("screen.shared.scrShr02PermissionDenied.yourRoleDoesNotInclude")}
        actionLabel={t("screen.shared.scrShr02PermissionDenied.goBack")}
        onAction={goBack}
      />
    </div>
  );
}
