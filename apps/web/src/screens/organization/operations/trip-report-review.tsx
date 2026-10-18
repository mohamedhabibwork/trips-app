// SCR-ORG-41 Trip report review: each moderator's end-of-trip report, per vehicle.
import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgTextarea } from "../common/org-form";
import { useOrgParams } from "../common/org-link";
import { getSelectedTripId, tripTitle } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { formatDateTime, rowsOf, type CheckInView } from "../accounting/finance-format";
import {
  eventsOf,
  eventsOfType,
  plateOf,
  type FleetVehicleView,
  type TripVehicleView,
} from "./operations-parts";

type ReportStatus = "submitted" | "differs" | "pending";

interface ReportRow {
  vehicleId: string;
  plate: string;
  counted: number | null;
  checkedIn: number;
  submittedAt: string | Date | null;
  reason: string | null;
  incidents: number;
  status: ReportStatus;
}

function counted(metadata: Record<string, unknown> | null | undefined): number | null {
  const value = metadata?.countedPassengers;
  return typeof value === "number" ? value : null;
}

function StatusBadge({ status }: { status: ReportStatus }) {
  if (status === "submitted")
    return (
      <OrgBadge tone="ok">
        {t("screen.organization.operations.tripReportReview.submitted")}
      </OrgBadge>
    );
  if (status === "differs")
    return (
      <OrgBadge tone="warn">
        {t("screen.organization.operations.tripReportReview.headcountDiffers")}
      </OrgBadge>
    );
  return (
    <OrgBadge tone="neu" icon="clock">
      {t("screen.organization.operations.tripReportReview.reportPending")}
    </OrgBadge>
  );
}

export function TripReportReview() {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const noteHintId = useId();
  const [note, setNote] = useState("");
  const { tripId: routeTripId } = useOrgParams();

  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({ input: {}, enabled }),
  );
  const fleetQuery = useQuery(orpc.fleet.listVehicles.queryOptions({ input: {}, enabled }));

  const trips = tripsQuery.data?.items ?? [];
  const wantedId = routeTripId ?? getSelectedTripId();
  const trip = trips.find((item) => item.id === wantedId) ?? trips[0];
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
  const headcounts = eventsOfType(events, "headcount_verified");
  const alerts = eventsOfType(events, "safety_alert");

  const rows: readonly ReportRow[] = tripVehicles.map((vehicle) => {
    const report = headcounts.find((event) => event.vehicleId === vehicle.vehicleId);
    const checkedIn = manifest.filter(
      (record) => record.vehicleId === vehicle.vehicleId && record.status === "checked_in",
    ).length;
    const finalCount = report ? counted(report.metadata) : null;
    const notes = report?.metadata?.notes;
    return {
      vehicleId: vehicle.vehicleId,
      plate: plateOf(vehicle.vehicleId, tripVehicles, fleet),
      counted: finalCount,
      checkedIn,
      submittedAt: report?.occurredAt ?? null,
      reason: typeof notes === "string" && notes ? notes : null,
      incidents: alerts.filter((event) => event.vehicleId === vehicle.vehicleId).length,
      status: !report ? "pending" : finalCount !== checkedIn ? "differs" : "submitted",
    };
  });
  const mismatch = rows.find((row) => row.status === "differs");
  const notYet = t("screen.organization.operations.tripReportReview.notYet");

  const columns: readonly OrgColumn<ReportRow>[] = [
    {
      key: "plate",
      header: t("screen.organization.operations.tripReportReview.vehicle"),
      render: (row) => <b className="font-semibold">{row.plate}</b>,
    },
    {
      key: "counted",
      header: t("screen.organization.operations.tripReportReview.finalHeadcount"),
      render: (row) => (row.status === "pending" ? notYet : String(row.counted ?? NO_VALUE)),
    },
    { key: "checkedIn", header: t("screen.organization.operations.tripReportReview.checkedIn") },
    {
      key: "submittedAt",
      header: t("screen.organization.operations.tripReportReview.submittedAt"),
      className: "whitespace-nowrap",
      render: (row) => (row.submittedAt ? formatDateTime(row.submittedAt, locale) : notYet),
    },
    {
      key: "status",
      header: t("screen.organization.operations.tripReportReview.status"),
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: "incidents", header: t("screen.organization.operations.tripReportReview.incidents") },
  ];

  const failed = tripsQuery.isError || manifestQuery.isError || trackingQuery.isError;
  const name = trip ? tripTitle(trip, locale) || NO_VALUE : NO_VALUE;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.operations.tripReportReview.title")}
        caption={t("screen.organization.operations.tripReportReview.caption", { trip: name })}
      />
      {failed ? (
        <OrgError
          onRetry={() => {
            void tripsQuery.refetch();
            void manifestQuery.refetch();
            void trackingQuery.refetch();
          }}
        />
      ) : (
        <OrgTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.vehicleId}
          caption={t("screen.organization.operations.tripReportReview.moderatorReportsPerVehicle")}
          loading={tripsQuery.isLoading || trackingQuery.isLoading}
          rowClassName={(row) =>
            row.status === "differs" ? "bg-[var(--te-warning-soft)]" : undefined
          }
          empty={
            <OrgEmpty title={t("screen.organization.operations.tripReportReview.noReportsYet")}>
              {t("screen.organization.operations.tripReportReview.reportsAppearHereAfterEach")}
            </OrgEmpty>
          }
        />
      )}
      <OrgRow align="start">
        <OrgCard
          className="flex-1"
          title={t("screen.organization.operations.tripReportReview.headcountMismatch")}
        >
          {mismatch ? (
            <>
              <OrgAlert
                tone="warn"
                title={t("screen.organization.operations.tripReportReview.nCountedNCheckedIn", {
                  counted: mismatch.counted ?? NO_VALUE,
                  checkedIn: mismatch.checkedIn,
                })}
              >
                {t("screen.organization.operations.tripReportReview.moderatorsReason", {
                  reason: mismatch.reason ?? NO_VALUE,
                })}
              </OrgAlert>
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">
                {t("screen.organization.operations.tripReportReview.submittedAtReadOnly", {
                  time: formatDateTime(mismatch.submittedAt, locale),
                  plate: mismatch.plate,
                })}
              </p>
            </>
          ) : (
            <p className="te-caption m-0 text-[var(--te-ink-muted)]">
              {t("screen.organization.operations.tripReportReview.noMismatch")}
            </p>
          )}
        </OrgCard>
        <OrgCard
          className="flex-1"
          title={t("screen.organization.operations.tripReportReview.organizationNote")}
        >
          <OrgTextarea
            label={t("screen.organization.operations.tripReportReview.addANote")}
            rows={3}
            dir="auto"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <p id={noteHintId} className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t("screen.organization.operations.tripReportReview.savingNotesIsNotAvailable")}
          </p>
          <div className="flex justify-end">
            <OrgButton aria-disabled="true" aria-describedby={noteHintId}>
              {t("screen.organization.operations.tripReportReview.addNote")}
            </OrgButton>
          </div>
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
