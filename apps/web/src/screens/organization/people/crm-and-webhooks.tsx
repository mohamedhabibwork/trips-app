import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeCheckbox } from "@trips-app/ui/components/te-checkbox";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const EVENT_IDS = [
  "bookingConfirmed",
  "bookingCancelled",
  "tripPublished",
  "checkIn",
  "checkOut",
  "signingStatus",
] as const;

type EventId = (typeof EVENT_IDS)[number];

const EVENT_LABELS: Record<EventId, string> = {
  bookingConfirmed: "Booking confirmed",
  bookingCancelled: "Booking cancelled",
  tripPublished: "Trip published",
  checkIn: "Check-in",
  checkOut: "Check-out",
  signingStatus: "Signing status",
};

const INITIAL_EVENTS: Record<EventId, boolean> = {
  bookingConfirmed: false,
  bookingCancelled: false,
  tripPublished: false,
  checkIn: false,
  checkOut: false,
  signingStatus: false,
};

interface DeliveryRow {
  id: string;
  event: string;
  time: string;
  outcome: string;
}

const DELIVERY_ROWS: readonly DeliveryRow[] = [
  { id: "delivery-1", event: "[Event]", time: "[Time]", outcome: "Delivered" },
];

const DELIVERY_COLUMNS: readonly TeDataTableColumn<DeliveryRow>[] = [
  { key: "event", header: "Event" },
  { key: "time", header: "Time" },
  {
    key: "outcome",
    header: "Outcome",
    render: () => <StateBadge tone="success" icon="check" label="Delivered" />,
  },
];

export function CrmAndWebhooks() {
  const [events, setEvents] = useState(INITIAL_EVENTS);

  const setEvent = (event: EventId, checked: boolean) => {
    setEvents((current) => ({ ...current, [event]: checked }));
  };

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{ slug: "organization-profile-settings-and-branding", label: "Back to settings" }}
        />
        <TePageHeader title="CRM and webhooks" actions={<TeButton>Add endpoint</TeButton>} />
        <OrgSection title="CRM connection">
          <TeCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StateBadge tone="neutral" icon="offline" label="Not connected" />
              <TeButton variant="secondary">Connect CRM</TeButton>
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Webhook endpoint">
          <TeCard>
            <div className="flex flex-col gap-4">
              <TeInput label="Endpoint URL" placeholder="https://[your endpoint]" inputMode="url" />
              <div className="flex flex-wrap justify-end gap-3">
                <TeButton variant="secondary">Send test</TeButton>
                <TeButton variant="ghost">Rotate secret</TeButton>
              </div>
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Events">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              {EVENT_IDS.map((event) => (
                <TeCheckbox
                  key={event}
                  label={EVENT_LABELS[event]}
                  checked={events[event]}
                  onCheckedChange={(checked) => setEvent(event, checked)}
                />
              ))}
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Delivery log">
          <TeDataTable
            columns={DELIVERY_COLUMNS}
            rows={DELIVERY_ROWS}
            getRowKey={(row) => row.id}
            caption="Webhook delivery log"
            emptyTitle="No deliveries yet"
            emptyDescription="Each event sent to your endpoint is listed here with its outcome."
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
