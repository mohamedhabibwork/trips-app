import { useState } from "react";

import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSwitch } from "@trips-app/ui/components/te-switch";

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
  const [annualBilling, setAnnualBilling] = useState(false);

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink />
        <TePageHeader title="Subscription and billing" />
        <OrgSection title="Current plan">
          <TeCard>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="te-h3">Growth</h3>
                <TeBadge tone="highlight">Current plan</TeBadge>
              </div>
              <p className="te-body">Renews on [Renewal date]</p>
              <TeSwitch
                checked={annualBilling}
                onCheckedChange={setAnnualBilling}
                label="Annual billing"
                onLabel="Annual"
                offLabel="Monthly"
              />
              {annualBilling ? (
                <TeInlineAlert tone="info">
                  Annual billing applies the annual discount to the monthly total. Discount: [OPEN:
                  placeholder].
                </TeInlineAlert>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="te-body">Payment method: [Payment method]</p>
                <TeButton variant="secondary">Update payment method</TeButton>
              </div>
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Usage">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TeKpiTile label="Active trips this month" value="0 of [limit]" />
            <TeKpiTile label="Employees" value="0 of 20" />
            <TeKpiTile label="Vehicles per trip" value="Up to 10" />
            <TeKpiTile label="Programs per trip" value="Up to 15" />
            <TeKpiTile label="Coupons" value="0 of [limit]" />
          </div>
        </OrgSection>
        <OrgSection title="Change plan">
          <div className="grid gap-4 sm:grid-cols-3">
            {PLAN_OPTIONS.map((plan) => (
              <TeCard
                key={plan.id}
                header={
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="te-h3">{plan.name}</h3>
                    {plan.current ? <TeBadge tone="highlight">Current plan</TeBadge> : null}
                  </div>
                }
              >
                <div className="flex flex-col gap-4">
                  <p className="te-body">[Price]</p>
                  {plan.action ? <TeButton variant="secondary">{plan.action}</TeButton> : null}
                </div>
              </TeCard>
            ))}
          </div>
          <TeInlineAlert tone="info">
            Upgrades take effect now and are prorated. Downgrades take effect at the end of the
            billing cycle, on [Date].
          </TeInlineAlert>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
