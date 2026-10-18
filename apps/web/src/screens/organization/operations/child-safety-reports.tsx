import { useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge, getSelectedTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

type CaseStatus = "open" | "routed";

interface CaseRow {
  id: string;
  reference: string;
  time: string;
  trip: string;
  vehicle: string;
  status: CaseStatus;
}

const CASE_COLUMNS = (): readonly TeDataTableColumn<CaseRow>[] => [
  { key: "reference", header: t("screen.organization.operations.childSafetyReports.case") },
  { key: "time", header: t("screen.organization.operations.childSafetyReports.time") },
  { key: "trip", header: t("screen.organization.operations.childSafetyReports.trip") },
  { key: "vehicle", header: t("screen.organization.operations.childSafetyReports.vehicle") },
  {
    key: "status",
    header: t("screen.organization.operations.childSafetyReports.status"),
    render: (row) =>
      row.status === "open" ? (
        <StateBadge
          tone="warning"
          icon="alert"
          label={t("screen.organization.operations.childSafetyReports.caseOpen")}
        />
      ) : (
        <StateBadge
          tone="info"
          icon="arrow"
          label={t("screen.organization.operations.childSafetyReports.routedToEscalationContact")}
        />
      ),
  },
];

export function ChildSafetyReports() {
  const queryClient = useQueryClient();
  const { status: authStatus } = useAuth();

  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({
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

  const trackingQuery = useQuery(
    orpc.tracking.getTripLiveTracking.queryOptions({
      input: { tripId: trip?.id ?? "" },
      enabled: authStatus === "authenticated" && Boolean(trip?.id),
    }),
  );

  const recordChildSafetyEventMutation = useMutation(
    orpc.tracking.recordChildSafetyEvent.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.tracking.key() });
      },
    }),
  );

  const rows = useMemo<readonly CaseRow[]>(() => {
    if (!trackingQuery.data?.events || !trip) return [];
    const title = trip.titleEn || trip.titleAr;
    const safetyEvents = trackingQuery.data.events.filter(
      (ev) =>
        ev.eventType === "child_boarded" ||
        ev.eventType === "child_disembarked" ||
        ev.eventType === "safety_alert" ||
        ev.eventType === "emergency_sos",
    );
    return safetyEvents.map((ev) => ({
      id: ev.id,
      reference: ev.id.slice(0, 8).toUpperCase(),
      time: new Date(ev.occurredAt).toISOString().slice(0, 16).replace("T", " "),
      trip: title,
      vehicle: ev.vehicleId ? ev.vehicleId.slice(0, 8) : "-",
      status: ev.eventType === "emergency_sos" ? "routed" : "open",
    }));
  }, [trackingQuery.data?.events, trip]);

  const handleNewReport = () => {
    if (authStatus !== "authenticated" || !trip?.id) return;
    recordChildSafetyEventMutation.mutate({
      tripId: trip.id,
      childPassengerId: `case-${Date.now()}`,
      eventType: "child_boarded",
      messageEn: "Child safety check recorded by organization",
    });
  };

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "live-operations",
            label: t("screen.organization.operations.childSafetyReports.backToLiveOperations"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.operations.childSafetyReports.childSafetyReports")}
          actions={
            <TeButton
              disabled={!trip?.id || recordChildSafetyEventMutation.isPending}
              onClick={handleNewReport}
            >
              {t("screen.organization.operations.childSafetyReports.newReport")}
            </TeButton>
          }
        />
        <TeInlineAlert
          tone="info"
          title={t("screen.organization.operations.childSafetyReports.escalationContact")}
        >
          {t("screen.organization.operations.childSafetyReports.reportsAreRoutedToEscalation")}
        </TeInlineAlert>
        <OrgSection title={t("screen.organization.operations.childSafetyReports.cases")}>
          <TeDataTable
            columns={CASE_COLUMNS()}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.organization.operations.childSafetyReports.childSafetyCases")}
            emptyTitle={t("screen.organization.operations.childSafetyReports.noCases")}
            emptyDescription={t(
              "screen.organization.operations.childSafetyReports.casesYouSubmitForTrips",
            )}
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
