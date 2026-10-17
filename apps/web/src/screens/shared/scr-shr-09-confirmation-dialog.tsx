import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { goBack } from "./screen-actions";

/** Confirms a decision with an effect before it is saved. The reason is required for this change. */
export function ScrShr09ConfirmationDialog() {
  const [dialogOpen, setDialogOpen] = useState(true);
  const [reason, setReason] = useState("");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <TePageHeader
        title="Confirmation dialog"
        description="A decision screen asks for confirmation before the change is saved."
        actions={
          <div className="flex flex-wrap gap-2">
            <TeButton variant="secondary" onClick={() => setDialogOpen(true)}>
              Review change
            </TeButton>
            <TeButton variant="ghost" onClick={goBack}>
              Back
            </TeButton>
          </div>
        }
      />
      <TeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Confirm this change"
        description="The change takes effect when you confirm. Affected travelers are notified before it applies. This action is recorded."
        primaryLabel="Confirm change"
        confirmDisabled={reason.trim() === ""}
        onPrimary={() => setDialogOpen(false)}
        secondaryLabel="Cancel"
        onSecondary={() => setDialogOpen(false)}
      >
        <TeInput
          label="Reason"
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          supportingText="Required for this change. Confirm stays disabled until it is filled."
          required
        />
      </TeDialog>
    </div>
  );
}
