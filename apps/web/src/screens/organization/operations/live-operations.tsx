// SCR-ORG-40 Live operations: the running trip's vehicles on the map, their occupancy and incidents.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";
import { TeLiveMap } from "@trips-app/ui/components/te-live-map";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgInput } from "../common/org-form";
import { getSelectedTripId, toTripState, tripStateLabel, tripTitle } from "../common/org-shared";
import {
  NO_VALUE,
  OrgBadge,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { formatTime, rowsOf, type CheckInView } from "../accounting/finance-format";
import {
  eventMessage,
  eventsOf,
  eventsOfType,
  plateOf,
  projectRoute,
  vehicleMotion,
  type FleetVehicleView,
  type TripVehicleView,
  type VehicleMotion,
} from "./operations-parts";

const ITEM_CLASS =
  "flex items-center justify-between gap-3 border-b border-[var(--te-hairline)] py-3 text-sm leading-5 last:border-b-0";

function MotionBadge({ motion }: { motion: VehicleMotion }) {
  if (motion === "moving")
    return (
      <OrgBadge tone="ok" icon="bus">
        {t("screen.organization.operations.liveOperations.moving")}
      </OrgBadge>
    );
  if (motion === "stopped")
    return (
      <OrgBadge tone="warn">{t("screen.organization.operations.liveOperations.stopped")}</OrgBadge>
    );
  return (
    <OrgBadge tone="neu" icon="offline">
      {t("screen.organization.operations.liveOperations.noSignal")}
    </OrgBadge>
  );
}

export function LiveOperations() {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const [travelerQuery, setTravelerQuery] = useState("");

  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({ input: {}, enabled }),
  );
  const fleetQuery = useQuery(orpc.fleet.listVehicles.queryOptions({ input: {}, enabled }));

  const trips = tripsQuery.data?.items ?? [];
  const selectedId = getSelectedTripId();
  const trip =
    trips.find((item) => item.id === selectedId) ??
    trips.find((item) => toTripState(item.state) === "In Progress") ??
    trips[0];
  const tripId = trip?.id ?? "";

  const manifestQuery = useQuery(
    orpc.checkIn.listTripManifest.queryOptions({
      input: { tripId },
      enabled: enabled && Boolean(tripId),
    }),
  );
  const trackingQuery = useQuery(
    orpc.tracking.getTripLiveTracking.queryOptions({
      input: { tripId },
      enabled: enabled && Boolean(tripId),
    }),
  );

  const tripVehicles = (trip?.vehicles ?? []) as readonly TripVehicleView[];
  const fleet = (fleetQuery.data?.items ?? []) as readonly FleetVehicleView[];
  const manifest = rowsOf<CheckInView>(manifestQuery.data);
  const events = eventsOf(trackingQuery.data);
  const pings = eventsOfType(events, "gps_ping");
  const incidents = eventsOfType(events, "safety_alert");
  const route = projectRoute(pings);
  const busPosition = route.at(-1);
  const newestTime = Math.max(0, ...events.map((event) => new Date(event.occurredAt).getTime()));
  const lastUpdate = newestTime > 0 ? formatTime(new Date(newestTime), locale) : NO_VALUE;
  const plate = (vehicleId: string | null) => plateOf(vehicleId, tripVehicles, fleet);

  const needle = travelerQuery.trim().toLowerCase();
  const travelerMatches = needle
    ? manifest.filter((record) => record.passengerName.toLowerCase().includes(needle))
    : [];

  const name = trip ? tripTitle(trip, locale) || NO_VALUE : NO_VALUE;
  const childTracking = trip?.childTrackingEnabled ?? false;

  return (
    <OrgPage className="min-h-0">
      <OrgPageHeader
        title={t("screen.organization.operations.liveOperations.title")}
        caption={
          <span className="flex flex-wrap items-center gap-3">
            {trip ? (
              <OrgBadge tone="info" icon="live">
                {t("screen.organization.operations.liveOperations.tripInState", {
                  trip: name,
                  state: tripStateLabel(toTripState(trip.state)),
                })}
              </OrgBadge>
            ) : null}
            {t("screen.organization.operations.liveOperations.lastUpdate", { time: lastUpdate })}
          </span>
        }
        actions={
          trip ? (
            childTracking ? (
              <OrgBadge tone="ok">
                {t("screen.organization.operations.liveOperations.childTrackingOn")}
              </OrgBadge>
            ) : (
              <OrgBadge tone="neu">
                {t("screen.organization.operations.liveOperations.childTrackingOff")}
              </OrgBadge>
            )
          ) : null
        }
      />
      {tripsQuery.isError || trackingQuery.isError ? (
        <OrgError
          onRetry={() => {
            void tripsQuery.refetch();
            void trackingQuery.refetch();
          }}
        />
      ) : null}
      {tripsQuery.isSuccess && !trip ? (
        <OrgEmpty title={t("screen.organization.operations.liveOperations.noTripInProgress")}>
          {t("screen.organization.operations.liveOperations.occupancyAppearsWhenATrip")}
        </OrgEmpty>
      ) : null}
      <OrgRow>
        <OrgCard className="p-4 lg:flex-[2]">
          <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl bg-[var(--te-map-ground)] px-4 pt-14 pb-4 lg:min-h-[520px]">
            <TeLiveMap
              className="w-full"
              route={route}
              busPosition={busPosition}
              ariaLabel={t("screen.organization.operations.liveOperations.liveMap")}
              statusText={
                busPosition
                  ? t("screen.organization.operations.liveOperations.vehiclePositionUpdated", {
                      time: lastUpdate,
                    })
                  : t("screen.organization.operations.liveOperations.noPositionYet")
              }
            />
            <OrgBadge tone="info" className="absolute start-4 top-4">
              {t("screen.organization.operations.liveOperations.liveVehiclePositions")}
            </OrgBadge>
          </div>
        </OrgCard>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <OrgCard title={t("screen.organization.operations.liveOperations.vehiclesInProgress")}>
            {tripsQuery.isLoading ? (
              <OrgLoading rows={2} />
            ) : tripVehicles.length === 0 ? (
              <OrgEmpty
                title={t("screen.organization.operations.liveOperations.noVehiclesInProgress")}
              />
            ) : (
              <div>
                {tripVehicles.map((vehicle) => {
                  const checkedIn = manifest.filter(
                    (record) =>
                      record.vehicleId === vehicle.vehicleId && record.status === "checked_in",
                  ).length;
                  return (
                    <div key={vehicle.vehicleId} className={ITEM_CLASS}>
                      <span>
                        <b className="font-semibold">{plate(vehicle.vehicleId)}</b>
                        <br />
                        <span className="te-caption text-[var(--te-ink-muted)]">
                          {t("screen.organization.operations.liveOperations.occupancyNOfSeats", {
                            n: manifestQuery.isSuccess ? checkedIn : NO_VALUE,
                            seats: vehicle.seatCountSnapshot,
                          })}
                        </span>
                      </span>
                      <MotionBadge motion={vehicleMotion(vehicle.vehicleId, pings)} />
                    </div>
                  );
                })}
              </div>
            )}
          </OrgCard>
          <OrgCard title={t("screen.organization.operations.liveOperations.incidentFeed")}>
            {incidents.length === 0 ? (
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">
                {t("screen.organization.operations.liveOperations.noIncidents")}
              </p>
            ) : (
              <ul className="m-0 list-none p-0">
                {incidents.map((incident) => (
                  <li key={incident.id} className={ITEM_CLASS}>
                    <span>
                      {t("screen.organization.operations.liveOperations.incidentLine", {
                        time: formatTime(incident.occurredAt, locale),
                        plate: plate(incident.vehicleId),
                        description: eventMessage(incident, locale),
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </OrgCard>
          <div className="flex flex-col gap-2">
            <OrgInput
              label={t("screen.organization.operations.liveOperations.travelerLookup")}
              hint={t("screen.organization.operations.liveOperations.showsTheVehicleOnly")}
              type="search"
              dir="auto"
              value={travelerQuery}
              onChange={(event) => setTravelerQuery(event.target.value)}
            />
            {needle ? (
              <ul aria-live="polite" className="m-0 list-none p-0">
                {travelerMatches.length === 0 ? (
                  <li className="te-caption text-[var(--te-ink-muted)]">
                    {t("screen.organization.operations.liveOperations.noTravelerFound")}
                  </li>
                ) : (
                  travelerMatches.map((record) => (
                    <li key={record.id} className={ITEM_CLASS}>
                      <span>{record.passengerName}</span>
                      <b className="font-semibold">{plate(record.vehicleId)}</b>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
        </div>
      </OrgRow>
    </OrgPage>
  );
}
