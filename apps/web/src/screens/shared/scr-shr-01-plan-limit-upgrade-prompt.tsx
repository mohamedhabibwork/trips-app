import { useState } from "react";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TePlanGate } from "@trips-app/ui/components/te-plan-gate";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "./state-preview";

const LIMITED_PLAN = "Starter";

/** Shown in place of a blocked, limited action. The upgrade is immediate and prorated. */
export function ScrShr01PlanLimitUpgradePrompt() {
  const queryClient = useQueryClient();
  const upgradeMutation = useMutation(
    orpc.plans.changeOrganizationPlan.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.plans.key() });
      },
    }),
  );
  const [dialogOpen, setDialogOpen] = useState(true);

  const handleUpgrade = async () => {
    try {
      await upgradeMutation.mutateAsync({
        planId: "org_pro",
        billingCycle: "monthly",
      });
    } catch {
      // Allow dialog close in unauthenticated preview
    }
    setDialogOpen(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <TePageHeader
        title={t("screen.shared.scrShr01PlanLimitUpgradePrompt.planLimitUpgradePrompt")}
        description={t("screen.shared.scrShr01PlanLimitUpgradePrompt.aPlanLimitBlocksThis")}
      />
      <StatePreview
        main={
          <TePlanGate
            plan={LIMITED_PLAN}
            lockedLabel={t("screen.shared.scrShr01PlanLimitUpgradePrompt.thisActionIsLockedOn")}
            onUpgrade={() => setDialogOpen(true)}
            upgradeLabel={t("screen.shared.scrShr01PlanLimitUpgradePrompt.upgradeTo", {
              plan: LIMITED_PLAN,
            })}
          />
        }
        error={
          <TeInlineAlert
            tone="error"
            title={t("screen.shared.scrShr01PlanLimitUpgradePrompt.paymentFailed")}
          >
            {t("screen.shared.scrShr01PlanLimitUpgradePrompt.theUpgradeDidNotGo")}
          </TeInlineAlert>
        }
      />
      <TeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t("screen.shared.scrShr01PlanLimitUpgradePrompt.planLimitReached")}
        description={t("screen.shared.scrShr01PlanLimitUpgradePrompt.yourCurrentPlanDoesNot")}
        primaryLabel={t("screen.shared.scrShr01PlanLimitUpgradePrompt.upgradeTo", {
          plan: LIMITED_PLAN,
        })}
        onPrimary={() => void handleUpgrade()}
        secondaryLabel={t("screen.shared.scrShr01PlanLimitUpgradePrompt.cancel")}
        onSecondary={() => setDialogOpen(false)}
      >
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 te-body">
          <dt className="te-label">{t("screen.shared.scrShr01PlanLimitUpgradePrompt.limit")}</dt>
          <dd>{t("screen.shared.scrShr01PlanLimitUpgradePrompt.limitNameFromTheBlocked")}</dd>
          <dt className="te-label">{t("screen.shared.scrShr01PlanLimitUpgradePrompt.liftedBy")}</dt>
          <dd>{LIMITED_PLAN}</dd>
        </dl>
      </TeDialog>
    </div>
  );
}
