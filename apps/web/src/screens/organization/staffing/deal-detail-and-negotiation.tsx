import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeTimeline, type TeTimelineItem } from "@trips-app/ui/components/te-timeline";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const SUMMARY_ITEMS: readonly { label: string; value: string }[] = [
  { label: "Trip", value: "[Trip name]" },
  { label: "Route", value: "[Route]" },
  { label: "Date", value: "[Date]" },
  { label: "Pay", value: "[Amount and currency]" },
];

const OFFER_HISTORY: readonly TeTimelineItem[] = [
  { id: "offer-1", time: "[Time]", label: "Proposed by the organization", state: "current" },
];

export function DealDetailAndNegotiation() {
  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "staffing-board", label: "Back to staffing board" }} />
        <TePageHeader
          title="Deal detail and negotiation"
          actions={<StateBadge tone="info" icon="clock" label="Proposed" />}
        />
        <TeCard>
          <dl className="grid gap-4 sm:grid-cols-2">
            {SUMMARY_ITEMS.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <dt className="te-label">{item.label}</dt>
                <dd className="te-body">{item.value}</dd>
              </div>
            ))}
          </dl>
        </TeCard>
        <TeInlineAlert tone="info">
          The deal expires 72 hours after the last counter-offer.
        </TeInlineAlert>
        <OrgSection title="Offer history">
          <TeTimeline items={OFFER_HISTORY} ariaLabel="Offer history" />
        </OrgSection>
        <OrgSection title="Counter-offer">
          <div className="grid gap-4 sm:grid-cols-2">
            <TeInput label="Counter amount" placeholder="[Amount]" inputMode="decimal" />
            <TeInput label="Currency" placeholder="[Currency code]" />
          </div>
        </OrgSection>
        <div className="flex flex-wrap justify-end gap-3">
          <TeButton variant="ghost">Reject</TeButton>
          <TeButton variant="secondary">Counter</TeButton>
          <TeButton>Accept</TeButton>
        </div>
      </div>
    </StatePreview>
  );
}
