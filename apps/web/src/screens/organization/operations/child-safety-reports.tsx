// SCR-ORG-42 Child-safety reports: child-safety events on the organization's trips.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgSelect } from "../common/org-form";
import { getSelectedTripId, tripTitle } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgCard,
  OrgError,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { formatDateTime, shortRef } from "../accounting/finance-format";
import { eventsOf, plateOf, type FleetVehicleView, type TripVehicleView } from "./operations-parts";

const CASE_EVENT_TYPES: readonly string[] = ["child_boarded", "child_disembarked", "safety_alert"];

type CaseStatus = "open" | "routed";

interface CaseRow {
  id: string;
  reference: string;
  status: CaseStatus;
  occurredAt: string | Date;
  trip: string;
  vehicle: string;
}

export function ChildSafetyReports() {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const [chosenTripId, setChosenTripId] = useState<string | null>(() => getSelectedTripId());

  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({ input: {}, enabled }),
  );
  const trips = tripsQuery.data?.items ?? [];
  const trip = trips.find((item) => item.id === chosenTripId) ?? trips[0];
  const tripId = trip?.id ?? "";

  const trackingQuery = useQuery(
    orpc.tracking.getTripLiveTracking.queryOptions({
      input: { tripId },
      enabled: enabled && Boolean(tripId),
    }),
  );

  const tripVehicles = (trip?.vehicles ?? []) as readonly TripVehicleView[];
  const noFleet: readonly FleetVehicleView[] = [];
  const name = trip ? tripTitle(trip, locale) || NO_VALUE : NO_VALUE;
  const rows: readonly CaseRow[] = eventsOf(trackingQuery.data)
    .filter((event) => CASE_EVENT_TYPES.includes(event.eventType))
    .map((event) => ({
      id: event.id,
      reference: shortRef(event.id),
      status: event.severity === "critical" ? "routed" : "open",
      occurredAt: event.occurredAt,
      trip: name,
      vehicle: plateOf(event.vehicleId, tripVehicles, noFleet),
    }));

  const columns: readonly OrgColumn<CaseRow>[] = [
    {
      key: "reference",
      header: t("screen.organization.operations.childSafetyReports.case"),
      render: (row) => <b className="font-semibold">{row.reference}</b>,
    },
    {
      key: "status",
      header: t("screen.organization.operations.childSafetyReports.status"),
      render: (row) =>
        row.status === "routed" ? (
          <OrgBadge tone="info" icon="arrow">
            {t("screen.organization.operations.childSafetyReports.routedToEscalationContact")}
          </OrgBadge>
        ) : (
          <OrgBadge tone="warn">
            {t("screen.organization.operations.childSafetyReports.caseOpen")}
          </OrgBadge>
        ),
    },
    {
      key: "time",
      header: t("screen.organization.operations.childSafetyReports.time"),
      className: "whitespace-nowrap",
      render: (row) => formatDateTime(row.occurredAt, locale),
    },
    { key: "trip", header: t("screen.organization.operations.childSafetyReports.trip") },
    { key: "vehicle", header: t("screen.organization.operations.childSafetyReports.vehicle") },
  ];

  const tripOptions =
    trips.length > 0
      ? trips.map((item) => ({ value: item.id, label: tripTitle(item, locale) || item.id }))
      : [{ value: "", label: t("screen.organization.operations.childSafetyReports.noTrips") }];

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.operations.childSafetyReports.title")}
        caption={t("screen.organization.operations.childSafetyReports.caption")}
      />
      <OrgAlert
        tone="info"
        title={t("screen.organization.operations.childSafetyReports.everyCaseIsRouted")}
      >
        {t("screen.organization.operations.childSafetyReports.escalationContactPending")}
      </OrgAlert>
      <OrgRow align="start">
        <OrgCard
          className="lg:flex-[2]"
          title={t("screen.organization.operations.childSafetyReports.yourCases")}
        >
          {tripsQuery.isError || trackingQuery.isError ? (
            <OrgError
              onRetry={() => {
                void tripsQuery.refetch();
                void trackingQuery.refetch();
              }}
            />
          ) : (
            <OrgTable
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              caption={t("screen.organization.operations.childSafetyReports.yourCases")}
              loading={tripsQuery.isLoading || trackingQuery.isLoading}
              empty={t("screen.organization.operations.childSafetyReports.noCases")}
            />
          )}
        </OrgCard>
        <OrgCard
          className="flex-1"
          title={t("screen.organization.operations.childSafetyReports.newReport")}
        >
          {/* No procedure stores a child-safety report yet; recording one as a tracking event
              would invent a child passenger, so the form waits for that procedure. */}
          <OrgSelect
            label={t("screen.organization.operations.childSafetyReports.trip")}
            options={tripOptions}
            value={tripId}
            disabled={trips.length === 0}
            onValueChange={setChosenTripId}
          />
          <OrgAlert
            tone="info"
            title={t("screen.organization.operations.childSafetyReports.reportUnavailableTitle")}
          >
            {t("screen.organization.operations.childSafetyReports.reportUnavailableBody")}
          </OrgAlert>
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
