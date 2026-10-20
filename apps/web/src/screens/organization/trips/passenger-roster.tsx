// SCR-ORG-65 Passenger roster: one trip's passengers by bus, sorted by seat, with the check-in
// state from the manifest. Child and parent-tracking details are not recorded on the manifest yet
// and show honestly empty.
import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgButtonLink, useOrgParams } from "../common/org-link";
import { tripTitle } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";
import { toBookingRecords, toCheckInRecords } from "../bookings/booking-parts";

const K = "screen.organization.trips.passengerRoster";

interface RosterRow {
  key: string;
  seat: string;
  passenger: string;
  bookingReference: string;
  programs: string;
  vehicleId: string | null;
  checkedIn: boolean;
}

export function PassengerRoster(): ReactNode {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const tripId = useOrgParams().tripId ?? null;

  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
      input: {},
    }),
    enabled,
  });
  const trip = (tripsQuery.data?.items ?? []).find((item) => item.id === tripId) ?? null;

  const bookingsQuery = useQuery(
    serverQueryOptions(orpc.booking.listOrganizationBookings, "booking/listOrganizationBookings", {
      input: { tripId: tripId ?? undefined },
      enabled: enabled && Boolean(tripId),
    }),
  );
  const programsQuery = useQuery({
    ...serverQueryOptions(orpc.programs.listTripPrograms, "programs/listTripPrograms", {
      input: { tripId: tripId ?? "" },
    }),
    enabled: enabled && Boolean(tripId),
  });
  const manifestQuery = useQuery({
    ...serverQueryOptions(orpc.checkIn.listTripManifest, "checkIn/listTripManifest", {
      input: { tripId: tripId ?? "" },
    }),
    enabled: enabled && Boolean(tripId),
  });

  const programs = programsQuery.data?.items ?? [];
  const bookings = toBookingRecords(bookingsQuery.data).filter(
    (booking) => booking.tripId === tripId && !["cancelled", "refunded"].includes(booking.status),
  );
  const manifest = toCheckInRecords(manifestQuery.data);

  const rows: readonly RosterRow[] = useMemo(() => {
    const checkedInNames = new Set(
      manifest
        .filter((record) => record.status === "checked_in")
        .map((record) => record.passengerName),
    );
    const result: RosterRow[] = [];
    for (const booking of bookings) {
      const programNames =
        booking.selectedProgramIds
          .map((id) => programs.find((program) => program.id === id))
          .map((program) => (program ? tripTitle(program, locale) : ""))
          .filter(Boolean)
          .join(", ") || t(`${K}.none`);
      booking.passengers.forEach((passenger, index) => {
        const name = passenger.fullName || NO_VALUE;
        result.push({
          key: `${booking.id}-${passenger.id ?? index}`,
          seat: passenger.seatLabel || booking.seatLabels[index] || NO_VALUE,
          passenger: name,
          bookingReference: booking.bookingReference,
          programs: programNames,
          vehicleId: booking.vehicleId,
          checkedIn: checkedInNames.has(name),
        });
      });
    }
    return result.sort((a, b) => a.seat.localeCompare(b.seat, locale));
  }, [bookings, programs, manifest, locale]);

  const buses = trip?.vehicles ?? [];
  const [busId, setBusId] = useState<string | null>(null);
  const activeBusId = busId ?? buses[0]?.vehicleId ?? null;
  const activeBus = buses.find((vehicle) => vehicle.vehicleId === activeBusId) ?? null;
  const visibleRows = activeBusId ? rows.filter((row) => row.vehicleId === activeBusId) : rows;
  const checkedInCount = visibleRows.filter((row) => row.checkedIn).length;
  const loaded = bookingsQuery.isSuccess;
  const failed = tripsQuery.isError || bookingsQuery.isError || manifestQuery.isError;

  const columns: readonly OrgColumn<RosterRow>[] = [
    { key: "seat", header: t(`${K}.seat`), render: (row) => <b>{row.seat}</b> },
    {
      key: "passenger",
      header: t(`${K}.passenger`),
      render: (row) => (
        <span className="flex flex-col">
          <b>{row.passenger}</b>
          <span className="te-caption text-[var(--te-ink-muted)]">{row.bookingReference}</span>
        </span>
      ),
    },
    { key: "programs", header: t(`${K}.programs`), className: "text-[13px]" },
    {
      key: "checkedIn",
      header: t(`${K}.checkIn`),
      render: (row) =>
        row.checkedIn ? (
          <OrgBadge tone="ok">{t(`${K}.checkedIn`)}</OrgBadge>
        ) : (
          <OrgBadge tone="err" icon={false}>
            {t(`${K}.notBoarded`)}
          </OrgBadge>
        ),
    },
  ];

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={
          trip
            ? t(`${K}.caption`, { trip: tripTitle(trip, locale), n: rows.length })
            : t(`${K}.captionNoTrip`)
        }
        actions={
          <div className="flex flex-wrap gap-3">
            {tripId ? (
              <OrgButtonLink
                slug="seat-map-and-seat-assignment"
                params={{ tripId }}
                variant="secondary"
              >
                {t(`${K}.assignSeats`)}
              </OrgButtonLink>
            ) : null}
            <OrgButton onClick={() => window.print()} disabled={typeof window === "undefined"}>
              {t(`${K}.print`)}
            </OrgButton>
          </div>
        }
      />
      {failed ? (
        <OrgError
          onRetry={() => {
            void tripsQuery.refetch();
            void bookingsQuery.refetch();
            void manifestQuery.refetch();
          }}
        />
      ) : null}
      <OrgKpiRow>
        <OrgKpi
          label={activeBus ? activeBus.plateNumber || t(`${K}.busFallback`) : t(`${K}.allBuses`)}
          value={loaded ? visibleRows.length : NO_VALUE}
          hint={t(`${K}.nBoarded`, { n: checkedInCount })}
        />
      </OrgKpiRow>
      {buses.length > 1 ? (
        <div role="tablist" aria-label={t(`${K}.busTabs`)} className="flex flex-wrap gap-2">
          {buses.map((vehicle) => {
            const selected = vehicle.vehicleId === activeBusId;
            return (
              <OrgButton
                key={vehicle.vehicleId}
                variant={selected ? "primary" : "secondary"}
                aria-pressed={selected}
                onClick={() => setBusId(vehicle.vehicleId)}
              >
                {vehicle.plateNumber || t(`${K}.busFallback`)}
              </OrgButton>
            );
          })}
        </div>
      ) : null}
      <OrgCard title={t(`${K}.rosterTitle`)}>
        {bookingsQuery.isLoading || manifestQuery.isLoading ? (
          <OrgLoading rows={8} />
        ) : (
          <OrgTable
            columns={columns}
            rows={visibleRows}
            rowKey={(row) => row.key}
            caption={t(`${K}.rosterTitle`)}
            empty={t(`${K}.noPassengers`)}
          />
        )}
        <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.childNote`)}</p>
      </OrgCard>
    </OrgPage>
  );
}
