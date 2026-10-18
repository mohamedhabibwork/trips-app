import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { goBack } from "./screen-actions";

/** Confirms a decision with an effect before it is saved. The reason is required for this change. */
export function ScrShr09ConfirmationDialog() {
  const [dialogOpen, setDialogOpen] = useState(true);
  const [reason, setReason] = useState("");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <TePageHeader
        title={t("screen.shared.scrShr09ConfirmationDialog.confirmationDialog")}
        description={t("screen.shared.scrShr09ConfirmationDialog.aDecisionScreenAsksFor")}
        actions={
          <div className="flex flex-wrap gap-2">
            <TeButton variant="secondary" onClick={() => setDialogOpen(true)}>
              {t("screen.shared.scrShr09ConfirmationDialog.reviewChange")}
            </TeButton>
            <TeButton variant="ghost" onClick={goBack}>
              {t("screen.shared.scrShr09ConfirmationDialog.back")}
            </TeButton>
          </div>
        }
      />
      <TeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t("screen.shared.scrShr09ConfirmationDialog.confirmThisChange")}
        description={t("screen.shared.scrShr09ConfirmationDialog.theChangeTakesEffectWhen")}
        primaryLabel={t("screen.shared.scrShr09ConfirmationDialog.confirmChange")}
        confirmDisabled={reason.trim() === ""}
        onPrimary={() => setDialogOpen(false)}
        secondaryLabel={t("screen.shared.scrShr09ConfirmationDialog.cancel")}
        onSecondary={() => setDialogOpen(false)}
      >
        <TeInput
          label={t("screen.shared.scrShr09ConfirmationDialog.reason")}
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          supportingText={t(
            "screen.shared.scrShr09ConfirmationDialog.requiredForThisChangeConfirm",
          )}
          required
        />
      </TeDialog>
    </div>
  );
}
