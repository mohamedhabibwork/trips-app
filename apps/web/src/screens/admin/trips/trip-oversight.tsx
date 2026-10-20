// SCR-ADM-29 Trip oversight (docs/design/web/admin/SCR-ADM-29.dc.html): any trip across
// organizations, filtered by organization or trip, state and date, with the cancel-trip decision
// beside the table. In Progress trips cannot be cancelled here (incident handling only).
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { trackEvent } from "@/utils/analytics";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import { AdminButton } from "../common/admin-actions";
import { AdminInput, AdminSelect, AdminTextarea, type AdminOption } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminFilterBar,
  AdminPage,
  AdminSplit,
  AdminTable,
  type AdminColumn,
  type AdminTone,
} from "../common/admin-ui";

const MIN_REASON_LENGTH = 3;
const IN_PROGRESS = "in_progress";

interface TripRow {
  id: string;
  organization: string;
  trip: string;
  state: string;
  dates: string;
  startsAt: Date | null;
  endsAt: Date | null;
}

const STATE_PRESENTATION: Record<string, { key: string; tone: AdminTone }> = {
  draft: { key: "screen.admin.trips.tripOversight.stateDraft", tone: "warn" },
  published: { key: "screen.admin.trips.tripOversight.statePublished", tone: "warn" },
  scheduled: { key: "screen.admin.trips.tripOversight.stateScheduled", tone: "warn" },
  Selection: { key: "screen.admin.trips.tripOversight.stateSelection", tone: "warn" },
  in_progress: { key: "screen.admin.trips.tripOversight.stateInProgress", tone: "info" },
  completed: { key: "screen.admin.trips.tripOversight.stateCompleted", tone: "ok" },
  cancelled: { key: "screen.admin.trips.tripOversight.stateCancelled", tone: "bad" },
};

const stateOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.trips.tripOversight.allStates") },
  ...Object.entries(STATE_PRESENTATION).map(([value, presentation]) => ({
    value,
    label: t(presentation.key),
  })),
];

function StateBadge({ state }: { state: string }) {
  const presentation = STATE_PRESENTATION[state];
  if (!presentation) return <AdminBadge icon={false}>{state}</AdminBadge>;
  const icon = state === IN_PROGRESS ? "lock" : presentation.tone === "warn" ? false : undefined;
  return (
    <AdminBadge tone={presentation.tone} icon={icon}>
      {t(presentation.key)}
    </AdminBadge>
  );
}

function toDate(value: Date | string | null): Date | null {
  return value ? new Date(value) : null;
}

function formatDates(startsAt: Date | null, endsAt: Date | null, locale: string): string {
  if (!startsAt) return "—";
  const start = startsAt.toLocaleDateString(locale);
  const end = endsAt?.toLocaleDateString(locale);
  return end && end !== start ? `${start} – ${end}` : start;
}

/** A trip matches a picked day when the day falls between its start and end dates. */
function coversDay(row: TripRow, day: string): boolean {
  if (!day) return true;
  if (!row.startsAt) return false;
  const start = row.startsAt.toISOString().slice(0, 10);
  const end = (row.endsAt ?? row.startsAt).toISOString().slice(0, 10);
  return start <= day && day <= end;
}

function matchesSearch(row: TripRow, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return `${row.organization} ${row.trip}`.toLowerCase().includes(needle);
}

export function TripOversight() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [day, setDay] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", { input: {} }),
    enabled: authStatus === "authenticated",
  });

  const cancelMutation = useMutation(
    serverMutationOptions(orpc.trips.cancel, "trips/cancel", {
      onSuccess: () => {
        trackEvent("trip_cancelled", { surface: "admin" });
        setReason("");
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
      onError: () => trackEvent("trip_cancel_failed", { surface: "admin" }),
    }),
  );

  const allRows: readonly TripRow[] = (tripsQuery.data?.items ?? []).map((item) => {
    const startsAt = toDate(item.startsAt);
    const endsAt = toDate(item.endsAt);
    return {
      id: item.id,
      organization: (locale === "ar" ? item.organizerNameAr : item.organizerNameEn) || "—",
      trip: (locale === "ar" ? item.titleAr : item.titleEn) || item.titleEn || item.titleAr,
      state: item.state,
      dates: formatDates(startsAt, endsAt, locale),
      startsAt,
      endsAt,
    };
  });
  const rows = allRows.filter(
    (row) =>
      matchesSearch(row, search) &&
      (stateFilter === "all" || row.state === stateFilter) &&
      coversDay(row, day),
  );
  const selected = allRows.find((row) => row.id === selectedId) ?? null;
  const selectedInProgress = selected?.state === IN_PROGRESS;
  const canCancel =
    selected !== null &&
    !selectedInProgress &&
    reason.trim().length >= MIN_REASON_LENGTH &&
    !cancelMutation.isPending;

  const pickTrip = (id: string) => {
    setSelectedId(id);
    cancelMutation.reset();
  };

  const handleCancel = () => {
    if (!selected || !canCancel) return;
    cancelMutation.mutate({ tripId: selected.id, reason: reason.trim() });
  };

  const columns: readonly AdminColumn<TripRow>[] = [
    {
      key: "organization",
      header: t("screen.admin.trips.tripOversight.organization"),
      render: (row) => row.organization,
      wrap: true,
    },
    {
      key: "trip",
      header: t("screen.admin.trips.tripOversight.trip"),
      render: (row) => row.trip,
      wrap: true,
    },
    {
      key: "state",
      header: t("screen.admin.trips.tripOversight.state"),
      render: (row) => <StateBadge state={row.state} />,
    },
    {
      key: "dates",
      header: t("screen.admin.trips.tripOversight.dates"),
      render: (row) => row.dates,
      wrap: true,
    },
    {
      key: "gaps",
      header: t("screen.admin.trips.tripOversight.staffingGaps"),
      // Staffing gaps are not part of the trip list the API returns.
      render: () => "—",
      align: "end",
      headerWrap: true,
    },
    {
      key: "action",
      header: <span className="te-caption">{t("screen.admin.trips.tripOversight.action")}</span>,
      render: (row) => (
        <span className="flex items-center gap-4">
          <AdminButton
            variant="link"
            aria-label={t("screen.admin.trips.tripOversight.openTripFor", { trip: row.trip })}
            onClick={() => pickTrip(row.id)}
          >
            {t("screen.admin.trips.tripOversight.openTrip")}
          </AdminButton>
          {row.state === IN_PROGRESS || row.state === "cancelled" ? null : (
            <AdminButton
              variant="link"
              aria-label={t("screen.admin.trips.tripOversight.cancelFor", { trip: row.trip })}
              onClick={() => pickTrip(row.id)}
            >
              {t("screen.admin.trips.tripOversight.cancel")}
            </AdminButton>
          )}
        </span>
      ),
    },
  ];

  const cancelCard = (
    <AdminCard title={t("screen.admin.trips.tripOversight.cancelTrip")}>
      <p className="te-body">
        {selected
          ? t("screen.admin.trips.tripOversight.selectedTrip", {
              organization: selected.organization,
              trip: selected.trip,
            })
          : t("screen.admin.trips.tripOversight.noTripSelected")}
      </p>
      {selectedInProgress ? (
        <AdminAlert tone="warning">
          {t("screen.admin.trips.tripOversight.inProgressBlocked")}
        </AdminAlert>
      ) : null}
      <AdminTextarea
        label={t("screen.admin.trips.tripOversight.reasonRequired")}
        placeholder={t("screen.admin.trips.tripOversight.reasonPlaceholder")}
        rows={4}
        required
        value={reason}
        disabled={!selected || selectedInProgress}
        onChange={(event) => setReason(event.target.value)}
      />
      {cancelMutation.isError ? (
        <AdminAlert tone="danger" title={t("screen.admin.trips.tripOversight.cancelFailedTitle")}>
          {t("screen.admin.trips.tripOversight.cancelFailedBody")}
        </AdminAlert>
      ) : null}
      {cancelMutation.isSuccess ? (
        <AdminAlert tone="success">{t("screen.admin.trips.tripOversight.cancelDone")}</AdminAlert>
      ) : null}
      <AdminButton variant="danger" disabled={!canCancel} onClick={handleCancel}>
        {t("screen.admin.trips.tripOversight.cancelTrip")}
      </AdminButton>
    </AdminCard>
  );

  return (
    <AdminPage
      title={t("screen.admin.trips.tripOversight.title")}
      description={t("screen.admin.trips.tripOversight.description")}
    >
      <AdminFilterBar label={t("screen.admin.trips.tripOversight.filters")}>
        <AdminInput
          type="search"
          label={t("screen.admin.trips.tripOversight.organization")}
          placeholder={t("screen.admin.trips.tripOversight.searchPlaceholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="lg:flex-[2]"
        />
        <AdminSelect
          label={t("screen.admin.trips.tripOversight.state")}
          options={stateOptions()}
          value={stateFilter}
          onValueChange={setStateFilter}
        />
        <AdminInput
          type="date"
          label={t("screen.admin.trips.tripOversight.dates")}
          value={day}
          onChange={(event) => setDay(event.target.value)}
        />
      </AdminFilterBar>
      <AdminQueryState
        query={tripsQuery}
        loadingLabel={t("screen.admin.trips.tripOversight.loading")}
      >
        <AdminSplit
          main={
            <AdminTable
              caption={t("screen.admin.trips.tripOversight.tableCaption")}
              columns={columns}
              rows={rows}
              getRowKey={(row) => row.id}
              empty={
                <AdminEmpty
                  title={t("screen.admin.trips.tripOversight.emptyTitle")}
                  description={t("screen.admin.trips.tripOversight.emptyBody")}
                />
              }
            />
          }
          side={cancelCard}
        />
      </AdminQueryState>
      <AdminAlert tone="warning">{t("screen.admin.trips.tripOversight.inProgressNote")}</AdminAlert>
    </AdminPage>
  );
}
