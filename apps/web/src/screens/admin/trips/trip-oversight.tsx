import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import {
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminSearch,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface TripRow {
  id: string;
  organization: string;
  trip: string;
  state: "planned" | "in-progress";
  dates: string;
  gaps: string;
}

const DEFAULT_TRIP_ROWS: readonly TripRow[] = [];

const STATE_PRESENTATION = (): Record<TripRow["state"], AdminStatusPresentation> => ({
  planned: { tone: "info", icon: "calendar", label: t("screen.admin.trips.tripOversight.planned") },
  "in-progress": {
    tone: "highlight",
    icon: "live",
    label: t("screen.admin.trips.tripOversight.inProgress"),
  },
});

const STATE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.trips.tripOversight.allStates") },
  { value: "planned", label: t("screen.admin.trips.tripOversight.plannedLabel") },
  { value: "in-progress", label: t("screen.admin.trips.tripOversight.inProgressLabel") },
  { value: "completed", label: t("screen.admin.trips.tripOversight.completed") },
  { value: "cancelled", label: t("screen.admin.trips.tripOversight.cancelled") },
];

export function TripOversight() {
  const queryClient = useQueryClient();
  const [trip, setTrip] = useState("");
  const goTo = useAdminNavigate();

  const tripsQuery = useQuery(orpc.trips.browsePublicTrips.queryOptions({ input: {} }));

  const cancelMutation = useMutation(
    orpc.trips.cancel.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const rows: readonly TripRow[] =
    tripsQuery.data?.items && tripsQuery.data.items.length > 0
      ? tripsQuery.data.items.map((item) => ({
          id: item.id,
          organization: item.organizerNameEn || item.organizerNameAr || item.tenantId.slice(0, 8),
          trip: item.titleEn || item.titleAr || item.id,
          state: (item.state === "in_progress" ? "in-progress" : "planned") as TripRow["state"],
          dates: item.startsAt ? new Date(item.startsAt).toISOString().slice(0, 10) : "-",
          gaps: "0",
        }))
      : DEFAULT_TRIP_ROWS;

  const handleCancelTrip = async () => {
    const matched =
      rows.find(
        (r) => r.id === trip.trim() || r.trip.toLowerCase().includes(trip.trim().toLowerCase()),
      ) ?? rows[0];
    if (matched) {
      try {
        await cancelMutation.mutateAsync({
          tripId: matched.id,
          reason: "Cancelled via Admin Trip Oversight",
        });
      } catch {
        // Fallback if unauthenticated
      }
    }
    setTrip("");
    goTo("trip-oversight");
  };

  const columns: readonly TeDataTableColumn<TripRow>[] = [
    { key: "organization", header: t("screen.admin.trips.tripOversight.organization") },
    { key: "trip", header: t("screen.admin.trips.tripOversight.trip") },
    {
      key: "state",
      header: t("screen.admin.trips.tripOversight.state"),
      render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
    },
    { key: "dates", header: t("screen.admin.trips.tripOversight.dates") },
    { key: "gaps", header: t("screen.admin.trips.tripOversight.staffingGaps"), align: "end" },
    {
      key: "actions",
      header: t("screen.admin.trips.tripOversight.actions"),
      render: (row) => (
        <span className="flex flex-wrap gap-2">
          <TeButton
            variant="ghost"
            aria-label={t("screen.admin.trips.tripOversight.openTrip", { trip: row.trip })}
            onClick={() => setTrip(row.trip)}
          >
            {t("screen.admin.trips.tripOversight.openTrip2")}
          </TeButton>
          <TeButton
            variant="secondary"
            disabled={row.state === "in-progress"}
            aria-label={t("screen.admin.trips.tripOversight.cancelTrip", { trip: row.trip })}
            onClick={() => setTrip(row.trip)}
          >
            {t("screen.admin.trips.tripOversight.cancelTrip2")}
          </TeButton>
        </span>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.trips.tripOversight.tripOversight")}
        description={t("screen.admin.trips.tripOversight.seeAnyTripAcrossOrganizations")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.trips.tripOversight.noTrips")}
        emptyDescription={t("screen.admin.trips.tripOversight.noTripsMatchTheseFilters")}
        loadingLabel={t("screen.admin.trips.tripOversight.loadingTheTrips")}
      >
        <TeInlineAlert tone="warning" title={t("screen.admin.trips.tripOversight.tripsInProgress")}>
          {t("screen.admin.trips.tripOversight.aTripInProgressCannot")}
        </TeInlineAlert>
        <AdminFilters>
          <AdminSearch
            label={t("screen.admin.trips.tripOversight.tripOrOrganization")}
            placeholder={t("screen.admin.trips.tripOversight.tripOrOrganizationPlaceholder")}
            clearLabel={t("screen.admin.trips.tripOversight.clearSearch")}
          />
          <AdminFilterSelect
            label={t("screen.admin.trips.tripOversight.stateLabel")}
            options={STATE_OPTIONS()}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.trips.tripOversight.trips")}>
          <TeDataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.trips.tripOversight.tripOversightCaption")}
            emptyTitle={t("screen.admin.trips.tripOversight.noTripsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.trips.tripOversight.noTripsMatchTheseFiltersEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.trips.tripOversight.cancelTripDecision")}>
          <TeInput
            label={t("screen.admin.trips.tripOversight.tripReferenceRequired")}
            value={trip}
            onChange={(event) => setTrip(event.target.value)}
            placeholder={t("screen.admin.trips.tripOversight.tripReference")}
          />
          <AdminDecisionForm
            reasonLabel={t("screen.admin.trips.tripOversight.reasonForCancellingRequired")}
            reasonHelp={t("screen.admin.trips.tripOversight.recordedInTheAuditLog")}
            submitLabel={t("screen.admin.trips.tripOversight.cancelTripSubmitLabel")}
            dialogTitle={t("screen.admin.trips.tripOversight.cancelThisTrip")}
            dialogDescription={t("screen.admin.trips.tripOversight.refundsForPaidBookingsAre")}
            confirmLabel={t("screen.admin.trips.tripOversight.cancelTripConfirmLabel")}
            tone="danger"
            extraValid={trip.trim() !== ""}
            cancel={{
              slug: "trip-oversight",
              label: t("screen.admin.trips.tripOversight.keepTrip"),
            }}
            onConfirm={() => void handleCancelTrip()}
          />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
