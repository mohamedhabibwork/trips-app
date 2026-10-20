// SCR-ORG-44 Trip analytics: one departure's sales curve, program attach rates, bus occupancy and
// coupon usage, derived from the trip's bookings, programs, staffing and check-in manifest.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgSelect } from "../common/org-form";
import { OrgButtonLink, useOrgParams } from "../common/org-link";
import { getSelectedTripId, isoDay, tripTitle } from "../common/org-shared";
import {
  NO_VALUE,
  OrgBadge,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { toBookingRecords, toCheckInRecords, type BookingRecord } from "../bookings/booking-parts";
import { formatMinor, formatTotals, sumByCurrency } from "../accounting/finance-format";
import {
  AnalyticsTabs,
  BarRow,
  LineChart,
  NoSourceEmpty,
  PlanViewBadge,
  usePlanViewLabel,
  type LinePoint,
} from "./analytics-parts";

const PAID_STATES = ["confirmed", "checked_in", "completed"];
const K = "screen.organization.operations.tripAnalytics";

function salesPoints(bookings: readonly BookingRecord[]): LinePoint[] {
  const byDay = new Map<string, number>();
  for (const booking of bookings) {
    const day = isoDay(booking.createdAt);
    if (!day) continue;
    byDay.set(day, (byDay.get(day) ?? 0) + booking.passengersCount);
  }
  const days = [...byDay.keys()].sort();
  let cumulative = 0;
  return days.map((day) => {
    cumulative += byDay.get(day) ?? 0;
    return { label: day.slice(8, 10), value: cumulative };
  });
}

export function TripAnalytics() {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const routeTripId = useOrgParams().tripId ?? null;
  const [pickedTripId, setPickedTripId] = useState<string | null>(null);

  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
      input: {},
    }),
    enabled,
  });
  const trips = tripsQuery.data?.items ?? [];
  const tripId = routeTripId ?? pickedTripId ?? getSelectedTripId() ?? trips[0]?.id ?? null;
  const trip = trips.find((item) => item.id === tripId) ?? null;

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
  const staffingQuery = useQuery({
    ...serverQueryOptions(orpc.staffing.listTripStaffing, "staffing/listTripStaffing", {
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

  const allBookings = toBookingRecords(bookingsQuery.data);
  const bookings = useMemo(
    () =>
      allBookings.filter(
        (booking) =>
          booking.tripId === tripId && !["cancelled", "refunded"].includes(booking.status),
      ),
    [allBookings, tripId],
  );
  const paid = bookings.filter((booking) => PAID_STATES.includes(booking.status));
  const programs = programsQuery.data?.items ?? [];
  const vehicles = staffingQuery.data?.vehicles ?? [];
  const manifest = toCheckInRecords(manifestQuery.data);
  const planView = usePlanViewLabel();

  const seatsSold = paid.reduce((sum, booking) => sum + booking.passengersCount, 0);
  const capacity = trip?.totalCapacity ?? 0;
  const occupancy = capacity > 0 ? Math.round((seatsSold / capacity) * 100) : 0;
  const revenueTotals = sumByCurrency(
    paid.map((booking) => ({ minor: booking.totalAmountMinor, currency: booking.currencyCode })),
  );
  const revenue = formatTotals(revenueTotals, locale);
  const primaryCurrency = [...revenueTotals.keys()][0] ?? "SAR";
  const programsMinor = paid.reduce((sum, booking) => sum + booking.programsTotalMinor, 0);
  const travelers = paid.length;
  const programsPerTraveler = travelers > 0 ? seatsSold / travelers : 0;

  const attachByProgram = new Map<string, number>();
  for (const booking of paid) {
    for (const id of booking.selectedProgramIds) {
      attachByProgram.set(id, (attachByProgram.get(id) ?? 0) + 1);
    }
  }
  const programRows = programs
    .map((program) => ({
      program,
      uses: attachByProgram.get(program.id) ?? 0,
      revenueMinor: (attachByProgram.get(program.id) ?? 0) * program.priceMinor,
    }))
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 6);

  const bookingsByVehicle = new Map<string, number>();
  for (const booking of paid) {
    if (!booking.vehicleId) continue;
    bookingsByVehicle.set(
      booking.vehicleId,
      (bookingsByVehicle.get(booking.vehicleId) ?? 0) + booking.passengersCount,
    );
  }
  const busRows = vehicles.map((vehicle) => ({
    vehicle,
    passengers: bookingsByVehicle.get(vehicle.vehicleId) ?? 0,
  }));
  const maxBusPassengers = Math.max(1, ...busRows.map((row) => row.passengers));

  const boardedByVehicle = new Map<string, number>();
  for (const record of manifest) {
    if (record.status !== "checked_in") continue;
    if (!record.vehicleId) continue;
    boardedByVehicle.set(record.vehicleId, (boardedByVehicle.get(record.vehicleId) ?? 0) + 1);
  }

  const couponRows = new Map<string, number>();
  for (const booking of paid) {
    if (!booking.couponCode) continue;
    couponRows.set(booking.couponCode, (couponRows.get(booking.couponCode) ?? 0) + 1);
  }
  const maxCouponUses = Math.max(1, ...couponRows.values());

  const discountMinor = paid.reduce((sum, booking) => sum + booking.discountMinor, 0);
  const loaded = bookingsQuery.isSuccess;
  const failed = bookingsQuery.isError || programsQuery.isError || tripsQuery.isError;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={
          <span className="flex flex-wrap items-center gap-3">
            <PlanViewBadge label={planView} />
            {trip ? tripTitle(trip, locale) : t(`${K}.caption`)}
          </span>
        }
        actions={
          <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
            <OrgSelect
              label={t(`${K}.trip`)}
              fieldClassName="w-full sm:w-auto sm:min-w-[260px]"
              options={
                trips.length > 0
                  ? trips.map((item) => ({
                      value: item.id,
                      label: tripTitle(item, locale) || NO_VALUE,
                    }))
                  : [{ value: "", label: t(`${K}.noTrips`) }]
              }
              value={tripId ?? ""}
              onValueChange={setPickedTripId}
              disabled={trips.length === 0}
            />
            {tripId ? (
              <OrgButtonLink slug="trip-command-view" params={{ tripId }} variant="secondary">
                {t(`${K}.openTrip`)}
              </OrgButtonLink>
            ) : null}
          </div>
        }
      />
      <AnalyticsTabs activeSlug="trip-analytics" />
      {failed ? (
        <OrgError
          onRetry={() => {
            void tripsQuery.refetch();
            void bookingsQuery.refetch();
            void programsQuery.refetch();
          }}
        />
      ) : null}
      <OrgKpiRow>
        <OrgKpi
          label={t(`${K}.kpiSeats`)}
          value={loaded ? `${seatsSold}` : NO_VALUE}
          hint={capacity > 0 ? t(`${K}.ofCapacity`, { n: seatsSold, capacity }) : undefined}
        />
        <OrgKpi
          label={t(`${K}.kpiRevenue`)}
          value={loaded ? revenue : NO_VALUE}
          hint={t(`${K}.seatsPlusPrograms`, {
            amount: formatMinor(programsMinor, primaryCurrency, locale),
          })}
        />
        <OrgKpi
          label={t(`${K}.kpiBookings`)}
          value={loaded ? travelers : NO_VALUE}
          hint={t(`${K}.programsPerTraveler`, { n: programsPerTraveler.toFixed(1) })}
        />
        <OrgKpi
          label={t(`${K}.kpiOccupancy`)}
          value={loaded && capacity > 0 ? `${occupancy}%` : NO_VALUE}
          hint={
            capacity > 0 ? t(`${K}.seatsLeft`, { n: Math.max(0, capacity - seatsSold) }) : undefined
          }
        />
      </OrgKpiRow>
      <OrgRow align="start">
        <OrgCard title={t(`${K}.salesCurve`)} className="lg:flex-[2]">
          {loaded && bookings.length > 1 ? (
            <LineChart
              points={salesPoints(bookings)}
              areaLabel={t(`${K}.salesCurveChart`)}
              valueFormatter={(value) => t(`${K}.nSeats`, { n: value })}
            />
          ) : loaded ? (
            <NoSourceEmpty body={t(`${K}.noBookingsYet`)} />
          ) : (
            <OrgLoading rows={4} />
          )}
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.salesCurveNote`)}</p>
        </OrgCard>
        <OrgCard title={t(`${K}.revenueBreakdown`)} className="lg:flex-1">
          {loaded ? (
            <div className="flex flex-col gap-3">
              <BarRow
                label={t(`${K}.ticketRevenue`)}
                value={formatMinor(
                  Math.max(0, (revenueTotals.get(primaryCurrency) ?? 0) - programsMinor),
                  primaryCurrency,
                  locale,
                )}
                percent={
                  (revenueTotals.get(primaryCurrency) ?? 0) > 0
                    ? Math.round(
                        (((revenueTotals.get(primaryCurrency) ?? 0) - programsMinor) /
                          (revenueTotals.get(primaryCurrency) ?? 1)) *
                          100,
                      )
                    : 0
                }
              />
              <BarRow
                label={t(`${K}.programsRevenue`)}
                value={formatMinor(programsMinor, primaryCurrency, locale)}
                percent={
                  (revenueTotals.get(primaryCurrency) ?? 0) > 0
                    ? Math.round((programsMinor / (revenueTotals.get(primaryCurrency) ?? 1)) * 100)
                    : 0
                }
                tone="accent"
              />
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">
                {t(`${K}.discountsLine`, {
                  amount: formatMinor(discountMinor, primaryCurrency, locale),
                })}
              </p>
              <OrgButtonLink slug="trip-accounting" variant="text" className="-ms-2">
                {t(`${K}.openAccounting`)}
              </OrgButtonLink>
            </div>
          ) : (
            <OrgLoading rows={3} />
          )}
        </OrgCard>
      </OrgRow>
      <OrgRow align="start">
        <OrgCard
          title={t(`${K}.programAttach`)}
          className="lg:flex-[2]"
          actions={
            tripId ? (
              <OrgButtonLink slug="program-editor" params={{ tripId }} variant="text">
                {t(`${K}.managePrograms`)}
              </OrgButtonLink>
            ) : undefined
          }
        >
          {loaded && programRows.length > 0 ? (
            <div className="flex flex-col gap-3">
              {programRows.map((row) => (
                <BarRow
                  key={row.program.id}
                  label={
                    <span className="flex items-center gap-2">
                      {tripTitle(row.program, locale) || NO_VALUE}
                      {row.program.priceMinor === 0 ? (
                        <OrgBadge tone="neu" icon={false}>
                          {t(`${K}.freeProgram`)}
                        </OrgBadge>
                      ) : null}
                    </span>
                  }
                  value={t(`${K}.nEnrolled`, { n: row.uses })}
                  percent={travelers > 0 ? (row.uses / travelers) * 100 : 0}
                />
              ))}
            </div>
          ) : loaded ? (
            <OrgEmpty title={t(`${K}.noPrograms`)}>{t(`${K}.noProgramsBody`)}</OrgEmpty>
          ) : (
            <OrgLoading rows={3} />
          )}
        </OrgCard>
        <OrgCard
          title={t(`${K}.occupancyByBus`)}
          className="lg:flex-1"
          actions={
            tripId ? (
              <OrgButtonLink slug="seat-map-and-seat-assignment" params={{ tripId }} variant="text">
                {t(`${K}.seats`)}
              </OrgButtonLink>
            ) : undefined
          }
        >
          {loaded && busRows.length > 0 ? (
            <div className="flex flex-col gap-3">
              {busRows.map((row) => (
                <BarRow
                  key={row.vehicle.vehicleId}
                  label={row.vehicle.plateNumber || NO_VALUE}
                  value={t(`${K}.nPassengers`, { n: row.passengers })}
                  percent={(row.passengers / maxBusPassengers) * 100}
                  tone={row.passengers >= maxBusPassengers ? "accent" : "ink"}
                />
              ))}
            </div>
          ) : loaded ? (
            <OrgEmpty title={t(`${K}.noVehicles`)}>{t(`${K}.noVehiclesBody`)}</OrgEmpty>
          ) : (
            <OrgLoading rows={3} />
          )}
        </OrgCard>
      </OrgRow>
      <OrgRow align="start">
        <OrgCard title={t(`${K}.couponUsage`)}>
          {loaded && couponRows.size > 0 ? (
            <div className="flex flex-col gap-3">
              {[...couponRows.entries()].map(([code, uses]) => (
                <BarRow
                  key={code}
                  label={code}
                  value={t(`${K}.nUses`, { n: uses })}
                  percent={(uses / maxCouponUses) * 100}
                />
              ))}
            </div>
          ) : loaded ? (
            <NoSourceEmpty body={t(`${K}.noCouponUses`)} />
          ) : (
            <OrgLoading rows={3} />
          )}
        </OrgCard>
        <OrgCard title={t(`${K}.checkInProgress`)}>
          {loaded && busRows.length > 0 ? (
            <div className="flex flex-col gap-3">
              {busRows.map((row) => {
                const boarded = boardedByVehicle.get(row.vehicle.vehicleId) ?? 0;
                const percent =
                  row.passengers > 0 ? Math.round((boarded / row.passengers) * 100) : 0;
                return (
                  <BarRow
                    key={row.vehicle.vehicleId}
                    label={row.vehicle.plateNumber || NO_VALUE}
                    value={t(`${K}.nOfNBoarded`, { boarded, total: row.passengers })}
                    percent={percent}
                  />
                );
              })}
              {manifest.length === 0 ? (
                <p className="te-caption m-0 text-[var(--te-ink-muted)]">
                  {t(`${K}.manifestEmpty`)}
                </p>
              ) : null}
            </div>
          ) : loaded ? (
            <NoSourceEmpty body={t(`${K}.manifestEmpty`)} />
          ) : (
            <OrgLoading rows={3} />
          )}
        </OrgCard>
        <OrgCard title={t(`${K}.bookingSources`)}>
          <NoSourceEmpty body={t(`${K}.sourcesNoSource`)} />
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
