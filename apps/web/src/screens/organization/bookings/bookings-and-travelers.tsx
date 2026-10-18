import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeEmptyState } from "@trips-app/ui/components/te-empty-state";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { TeTabs, type TeTab } from "@trips-app/ui/components/te-tabs";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, OrgLink, WorkspaceBackLink } from "../common/org-link";
import { getActiveWizardTripId, setSelectedBookingId, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface BookingRow {
  id: string;
  reference: string;
  travelers: string;
  programs: string;
  seat: string;
  payment: string;
}

const COLUMNS = (): readonly TeDataTableColumn<BookingRow>[] => [
  {
    key: "reference",
    header: t("screen.organization.bookings.bookingsAndTravelers.booking"),
    render: (row) => (
      <OrgLink slug="booking-detail" onClick={() => setSelectedBookingId(row.id)}>
        {row.reference}
      </OrgLink>
    ),
  },
  {
    key: "state",
    header: t("screen.organization.bookings.bookingsAndTravelers.state"),
    render: () => (
      <StateBadge
        tone="success"
        icon="check"
        label={t("screen.organization.bookings.bookingsAndTravelers.confirmed")}
      />
    ),
  },
  {
    key: "travelers",
    header: t("screen.organization.bookings.bookingsAndTravelers.travelers"),
    align: "end",
  },
  { key: "programs", header: t("screen.organization.bookings.bookingsAndTravelers.programs") },
  { key: "seat", header: t("screen.organization.bookings.bookingsAndTravelers.seat") },
  {
    key: "payment",
    header: t("screen.organization.bookings.bookingsAndTravelers.payment"),
    render: (row) => <StateBadge tone="neutral" icon="file" label={row.payment} />,
  },
];

const TABS = (): readonly TeTab[] => [
  { id: "bookings", label: t("screen.organization.bookings.bookingsAndTravelers.bookings") },
  {
    id: "cancellations",
    label: t("screen.organization.bookings.bookingsAndTravelers.cancellationRequests"),
    count: 0,
  },
];

export function BookingsAndTravelers() {
  const { status: authStatus } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const [query, setQuery] = useState("");

  const tripId = getActiveWizardTripId() ?? undefined;
  const bookingsQuery = useQuery(
    orpc.booking.listOrganizationBookings.queryOptions({
      input: { tripId },
      enabled: authStatus === "authenticated",
    }),
  );

  const rows = useMemo<readonly BookingRow[]>(() => {
    if (!bookingsQuery.data) return [];
    return bookingsQuery.data.map((b) => ({
      id: b.id,
      reference: b.bookingReference,
      travelers: String(b.passengersCount),
      programs: `${b.selectedProgramIds.length}`,
      seat: b.seatLabels.join(", ") || "-",
      payment: b.status,
    }));
  }, [bookingsQuery.data]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter((row) => row.reference.toLowerCase().includes(normalizedQuery));

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink
          parent={{
            slug: "trip-command-view",
            label: t("screen.organization.bookings.bookingsAndTravelers.backToTrip"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.bookings.bookingsAndTravelers.bookingsAndTravelers")}
          description={t("screen.organization.bookings.bookingsAndTravelers.tripName")}
          actions={
            <OrgButtonLink slug="seat-map-and-seat-assignment" variant="secondary">
              {t("screen.organization.bookings.bookingsAndTravelers.seatMap")}
            </OrgButtonLink>
          }
        />
        <TeTabs
          tabs={TABS()}
          activeId={activeTab}
          onSelect={setActiveTab}
          ariaLabel={t("screen.organization.bookings.bookingsAndTravelers.bookingViews")}
        />
        <TeSearchField
          label={t("screen.organization.bookings.bookingsAndTravelers.searchTravelersOrBookings")}
          value={query}
          onValueChange={setQuery}
          clearLabel={t("screen.organization.bookings.bookingsAndTravelers.clearSearch")}
        />
        {activeTab === "bookings" ? (
          <TeDataTable
            columns={COLUMNS()}
            rows={visibleRows}
            getRowKey={(row) => row.id}
            caption={t("screen.organization.bookings.bookingsAndTravelers.bookingsOnThisTrip")}
            emptyTitle={t("screen.organization.bookings.bookingsAndTravelers.noBookingsYet")}
            emptyDescription={t(
              "screen.organization.bookings.bookingsAndTravelers.bookingsAppearHereWhenTravelers",
            )}
          />
        ) : (
          <TeEmptyState
            title={t("screen.organization.bookings.bookingsAndTravelers.noCancellationRequests")}
            description={t(
              "screen.organization.bookings.bookingsAndTravelers.requestsFromTravelersAppearHere",
            )}
          />
        )}
      </div>
    </StatePreview>
  );
}
