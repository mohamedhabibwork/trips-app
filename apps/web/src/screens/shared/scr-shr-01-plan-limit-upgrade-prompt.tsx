import { useState } from "react";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TePlanGate } from "@trips-app/ui/components/te-plan-gate";
import { StatePreview } from "./state-preview";

const LIMITED_PLAN = "Starter";

/** Shown in place of a blocked, limited action. The upgrade is immediate and prorated. */
export function ScrShr01PlanLimitUpgradePrompt() {
  const [dialogOpen, setDialogOpen] = useState(true);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <TePageHeader
        title="Plan-limit upgrade prompt"
        description="A plan limit blocks this action. Upgrading lifts the limit."
      />
      <StatePreview
        main={
          <TePlanGate
            plan={LIMITED_PLAN}
            lockedLabel="This action is locked on your current plan."
            onUpgrade={() => setDialogOpen(true)}
            upgradeLabel={`Upgrade to ${LIMITED_PLAN}`}
          />
        }
        error={
          <TeInlineAlert tone="error" title="Payment failed">
            The upgrade did not go through, so the action stays blocked. Try another payment method.
          </TeInlineAlert>
        }
      />
      <TeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Plan limit reached"
        description="Your current plan does not allow this action. Upgrading takes effect immediately and is prorated."
        primaryLabel={`Upgrade to ${LIMITED_PLAN}`}
        onPrimary={() => undefined}
        secondaryLabel="Cancel"
        onSecondary={() => setDialogOpen(false)}
      >
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 te-body">
          <dt className="te-label">Limit</dt>
          <dd>Limit name from the blocked action</dd>
          <dt className="te-label">Lifted by</dt>
          <dd>{LIMITED_PLAN}</dd>
        </dl>
      </TeDialog>
    </div>
  );
}
