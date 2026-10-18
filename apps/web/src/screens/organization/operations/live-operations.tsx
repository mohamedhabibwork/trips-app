import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TeLiveMap } from "@trips-app/ui/components/te-live-map";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { TeTimeline, type TeTimelineItem } from "@trips-app/ui/components/te-timeline";
import { TeTrackingStatus } from "@trips-app/ui/components/te-tracking-status";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import { OrgSection, getSelectedTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface OccupancyRow {
  id: string;
  vehicle: string;
  checkedIn: string;
  seats: string;
  occupancy: string;
}

const OCCUPANCY_COLUMNS = (): readonly TeDataTableColumn<OccupancyRow>[] => [
  { key: "vehicle", header: t("screen.organization.operations.liveOperations.vehicle") },
  {
    key: "checkedIn",
    header: t("screen.organization.operations.liveOperations.checkedIn"),
    align: "end",
  },
  { key: "seats", header: t("screen.organization.operations.liveOperations.seats"), align: "end" },
  {
    key: "occupancy",
    header: t("screen.organization.operations.liveOperations.occupancy"),
    align: "end",
  },
];

export function LiveOperations() {
  const { status: authStatus } = useAuth();
  const [travelerQuery, setTravelerQuery] = useState("");

  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const fleetQuery = useQuery(
    orpc.fleet.listVehicles.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const selectedId = getSelectedTripId();
  const trip = useMemo(() => {
    return (
      tripsQuery.data?.items.find((item) => item.id === selectedId) ?? tripsQuery.data?.items[0]
    );
  }, [tripsQuery.data?.items, selectedId]);

  const tripTitle = trip ? trip.titleEn || trip.titleAr : "";
  const tripStatus = trip?.state ?? "In Progress";

  const manifestQuery = useQuery(
    orpc.checkIn.listTripManifest.queryOptions({
      input: { tripId: trip?.id ?? "" },
      enabled: authStatus === "authenticated" && Boolean(trip?.id),
    }),
  );

  const trackingQuery = useQuery(
    orpc.tracking.getTripLiveTracking.queryOptions({
      input: { tripId: trip?.id ?? "" },
      enabled: authStatus === "authenticated" && Boolean(trip?.id),
    }),
  );

  const checkedInTotal = useMemo(() => {
    if (!manifestQuery.data) return 0;
    return manifestQuery.data.filter((m) => m.status === "checked_in").length;
  }, [manifestQuery.data]);

  const occupancyRows = useMemo<readonly OccupancyRow[]>(() => {
    if (!fleetQuery.data?.items) return [];
    return fleetQuery.data.items.map((v) => {
      const pct =
        v.seatCount > 0 ? Math.min(100, Math.round((checkedInTotal / v.seatCount) * 100)) : 0;
      return {
        id: v.id,
        vehicle: v.plateNumber,
        checkedIn: String(checkedInTotal),
        seats: String(v.seatCount),
        occupancy: `${pct}%`,
      };
    });
  }, [fleetQuery.data?.items, checkedInTotal]);

  const incidentItems = useMemo<readonly TeTimelineItem[]>(() => {
    if (!trackingQuery.data?.events) return [];
    return trackingQuery.data.events.map((ev) => ({
      id: ev.id,
      time: new Date(ev.occurredAt).toISOString().slice(11, 16),
      label: ev.messageEn || ev.messageAr || ev.eventType,
      state: "done" as const,
    }));
  }, [trackingQuery.data?.events]);

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "trip-command-view",
            label: t("screen.organization.operations.liveOperations.backToTrip"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.operations.liveOperations.liveOperations")}
          description={tripTitle || t("screen.organization.operations.liveOperations.tripName")}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TeKpiTile
            label={t("screen.organization.operations.liveOperations.tripStatus")}
            value={tripStatus}
          />
          <TeKpiTile
            label={t("screen.organization.operations.liveOperations.travelersCheckedIn")}
            value={String(checkedInTotal)}
          />
          <TeKpiTile
            label={t("screen.organization.operations.liveOperations.vehiclesOnTheRoad")}
            value={String(occupancyRows.length)}
          />
        </div>
        <OrgSection title={t("screen.organization.operations.liveOperations.liveMap")}>
          <TeLiveMap
            route={[]}
            ariaLabel={t("screen.organization.operations.liveOperations.liveVehiclePositions")}
            statusText={t(
              "screen.organization.operations.liveOperations.vehiclePositionAndArrivalTime",
            )}
          />
          <TeTrackingStatus status="on-time" />
        </OrgSection>
        <OrgSection title={t("screen.organization.operations.liveOperations.occupancyPerVehicle")}>
          <TeDataTable
            columns={OCCUPANCY_COLUMNS()}
            rows={occupancyRows}
            getRowKey={(row) => row.id}
            caption={t("screen.organization.operations.liveOperations.occupancyPerVehicleCaption")}
            emptyTitle={t("screen.organization.operations.liveOperations.noVehiclesInProgress")}
            emptyDescription={t(
              "screen.organization.operations.liveOperations.occupancyAppearsWhenATrip",
            )}
          />
        </OrgSection>
        <OrgSection title={t("screen.organization.operations.liveOperations.travelerLookup")}>
          <TeSearchField
            label={t("screen.organization.operations.liveOperations.findATraveler")}
            value={travelerQuery}
            onValueChange={setTravelerQuery}
            clearLabel={t("screen.organization.operations.liveOperations.clearSearch")}
          />
          <p className="te-caption">
            {t("screen.organization.operations.liveOperations.theLookupShowsTheTraveler")}
          </p>
        </OrgSection>
        <OrgSection title={t("screen.organization.operations.liveOperations.incidentFeed")}>
          <TeTimeline
            items={incidentItems}
            ariaLabel={t("screen.organization.operations.liveOperations.incidentFeedAriaLabel")}
          />
        </OrgSection>
        <OrgSection title={t("screen.organization.operations.liveOperations.related")}>
          <ul className="flex flex-wrap gap-2">
            <li>
              <OrgButtonLink slug="trip-report-review" variant="secondary">
                {t("screen.organization.operations.liveOperations.tripReportReview")}
              </OrgButtonLink>
            </li>
            <li>
              <OrgButtonLink slug="bookings-and-travelers" variant="secondary">
                {t("screen.organization.operations.liveOperations.bookingsAndTravelers")}
              </OrgButtonLink>
            </li>
            <li>
              <OrgButtonLink slug="child-safety-reports" variant="secondary">
                {t("screen.organization.operations.liveOperations.childSafetyReports")}
              </OrgButtonLink>
            </li>
          </ul>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
