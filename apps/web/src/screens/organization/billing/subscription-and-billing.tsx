import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSwitch } from "@trips-app/ui/components/te-switch";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

type PlanAction = "Upgrade" | "Downgrade" | null;

interface PlanOption {
  id: string;
  name: string;
  current: boolean;
  action: PlanAction;
}

const PLAN_OPTIONS: readonly PlanOption[] = [
  { id: "starter", name: "Starter", current: false, action: "Downgrade" },
  { id: "growth", name: "Growth", current: true, action: null },
  { id: "enterprise", name: "Enterprise", current: false, action: "Upgrade" },
];

export function SubscriptionAndBilling() {
  const queryClient = useQueryClient();
  const { status: authStatus } = useAuth();
  const [annualBilling, setAnnualBilling] = useState(false);

  const subscriptionQuery = useQuery(
    orpc.plans.getOrganizationSubscription.queryOptions({
      input: undefined,
      enabled: authStatus === "authenticated",
    }),
  );

  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const employeesQuery = useQuery(
    orpc.employees.list.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const couponsQuery = useQuery(
    orpc.coupons.listOrganizationCoupons.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const changePlanMutation = useMutation(
    orpc.plans.changeOrganizationPlan.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.plans.key() });
      },
    }),
  );

  const sub = subscriptionQuery.data;
  const currentTier = sub ? (sub.planId.split(":")[1] ?? "growth") : "growth";
  const renewalDate = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toISOString().slice(0, 10)
    : "";

  const activeTripsCount = tripsQuery.data?.items.length ?? 0;
  const employeesCount = employeesQuery.data?.employees.length ?? 0;
  const couponsCount = couponsQuery.data?.items.length ?? 0;

  const handlePlanChange = (tierId: string) => {
    if (authStatus !== "authenticated") return;
    changePlanMutation.mutate({
      planId: `organization:${tierId}`,
      billingCycle: annualBilling ? "annual" : "monthly",
    });
  };

  const tripLimit =
    currentTier === "enterprise" ? "Unlimited" : currentTier === "starter" ? "5" : "25";
  const couponLimit =
    currentTier === "enterprise" ? "Unlimited" : currentTier === "starter" ? "5" : "25";

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink />
        <TePageHeader
          title={t("screen.organization.billing.subscriptionAndBilling.subscriptionAndBilling")}
        />
        <OrgSection title={t("screen.organization.billing.subscriptionAndBilling.currentPlan")}>
          <TeCard>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="te-h3">
                  {PLAN_OPTIONS.find((p) => p.id === currentTier)?.name ??
                    t("screen.organization.billing.subscriptionAndBilling.growth")}
                </h3>
                <TeBadge tone="highlight">
                  {t("screen.organization.billing.subscriptionAndBilling.currentPlan2")}
                </TeBadge>
              </div>
              <p className="te-body">
                {renewalDate
                  ? `${t("screen.organization.billing.subscriptionAndBilling.renewsOnRenewalDate")} (${renewalDate})`
                  : t("screen.organization.billing.subscriptionAndBilling.renewsOnRenewalDate")}
              </p>
              <TeSwitch
                checked={annualBilling}
                onCheckedChange={setAnnualBilling}
                label={t("screen.organization.billing.subscriptionAndBilling.annualBilling")}
                onLabel={t("screen.organization.billing.subscriptionAndBilling.annual")}
                offLabel={t("screen.organization.billing.subscriptionAndBilling.monthly")}
              />
              {annualBilling ? (
                <TeInlineAlert tone="info">
                  {t(
                    "screen.organization.billing.subscriptionAndBilling.annualBillingAppliesTheAnnual",
                  )}
                </TeInlineAlert>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="te-body">
                  {t(
                    "screen.organization.billing.subscriptionAndBilling.paymentMethodPaymentMethod",
                  )}
                </p>
                <TeButton variant="secondary">
                  {t("screen.organization.billing.subscriptionAndBilling.updatePaymentMethod")}
                </TeButton>
              </div>
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.billing.subscriptionAndBilling.usage")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TeKpiTile
              label={t("screen.organization.billing.subscriptionAndBilling.activeTripsThisMonth")}
              value={`${activeTripsCount} of ${tripLimit}`}
            />
            <TeKpiTile
              label={t("screen.organization.billing.subscriptionAndBilling.employees")}
              value={`${employeesCount} of 20`}
            />
            <TeKpiTile
              label={t("screen.organization.billing.subscriptionAndBilling.vehiclesPerTrip")}
              value="Up to 10"
            />
            <TeKpiTile
              label={t("screen.organization.billing.subscriptionAndBilling.programsPerTrip")}
              value="Up to 15"
            />
            <TeKpiTile
              label={t("screen.organization.billing.subscriptionAndBilling.coupons")}
              value={`${couponsCount} of ${couponLimit}`}
            />
          </div>
        </OrgSection>
        <OrgSection title={t("screen.organization.billing.subscriptionAndBilling.changePlan")}>
          <div className="grid gap-4 sm:grid-cols-3">
            {PLAN_OPTIONS.map((plan) => {
              const isCurrent = plan.id === currentTier;
              return (
                <TeCard
                  key={plan.id}
                  header={
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="te-h3">{plan.name}</h3>
                      {isCurrent ? (
                        <TeBadge tone="highlight">
                          {t("screen.organization.billing.subscriptionAndBilling.currentPlan3")}
                        </TeBadge>
                      ) : null}
                    </div>
                  }
                >
                  <div className="flex flex-col gap-4">
                    <p className="te-body">
                      {t("screen.organization.billing.subscriptionAndBilling.price")}
                    </p>
                    {!isCurrent && plan.action ? (
                      <TeButton variant="secondary" onClick={() => handlePlanChange(plan.id)}>
                        {plan.action}
                      </TeButton>
                    ) : null}
                  </div>
                </TeCard>
              );
            })}
          </div>
          <TeInlineAlert tone="info">
            {t("screen.organization.billing.subscriptionAndBilling.upgradesTakeEffectNowAnd")}
          </TeInlineAlert>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
