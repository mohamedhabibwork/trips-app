import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { t } from "@trips-app/i18n";
import { goHome } from "./screen-actions";

/** 404. Also used for revoked links and another organization's data, so existence is never revealed. */
export function ScrShr03NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-12">
      <TeErrorState
        kind="not-found"
        description={t("screen.shared.scrShr03NotFound.theLinkMayBeOut")}
        actionLabel={t("screen.shared.scrShr03NotFound.goToHome")}
        onAction={goHome}
      />
    </div>
  );
}
