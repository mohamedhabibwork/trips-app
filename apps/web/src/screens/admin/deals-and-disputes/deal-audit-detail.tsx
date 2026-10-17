import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeTimeline, type TeTimelineItem } from "@trips-app/ui/components/te-timeline";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface OfferRow {
  id: string;
  step: string;
  amount: string;
  actor: string;
  time: string;
}

const OFFER_ROWS: readonly OfferRow[] = [
  {
    id: "offer-1",
    step: "Offer",
    amount: "[Amount]",
    actor: "[Party name]",
    time: "[Date and time]",
  },
  {
    id: "offer-2",
    step: "Counter offer",
    amount: "[Amount]",
    actor: "[Party name]",
    time: "[Date and time]",
  },
];

const HISTORY: readonly TeTimelineItem[] = [
  { id: "open", time: "[Date and time]", label: "Deal opened", state: "done" },
  { id: "counter", time: "[Date and time]", label: "Counter offer made", state: "done" },
  { id: "final", time: "[Pending]", label: "Deal finalized or rejected", state: "upcoming" },
];

const OPEN: AdminStatusPresentation = { tone: "info", icon: "clock", label: "Open" };

const OFFER_COLUMNS: readonly TeDataTableColumn<OfferRow>[] = [
  { key: "step", header: "Step" },
  { key: "amount", header: "Amount" },
  { key: "actor", header: "Actor" },
  { key: "time", header: "Time" },
];

export function DealAuditDetail() {
  return (
    <AdminPage>
      <TePageHeader
        title="Deal audit detail"
        description="[Deal reference]. Every offer and state change, in order."
        actions={<TeButton variant="secondary">Flag for review</TeButton>}
      />
      <StatePreview
        emptyTitle="No offers"
        emptyDescription="This deal has no offers yet."
        loadingLabel="Loading the deal."
      >
        <AdminPanel title="Parties and vehicle or trip">
          <AdminStatus status={OPEN} />
          <AdminFacts
            items={[
              { label: "Organization", value: "[Organization name]" },
              { label: "Supplier", value: "[Supplier name]" },
              { label: "Vehicle or trip", value: "[Vehicle or trip reference]" },
              { label: "Final amount", value: "[Amount]" },
            ]}
          />
        </AdminPanel>
        <AdminPanel title="Offers, in order">
          <TeDataTable
            columns={OFFER_COLUMNS}
            rows={OFFER_ROWS}
            getRowKey={(row) => row.id}
            caption="Offers in order"
            emptyTitle="No offers"
            emptyDescription="This deal has no offers yet."
          />
        </AdminPanel>
        <AdminPanel title="State history">
          <TeTimeline items={HISTORY} ariaLabel="Deal state history" />
        </AdminPanel>
        <AdminPanel title="Deal cost and commission">
          <AdminFacts
            items={[
              { label: "Deal cost", value: "[Amount]" },
              { label: "Commission", value: "[Amount]" },
            ]}
          />
          <TeInlineAlert tone="warning" title="Placeholder rate">
            The deal cost is 10% of the base trip price. This rate is a placeholder and stays open
            until Finance confirms it (D-15).
          </TeInlineAlert>
        </AdminPanel>
        <AdminActions>
          <AdminScreenLink slug="platform-financial-view" variant="ghost">
            View ledger entries
          </AdminScreenLink>
          <AdminScreenLink slug="deal-audit-list" variant="secondary">
            Back to deal list
          </AdminScreenLink>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
