import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface BookingLineRow {
  id: string;
  traveler: string;
  program: string;
  quantity: string;
  seat: string;
}

const LINE_ROWS: readonly BookingLineRow[] = [
  {
    id: "line-1",
    traveler: "[Traveler name]",
    program: "[Program name]",
    quantity: "0",
    seat: "[Seat]",
  },
];

const LINE_COLUMNS: readonly TeDataTableColumn<BookingLineRow>[] = [
  { key: "traveler", header: "Traveler" },
  { key: "program", header: "Program" },
  { key: "quantity", header: "Quantity", align: "end" },
  { key: "seat", header: "Seat" },
];

export function BookingDetail() {
  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "bookings-and-travelers", label: "Back to bookings" }} />
        <TePageHeader
          title="Booking detail"
          description="[Booking reference]"
          actions={<StateBadge tone="success" icon="check" label="Confirmed" />}
        />
        <OrgSection title="Travelers and programs">
          <TeDataTable
            columns={LINE_COLUMNS}
            rows={LINE_ROWS}
            getRowKey={(row) => row.id}
            caption="Travelers and programs on this booking"
            emptyTitle="No travelers"
            emptyDescription="Travelers appear here once they are added to the booking."
          />
        </OrgSection>
        <OrgSection
          title="Seat"
          actions={
            <OrgButtonLink slug="seat-map-and-seat-assignment" variant="secondary">
              Open seat map
            </OrgButtonLink>
          }
        >
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label="Seat"
                placeholder="[Seat]"
                supportingText="Organization-assigned seats only."
              />
              <TeInput label="Coupon" placeholder="[Coupon code]" readOnly />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Payment">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <p className="te-body">Payment status: [Payment status]</p>
              <p className="te-body">Reversal state: [Reversal state]</p>
            </div>
          </TeCard>
          <TeInlineAlert tone="info">
            A pending refund shows to the traveler as "refund in progress". Revenue is reversed only
            after the payment gateway confirms the refund.
          </TeInlineAlert>
        </OrgSection>
        <div className="flex flex-wrap justify-end gap-3">
          <TeButton variant="secondary">Issue refund</TeButton>
          <TeButton>Save change</TeButton>
        </div>
      </div>
    </StatePreview>
  );
}
