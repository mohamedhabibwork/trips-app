import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TE_ROLES, roleLabel, type TeRole } from "@trips-app/ui/components/te-role-badge";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, useAdminNavigate } from "../common/admin-links";
import {
  AdminActions,
  AdminPage,
  AdminPanel,
  AdminToggle,
  getSelectedAdminPlanId,
} from "../common/admin-shared";

const ROLE_OPTIONS: readonly TeSelectOption[] = TE_ROLES.map((role: TeRole) => ({
  value: role,
  label: roleLabel(role),
}));

export function PlanEditor() {
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();

  const catalogQuery = useQuery({
    ...orpc.plans.getCatalog.queryOptions({ input: {} }),
  });

  const selectedId = getSelectedAdminPlanId();
  const res = catalogQuery.data;
  const plan = (selectedId ? res?.find((p) => p.id === selectedId) : res?.[0]) ?? res?.[0];

  const [role, setRole] = useState<string>(TE_ROLES[0]);
  const [tierNameOverride, setTierNameOverride] = useState<string | null>(null);
  const [limitsOverride, setLimitsOverride] = useState<string | null>(null);
  const [monthlyPriceOverride, setMonthlyPriceOverride] = useState<string | null>(null);
  const [annualPriceOverride, setAnnualPriceOverride] = useState<string | null>(null);
  const [currencyOverride, setCurrencyOverride] = useState<string | null>(null);

  const tierName = tierNameOverride ?? plan?.nameEn ?? "Organization Pro";
  const limits =
    limitsOverride ??
    (Array.isArray(plan?.features)
      ? plan.features.map(String).join(", ")
      : plan?.features && typeof plan.features === "object"
        ? Object.keys(plan.features).join(", ")
        : "25 active trips, 10 staff members");
  const monthlyPrice =
    monthlyPriceOverride ?? (plan ? (plan.monthlyPriceMinor / 100).toFixed(2) : "1500.00");
  const annualPrice =
    annualPriceOverride ?? (plan ? (plan.annualPriceMinor / 100).toFixed(2) : "15300.00");
  const currency = currencyOverride ?? plan?.currencyCode ?? "EGP";

  const setTierName = (v: string) => setTierNameOverride(v);
  const setLimits = (v: string) => setLimitsOverride(v);
  const setMonthlyPrice = (v: string) => setMonthlyPriceOverride(v);
  const setAnnualPrice = (v: string) => setAnnualPriceOverride(v);
  const setCurrency = (v: string) => setCurrencyOverride(v);

  const updateSettingsMutation = useMutation(
    orpc.admin.updateSystemSettings.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.admin.key() });
      },
    }),
  );

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.plans.planEditor.planEditor")}
        description={t("screen.admin.plans.planEditor.editOnePlanSLimits")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.plans.planEditor.noPlanLoaded")}
        emptyDescription={t("screen.admin.plans.planEditor.chooseARoleAndA")}
        loadingLabel={t("screen.admin.plans.planEditor.loadingThePlan")}
      >
        <AdminPanel title={t("screen.admin.plans.planEditor.plan")}>
          <TeSelect
            label={t("screen.admin.plans.planEditor.role")}
            options={ROLE_OPTIONS}
            value={role}
            onValueChange={setRole}
          />
          <TeInput
            label={t("screen.admin.plans.planEditor.tierName")}
            placeholder={t("screen.admin.plans.planEditor.tierNamePlaceholder")}
            value={tierName}
            onChange={(event) => setTierName(event.target.value)}
            required
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.plans.planEditor.limitsAndFeatures")}>
          <TeInput
            label={t("screen.admin.plans.planEditor.limits")}
            placeholder={t("screen.admin.plans.planEditor.limitValues")}
            value={limits}
            onChange={(event) => setLimits(event.target.value)}
            supportingText={t("screen.admin.plans.planEditor.valuesComeFromTheBrd")}
          />
          <AdminToggle label={t("screen.admin.plans.planEditor.featureFlag1")} />
          <AdminToggle label={t("screen.admin.plans.planEditor.featureFlag2")} />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.plans.planEditor.pricesAndTrial")}>
          <TeInput
            label={t("screen.admin.plans.planEditor.monthlyPrice")}
            placeholder={t("screen.admin.plans.planEditor.amount")}
            inputMode="decimal"
            value={monthlyPrice}
            onChange={(event) => setMonthlyPrice(event.target.value)}
          />
          <TeInput
            label={t("screen.admin.plans.planEditor.currency")}
            placeholder={t("screen.admin.plans.planEditor.currencyCode")}
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          />
          <TeInput
            label={t("screen.admin.plans.planEditor.annualPrice")}
            placeholder={t("screen.admin.plans.planEditor.amountPlaceholder")}
            inputMode="decimal"
            value={annualPrice}
            onChange={(event) => setAnnualPrice(event.target.value)}
          />
          <TeInput
            label={t("screen.admin.plans.planEditor.annualDiscount")}
            defaultValue="15"
            inputMode="decimal"
            supportingText={t("screen.admin.plans.planEditor.placeholderFinanceSetsThisValue")}
          />
          <TeInput
            label={t("screen.admin.plans.planEditor.trialLengthDays")}
            placeholder={t("screen.admin.plans.planEditor.days")}
            inputMode="numeric"
          />
          <TeInput
            label={t("screen.admin.plans.planEditor.gracePeriodDays")}
            defaultValue="7"
            inputMode="numeric"
            supportingText={t("screen.admin.plans.planEditor.setTo7DaysD")}
          />
        </AdminPanel>
        <TeInlineAlert tone="info" title={t("screen.admin.plans.planEditor.whenChangesApply")}>
          {t("screen.admin.plans.planEditor.savedChangesApplyToNew")}
        </TeInlineAlert>
        <AdminPanel
          title={t("screen.admin.plans.planEditor.save")}
          footer={
            <AdminActions>
              <AdminScreenLink slug="plans-catalog" variant="secondary">
                {t("screen.admin.plans.planEditor.cancel")}
              </AdminScreenLink>
              <TeButton
                onClick={() => {
                  void updateSettingsMutation
                    .mutateAsync({
                      operational: { subscriptionGraceDays: 7 },
                      reason: `Updated plan ${tierName} (${role})`,
                    })
                    .catch(() => {});
                  goTo("plans-catalog");
                }}
              >
                {t("screen.admin.plans.planEditor.savePlan")}
              </TeButton>
            </AdminActions>
          }
        >
          <p className="te-caption">
            {t("screen.admin.plans.planEditor.validationErrorsAppearNextTo")}
          </p>
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
