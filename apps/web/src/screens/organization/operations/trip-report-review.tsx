import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge, getSelectedTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface ModeratorReportRow {
  id: string;
  vehicle: string;
  headcount: string;
  checkedIn: string;
  incidents: string;
  submittedAt: string;
}

const REPORT_COLUMNS = (): readonly TeDataTableColumn<ModeratorReportRow>[] => [
  { key: "vehicle", header: t("screen.organization.operations.tripReportReview.vehicle") },
  {
    key: "headcount",
    header: t("screen.organization.operations.tripReportReview.finalHeadcount"),
    align: "end",
  },
  {
    key: "checkedIn",
    header: t("screen.organization.operations.tripReportReview.checkedIn"),
    align: "end",
  },
  {
    key: "match",
    header: t("screen.organization.operations.tripReportReview.headcount"),
    render: (row) =>
      row.headcount === row.checkedIn ? (
        <StateBadge
          tone="success"
          icon="check"
          label={t("screen.organization.operations.tripReportReview.matchesCheckIn")}
        />
      ) : (
        <StateBadge
          tone="warning"
          icon="alert"
          label={t("screen.organization.operations.tripReportReview.mismatch")}
        />
      ),
  },
  {
    key: "incidents",
    header: t("screen.organization.operations.tripReportReview.incidents"),
    align: "end",
  },
  { key: "submittedAt", header: t("screen.organization.operations.tripReportReview.submitted") },
];

export function TripReportReview() {
  const { status: authStatus } = useAuth();
  const [note, setNote] = useState("");

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

  const rows = useMemo<readonly ModeratorReportRow[]>(() => {
    if (!fleetQuery.data?.items || !trip) return [];
    const checkedInCount = manifestQuery.data
      ? manifestQuery.data.filter((m) => m.status === "checked_in").length
      : 0;
    const incidentCount = trackingQuery.data?.events
      ? trackingQuery.data.events.filter(
          (ev) => ev.eventType === "safety_alert" || ev.eventType === "emergency_sos",
        ).length
      : 0;
    const lastSubmitted = trackingQuery.data?.events[0]?.occurredAt
      ? new Date(trackingQuery.data.events[0].occurredAt)
          .toISOString()
          .slice(0, 16)
          .replace("T", " ")
      : new Date(trip.updatedAt).toISOString().slice(0, 16).replace("T", " ");
    return fleetQuery.data.items.map((v) => ({
      id: v.id,
      vehicle: v.plateNumber,
      headcount: String(checkedInCount),
      checkedIn: String(checkedInCount),
      incidents: String(incidentCount),
      submittedAt: lastSubmitted,
    }));
  }, [fleetQuery.data?.items, trip, manifestQuery.data, trackingQuery.data?.events]);

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "trip-command-view",
            label: t("screen.organization.operations.tripReportReview.backToTrip"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.operations.tripReportReview.tripReportReview")}
          description={tripTitle || t("screen.organization.operations.tripReportReview.tripName")}
        />
        <OrgSection title={t("screen.organization.operations.tripReportReview.moderatorReports")}>
          <TeDataTable
            columns={REPORT_COLUMNS()}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t(
              "screen.organization.operations.tripReportReview.moderatorReportsPerVehicle",
            )}
            emptyTitle={t("screen.organization.operations.tripReportReview.noReportsYet")}
            emptyDescription={t(
              "screen.organization.operations.tripReportReview.reportsAppearHereAfterEach",
            )}
          />
        </OrgSection>
        <OrgSection title={t("screen.organization.operations.tripReportReview.organizationNote")}>
          <TeCard>
            <div className="flex flex-col gap-4">
              <TeInput
                label={t("screen.organization.operations.tripReportReview.note")}
                placeholder={t("screen.organization.operations.tripReportReview.notePlaceholder")}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                supportingText={t("screen.organization.operations.tripReportReview.youCanAddANote")}
                dir="auto"
              />
              <div className="flex justify-end">
                <TeButton disabled={note.trim().length === 0} onClick={() => setNote("")}>
                  {t("screen.organization.operations.tripReportReview.addNote")}
                </TeButton>
              </div>
            </div>
          </TeCard>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
