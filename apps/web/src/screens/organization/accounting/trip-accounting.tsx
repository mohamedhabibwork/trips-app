import { TeCard } from "@trips-app/ui/components/te-card";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const ACCOUNTING_LINES: readonly { label: string; hint: string }[] = [
  { label: "Base revenue", hint: "Ticket revenue for this trip" },
  { label: "Program revenue", hint: "Revenue from programs" },
  { label: "Coupon impact", hint: "Discounts from coupons" },
  { label: "Supplier costs", hint: "Costs paid to suppliers" },
  { label: "Gateway fees", hint: "Payment gateway fees" },
];

export function TripAccounting() {
  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "trip-command-view", label: "Back to trip" }} />
        <TePageHeader
          title="Trip accounting"
          description="[Trip name]"
          actions={
            <OrgButtonLink slug="ledger-and-exports" variant="secondary">
              Open ledger
            </OrgButtonLink>
          }
        />
        <OrgSection title="Accounting lines">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ACCOUNTING_LINES.map((line) => (
              <TeKpiTile
                key={line.label}
                label={line.label}
                value="[Amount and currency]"
                hint={line.hint}
              />
            ))}
          </div>
        </OrgSection>
        <OrgSection title="Reconciliation">
          <TeCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StateBadge tone="neutral" icon="shield" label="[Reconciliation status]" />
              <div className="flex flex-wrap gap-3">
                <OrgButtonLink slug="invoices-list" variant="ghost">
                  Invoices
                </OrgButtonLink>
                <OrgButtonLink slug="settlements" variant="ghost">
                  Settlements
                </OrgButtonLink>
              </div>
            </div>
          </TeCard>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
