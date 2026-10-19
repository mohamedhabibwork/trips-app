// SCR-ORG-42 Child-safety reports: concerns about the organization's trips, and a new report form.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgSelect, OrgTextarea } from "../common/org-form";
import { getSelectedTripId, tripTitle } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgError,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { formatDateTime, shortRef } from "../accounting/finance-format";
import { eventsOf, plateOf, type FleetVehicleView, type TripVehicleView } from "./operations-parts";

const CASE_EVENT_TYPES: readonly string[] = ["child_boarded", "child_disembarked", "safety_alert"];
const MAX_DESCRIPTION = 400;

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
  const queryClient = useQueryClient();
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const [chosenTripId, setChosenTripId] = useState<string | null>(() => getSelectedTripId());
  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");

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

  const recordChildSafetyEventMutation = useMutation(
    orpc.tracking.recordChildSafetyEvent.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.tracking.key() });
        setDescription("");
      },
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

  const selectedVehicle = tripVehicles.some((vehicle) => vehicle.vehicleId === vehicleId)
    ? vehicleId
    : "";
  const canSubmit =
    enabled &&
    Boolean(tripId) &&
    description.trim().length > 0 &&
    !recordChildSafetyEventMutation.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const message = description.trim().slice(0, MAX_DESCRIPTION);
    recordChildSafetyEventMutation.mutate({
      tripId,
      vehicleId: selectedVehicle || null,
      childPassengerId: `case-${Date.now()}`,
      eventType: "child_boarded",
      messageEn: message,
      messageAr: message,
    });
  };

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
  const vehicleOptions = [
    { value: "", label: t("screen.organization.operations.childSafetyReports.noVehicle") },
    ...tripVehicles.map((vehicle) => ({
      value: vehicle.vehicleId,
      label: plateOf(vehicle.vehicleId, tripVehicles, noFleet),
    })),
  ];

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
        {t("screen.organization.operations.childSafetyReports.escalationContactBody", {
          contact: t("screen.organization.operations.childSafetyReports.contactToBeConfirmed"),
        })}
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
          <OrgSelect
            label={t("screen.organization.operations.childSafetyReports.trip")}
            options={tripOptions}
            value={tripId}
            disabled={trips.length === 0}
            onValueChange={(value) => {
              setChosenTripId(value);
              setVehicleId("");
            }}
          />
          <OrgSelect
            label={t("screen.organization.operations.childSafetyReports.vehicle")}
            options={vehicleOptions}
            value={selectedVehicle}
            onValueChange={setVehicleId}
          />
          <OrgTextarea
            label={t("screen.organization.operations.childSafetyReports.description")}
            rows={4}
            dir="auto"
            maxLength={MAX_DESCRIPTION}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          {recordChildSafetyEventMutation.isError ? (
            <OrgAlert
              tone="err"
              title={t("screen.organization.operations.childSafetyReports.submitFailed")}
            />
          ) : null}
          {recordChildSafetyEventMutation.isSuccess ? (
            <OrgAlert
              tone="ok"
              title={t("screen.organization.operations.childSafetyReports.reportSubmitted")}
            />
          ) : null}
          <div className="flex justify-end">
            <OrgButton disabled={!canSubmit} onClick={handleSubmit}>
              {t("screen.organization.operations.childSafetyReports.submitReport")}
            </OrgButton>
          </div>
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
