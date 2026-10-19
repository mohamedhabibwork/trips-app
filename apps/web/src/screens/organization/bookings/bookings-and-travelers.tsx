// SCR-ORG-23 Bookings and travelers: every booking of the trip, its travelers, seats and payment.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgInput, OrgTabs } from "../common/org-form";
import { OrgLink } from "../common/org-link";
import { getActiveWizardTripId, setSelectedBookingId, tripTitle } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { NO_VALUE, OrgEmpty, OrgError, OrgPage, OrgPageHeader } from "../common/org-ui";
import {
  BookingStateBadge,
  PaymentBadge,
  toBookingRecords,
  type BookingRecord,
} from "./booking-parts";

type TabId = "bookings" | "cancellations" | "travelers";

interface TravelerRow {
  id: string;
  name: string;
  booking: BookingRecord;
  seat: string;
}

function BookingLink({ booking }: { booking: BookingRecord }) {
  return (
    <OrgLink
      slug="booking-detail"
      params={{ bookingId: booking.id }}
      className="text-[var(--te-ink)]"
      onClick={() => setSelectedBookingId(booking.id)}
    >
      {booking.bookingReference}
    </OrgLink>
  );
}

function seatText(labels: readonly string[]): string {
  return labels.length > 0
    ? labels.join(", ")
    : t("screen.organization.bookings.bookingsAndTravelers.notAssigned");
}

function bookingColumns(programName: (id: string) => string): readonly OrgColumn<BookingRecord>[] {
  return [
    {
      key: "booking",
      header: t("screen.organization.bookings.bookingsAndTravelers.booking"),
      render: (row) => <BookingLink booking={row} />,
    },
    {
      key: "travelers",
      header: t("screen.organization.bookings.bookingsAndTravelers.travelers"),
      render: (row) => String(row.passengersCount),
    },
    {
      key: "programs",
      header: t("screen.organization.bookings.bookingsAndTravelers.programs"),
      render: (row) =>
        row.selectedProgramIds.length > 0
          ? row.selectedProgramIds.map(programName).join(", ")
          : t("screen.organization.bookings.bookingsAndTravelers.none"),
    },
    {
      key: "seat",
      header: t("screen.organization.bookings.bookingsAndTravelers.seat"),
      render: (row) => seatText(row.seatLabels),
    },
    {
      key: "payment",
      header: t("screen.organization.bookings.bookingsAndTravelers.payment"),
      render: (row) => <PaymentBadge booking={row} />,
    },
    {
      key: "state",
      header: t("screen.organization.bookings.bookingsAndTravelers.state"),
      render: (row) => <BookingStateBadge booking={row} />,
    },
  ];
}

function travelerColumns(): readonly OrgColumn<TravelerRow>[] {
  return [
    {
      key: "name",
      header: t("screen.organization.bookings.bookingsAndTravelers.traveler"),
      render: (row) => <b>{row.name}</b>,
    },
    {
      key: "booking",
      header: t("screen.organization.bookings.bookingsAndTravelers.booking"),
      render: (row) => <BookingLink booking={row.booking} />,
    },
    { key: "seat", header: t("screen.organization.bookings.bookingsAndTravelers.seat") },
    {
      key: "state",
      header: t("screen.organization.bookings.bookingsAndTravelers.state"),
      render: (row) => <BookingStateBadge booking={row.booking} />,
    },
  ];
}

function travelerRows(bookings: readonly BookingRecord[]): readonly TravelerRow[] {
  return bookings.flatMap((booking) =>
    booking.passengers.map((passenger, index) => ({
      id: `${booking.id}-${passenger.id ?? index}`,
      name: passenger.fullName || NO_VALUE,
      booking,
      seat:
        passenger.seatLabel ||
        booking.seatLabels[index] ||
        t("screen.organization.bookings.bookingsAndTravelers.notAssigned"),
    })),
  );
}

export function BookingsAndTravelers() {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const [activeTab, setActiveTab] = useState<TabId>("bookings");
  const [query, setQuery] = useState("");

  const tripId = getActiveWizardTripId() ?? undefined;
  const bookingsQuery = useQuery({
    ...orpc.booking.listOrganizationBookings.queryOptions({ input: { tripId } }),
    enabled,
  });
  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({ input: { tripId: tripId ?? "" } }),
    enabled: enabled && Boolean(tripId),
  });
  const programsQuery = useQuery({
    ...orpc.programs.listTripPrograms.queryOptions({ input: { tripId: tripId ?? "" } }),
    enabled: enabled && Boolean(tripId),
  });

  const bookings = toBookingRecords(bookingsQuery.data);
  const programs = programsQuery.data?.items ?? [];
  const programName = (id: string) => {
    const program = programs.find((item) => item.id === id);
    return program ? tripTitle(program, locale) || NO_VALUE : NO_VALUE;
  };

  const normalized = query.trim().toLowerCase();
  const matches = (booking: BookingRecord) =>
    normalized === "" ||
    booking.bookingReference.toLowerCase().includes(normalized) ||
    booking.passengers.some((passenger) =>
      (passenger.fullName ?? "").toLowerCase().includes(normalized),
    );
  const visible = bookings.filter(matches);
  const cancellations = visible.filter((booking) => booking.status === "cancelled");

  const tripName = tripId
    ? tripQuery.data
      ? tripTitle(tripQuery.data, locale) || NO_VALUE
      : NO_VALUE
    : t("screen.organization.bookings.bookingsAndTravelers.allTrips");
  const count = bookingsQuery.isSuccess ? String(bookings.length) : NO_VALUE;

  const tabs = [
    { id: "bookings", label: t("screen.organization.bookings.bookingsAndTravelers.bookings") },
    {
      id: "cancellations",
      label: t("screen.organization.bookings.bookingsAndTravelers.cancellationRequests"),
    },
    { id: "travelers", label: t("screen.organization.bookings.bookingsAndTravelers.travelers") },
  ] as const;

  const empty = bookingsQuery.isError ? undefined : (
    <OrgEmpty
      title={
        bookings.length === 0
          ? t("screen.organization.bookings.bookingsAndTravelers.emptyTitle")
          : t("screen.organization.bookings.bookingsAndTravelers.noMatchTitle")
      }
    >
      {bookings.length === 0
        ? t("screen.organization.bookings.bookingsAndTravelers.emptyBody")
        : t("screen.organization.bookings.bookingsAndTravelers.noMatchBody")}
    </OrgEmpty>
  );

  return (
    <OrgPage className="gap-5">
      <OrgPageHeader
        title={t("screen.organization.bookings.bookingsAndTravelers.title")}
        caption={t("screen.organization.bookings.bookingsAndTravelers.caption", {
          trip: tripName,
          n: count,
        })}
        actions={
          <OrgInput
            label={t("screen.organization.bookings.bookingsAndTravelers.searchTravelers")}
            placeholder={t("screen.organization.bookings.bookingsAndTravelers.searchPlaceholder")}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            fieldClassName="w-full sm:min-w-[320px]"
          />
        }
      />
      <OrgTabs
        label={t("screen.organization.bookings.bookingsAndTravelers.bookingViews")}
        tabs={tabs}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(tabs.find((tab) => tab.id === id)?.id ?? "bookings")}
      />
      {bookingsQuery.isError ? <OrgError onRetry={() => void bookingsQuery.refetch()} /> : null}
      {activeTab === "travelers" ? (
        <OrgTable
          columns={travelerColumns()}
          rows={travelerRows(visible)}
          rowKey={(row) => row.id}
          caption={t("screen.organization.bookings.bookingsAndTravelers.travelers")}
          loading={bookingsQuery.isLoading}
          empty={empty}
        />
      ) : (
        <OrgTable
          columns={bookingColumns(programName)}
          rows={activeTab === "cancellations" ? cancellations : visible}
          rowKey={(row) => row.id}
          caption={
            activeTab === "cancellations"
              ? t("screen.organization.bookings.bookingsAndTravelers.cancellationRequests")
              : t("screen.organization.bookings.bookingsAndTravelers.bookings")
          }
          loading={bookingsQuery.isLoading}
          empty={
            activeTab === "cancellations" && bookings.length > 0 ? (
              <OrgEmpty
                title={t(
                  "screen.organization.bookings.bookingsAndTravelers.noCancellationRequests",
                )}
              />
            ) : (
              empty
            )
          }
        />
      )}
      <p className="te-caption m-0 text-[var(--te-ink-muted)]">
        {t("screen.organization.bookings.bookingsAndTravelers.refundNote")}
      </p>
    </OrgPage>
  );
}
