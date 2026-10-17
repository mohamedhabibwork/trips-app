import { useState } from "react";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeEmptyState } from "@trips-app/ui/components/te-empty-state";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { TeTabs, type TeTab } from "@trips-app/ui/components/te-tabs";

import { OrgButtonLink, OrgLink, WorkspaceBackLink } from "../common/org-link";
import { StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface BookingRow {
  id: string;
  reference: string;
  travelers: string;
  programs: string;
  seat: string;
  payment: string;
}

const BOOKING_ROWS: readonly BookingRow[] = [
  {
    id: "booking-1",
    reference: "[Booking reference]",
    travelers: "0",
    programs: "[Programs]",
    seat: "[Seat]",
    payment: "[Payment status]",
  },
];

const COLUMNS: readonly TeDataTableColumn<BookingRow>[] = [
  {
    key: "reference",
    header: "Booking",
    render: (row) => <OrgLink slug="booking-detail">{row.reference}</OrgLink>,
  },
  {
    key: "state",
    header: "State",
    render: () => <StateBadge tone="success" icon="check" label="Confirmed" />,
  },
  { key: "travelers", header: "Travelers", align: "end" },
  { key: "programs", header: "Programs" },
  { key: "seat", header: "Seat" },
  {
    key: "payment",
    header: "Payment",
    render: (row) => <StateBadge tone="neutral" icon="file" label={row.payment} />,
  },
];

const TABS: readonly TeTab[] = [
  { id: "bookings", label: "Bookings" },
  { id: "cancellations", label: "Cancellation requests", count: 0 },
];

export function BookingsAndTravelers() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = BOOKING_ROWS.filter((row) =>
    row.reference.toLowerCase().includes(normalizedQuery),
  );

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink parent={{ slug: "trip-command-view", label: "Back to trip" }} />
        <TePageHeader
          title="Bookings and travelers"
          description="[Trip name]"
          actions={
            <OrgButtonLink slug="seat-map-and-seat-assignment" variant="secondary">
              Seat map
            </OrgButtonLink>
          }
        />
        <TeTabs
          tabs={TABS}
          activeId={activeTab}
          onSelect={setActiveTab}
          ariaLabel="Booking views"
        />
        <TeSearchField
          label="Search travelers or bookings"
          value={query}
          onValueChange={setQuery}
          clearLabel="Clear search"
        />
        {activeTab === "bookings" ? (
          <TeDataTable
            columns={COLUMNS}
            rows={visibleRows}
            getRowKey={(row) => row.id}
            caption="Bookings on this trip"
            emptyTitle="No bookings yet"
            emptyDescription="Bookings appear here when travelers book this trip."
          />
        ) : (
          <TeEmptyState
            title="No cancellation requests"
            description="Requests from travelers appear here for approval or decline."
          />
        )}
      </div>
    </StatePreview>
  );
}
