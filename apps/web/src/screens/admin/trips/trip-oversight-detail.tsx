// SCR-ADM-46 Trip oversight detail (docs/design/web/AdmTrip.dc.html): one trip's oversight —
// lifecycle, buses and live tracking, bookings and GMV, deals, incidents, albums and the audit
// trail, with the cancel flow. The organization-scoped trip procedure does not accept admins, so
// the page resolves the trip through the public trip list and detail, live tracking and safety
// alerts, and the ledger filtered by trip. Trips in progress cannot be cancelled — the design's
// blocked dialog explains that; other states open the cancel dialog and call trips.cancel, whose
// errors surface honestly. Deals, albums and audit trail have no admin-reachable source and say so.
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import { AdminButton, AdminLink, useAdminParam } from "../common/admin-actions";
import { AdminInput, AdminSelect, AdminTextarea, type AdminOption } from "../common/admin-form";
import { getSelectedAdminTripId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminGrid,
  AdminKpi,
  AdminPage,
  AdminRow,
  AdminTable,
  type AdminColumn,
  type AdminTone,
} from "../common/admin-ui";
import { formatMinor, totalsByCurrency } from "../finance/finance-format";

const K = "screen.admin.trips.tripOversightDetail";

const IN_PROGRESS = "in_progress";

const CANCEL_REASONS = (): readonly AdminOption[] => [
  { value: "safety_risk", label: t(`${K}.cancelReasonSafety`) },
  { value: "terms_breach", label: t(`${K}.cancelReasonTerms`) },
  { value: "authority_instruction", label: t(`${K}.cancelReasonAuthority`) },
  { value: "payment_fraud", label: t(`${K}.cancelReasonFraud`) },
];

const SEVERITY_TONE: Record<string, AdminTone> = {
  info: "info",
  warning: "warn",
  critical: "bad",
};

const LIFECYCLE_STEPS = ["draft", "published", "in_progress", "completed"] as const;

interface TrackingRow {
  id: string;
  label: string;
  onBoard: string;
  tracking: string;
  state: string;
}

interface IncidentRow {
  id: string;
  when: string;
  severity: string;
  message: string;
}

interface LedgerRow {
  id: string;
  amount: string;
  state: string;
  description: string;
}

/** The jsonb coordinates column arrives as arbitrary JSON; read lat/long only when it is an object. */
function coordinatesLabel(coordinates: unknown): string {
  if (
    typeof coordinates === "object" &&
    coordinates !== null &&
    !Array.isArray(coordinates) &&
    "latitude" in coordinates &&
    "longitude" in coordinates &&
    typeof coordinates.latitude === "number" &&
    typeof coordinates.longitude === "number"
  ) {
    return `${coordinates.latitude.toFixed(3)}, ${coordinates.longitude.toFixed(3)}`;
  }
  return t(`${K}.noCoordinates`);
}

export function TripOversightDetail() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const tripId = useAdminParam("tripId", getSelectedAdminTripId);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReasonCode, setCancelReasonCode] = useState("safety_risk");
  const [cancelMessage, setCancelMessage] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", { input: {} }),
    enabled: authStatus === "authenticated",
  });
  const detailQuery = useQuery({
    ...serverQueryOptions(orpc.trips.getPublicTripDetail, "trips/getPublicTripDetail", {
      input: { tripId: tripId ?? "" },
    }),
    enabled: authStatus === "authenticated" && tripId !== null,
  });
  const trackingQuery = useQuery({
    ...serverQueryOptions(orpc.tracking.getTripLiveTracking, "tracking/getTripLiveTracking", {
      input: { tripId: tripId ?? "" },
    }),
    enabled: authStatus === "authenticated" && tripId !== null,
  });
  const alertsQuery = useQuery({
    ...serverQueryOptions(orpc.tracking.listSafetyAlerts, "tracking/listSafetyAlerts", {
      input: undefined,
    }),
    enabled: authStatus === "authenticated",
  });
  const ledgerQuery = useQuery({
    ...serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
      input: tripId ? { tripId } : {},
    }),
    enabled: authStatus === "authenticated" && tripId !== null,
  });

  const cancelMutation = useMutation(
    serverMutationOptions(orpc.trips.cancel, "trips/cancel", {
      onSuccess: () => {
        setCancelOpen(false);
        setConfirmText("");
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const trip = useMemo(() => {
    const fromList = (tripsQuery.data?.items ?? []).find((item) => item.id === tripId) ?? null;
    return fromList ?? detailQuery.data?.trip ?? null;
  }, [tripsQuery.data, detailQuery.data, tripId]);

  const isInProgress = trip?.state === IN_PROGRESS;
  const lifecycleIndex = trip
    ? LIFECYCLE_STEPS.indexOf(trip.state as (typeof LIFECYCLE_STEPS)[number])
    : -1;

  const alerts = (alertsQuery.data ?? []).filter((alert) => alert.tripId === tripId);
  const incidentRows: readonly IncidentRow[] = alerts.map((alert) => ({
    id: alert.id,
    when: new Date(alert.occurredAt).toLocaleString(locale),
    severity: alert.severity,
    message: (locale === "ar" ? alert.messageAr : alert.messageEn) || alert.eventType,
  }));

  const trackingRows: readonly TrackingRow[] = (trackingQuery.data?.events ?? [])
    .slice(-5)
    .reverse()
    .map((event) => ({
      id: event.id,
      label: t(`${K}.trackingEvent.${event.eventType}`),
      onBoard:
        event.eventType === "child_boarded"
          ? t(`${K}.childOnBoard`)
          : event.eventType === "child_disembarked"
            ? t(`${K}.childOffBoard`)
            : "—",
      tracking: coordinatesLabel(event.coordinates),
      state: event.severity,
    }));

  const ledgerRows: readonly LedgerRow[] = (ledgerQuery.data ?? []).map((entry) => ({
    id: entry.id,
    amount: formatMinor(entry.netAmountMinor, entry.currencyCode, locale),
    state: entry.status,
    description: entry.description,
  }));
  const gmv = totalsByCurrency(
    (ledgerQuery.data ?? [])
      .filter((row) => row.entryType === "booking_revenue" && row.direction === "credit")
      .map((row) => ({ currency: row.currencyCode, amountMinor: row.grossAmountMinor })),
  );

  const trackingColumns: readonly AdminColumn<TrackingRow>[] = [
    { key: "event", header: t(`${K}.trackingEventColumn`), render: (row) => row.label },
    {
      key: "onBoard",
      header: t(`${K}.onBoardColumn`),
      render: (row) => row.onBoard,
      headerWrap: true,
    },
    { key: "tracking", header: t(`${K}.trackingColumn`), render: (row) => row.tracking },
    {
      key: "state",
      header: t(`${K}.stateColumn`),
      render: (row) => (
        <AdminBadge tone={SEVERITY_TONE[row.state] ?? "info"} icon={false}>
          {t(`${K}.severity.${row.state}`)}
        </AdminBadge>
      ),
    },
  ];

  const incidentColumns: readonly AdminColumn<IncidentRow>[] = [
    { key: "when", header: t(`${K}.whenColumn`), render: (row) => row.when },
    {
      key: "severity",
      header: t(`${K}.severityColumn`),
      render: (row) => (
        <AdminBadge tone={SEVERITY_TONE[row.severity] ?? "info"} icon={false}>
          {t(`${K}.severity.${row.severity}`)}
        </AdminBadge>
      ),
    },
    { key: "message", header: t(`${K}.messageColumn`), render: (row) => row.message, wrap: true },
  ];

  const ledgerColumns: readonly AdminColumn<LedgerRow>[] = [
    {
      key: "description",
      header: t(`${K}.entryColumn`),
      render: (row) => row.description,
      wrap: true,
    },
    { key: "amount", header: t(`${K}.amountColumn`), render: (row) => row.amount, align: "end" },
    {
      key: "state",
      header: t(`${K}.stateColumn`),
      render: (row) => (
        <AdminBadge tone={row.state === "settled" ? "ok" : "info"} icon={false}>
          {row.state}
        </AdminBadge>
      ),
    },
  ];

  const canSubmitCancel =
    trip !== null &&
    !isInProgress &&
    confirmText.trim() === trip.id &&
    cancelMessage.trim().length >= 3 &&
    !cancelMutation.isPending;

  const submitCancel = () => {
    if (!trip || !canSubmitCancel) return;
    cancelMutation.mutate({
      tripId: trip.id,
      reason: `${cancelReasonCode}: ${cancelMessage.trim()}`,
    });
  };

  return (
    <AdminPage
      title={
        trip ? (locale === "ar" ? trip.titleAr : trip.titleEn) || trip.titleEn : t(`${K}.title`)
      }
      description={
        trip
          ? t(`${K}.subtitle`, {
              organizer: locale === "ar" ? trip.organizerNameAr : trip.organizerNameEn,
              capacity: trip.totalCapacity,
            })
          : t(`${K}.subtitleEmpty`)
      }
      actions={
        <>
          {isInProgress ? (
            <AdminBadge tone="warn" icon={false}>
              {t(`${K}.salesPaused`)}
            </AdminBadge>
          ) : null}
          <AdminLink screen="SCR-ADM-29" variant="secondary">
            {t(`${K}.allTrips`)}
          </AdminLink>
          {trip && !isInProgress ? (
            <AdminButton variant="danger" onClick={() => setCancelOpen(true)}>
              {t(`${K}.cancelTrip`)}
            </AdminButton>
          ) : null}
        </>
      }
    >
      {!tripId ? (
        <AdminCard>
          <AdminEmpty title={t(`${K}.noTripTitle`)} description={t(`${K}.noTripBody`)} />
        </AdminCard>
      ) : (
        <>
          <AdminAlert tone="warning">{t(`${K}.inProgressNote`)}</AdminAlert>

          <AdminCard title={t(`${K}.lifecycleTitle`)}>
            <ol className="m-0 flex list-none flex-wrap gap-2 p-0">
              {LIFECYCLE_STEPS.map((step, index) => {
                const reached = lifecycleIndex >= index && lifecycleIndex !== -1;
                return (
                  <li key={step}>
                    <AdminBadge
                      tone={reached ? "ok" : "neutral"}
                      icon={reached ? undefined : false}
                    >
                      {t(`${K}.lifecycle.${step}`)}
                    </AdminBadge>
                  </li>
                );
              })}
            </ol>
            <AdminRow label={t(`${K}.currentState`)}>
              {trip ? (
                <AdminBadge tone={isInProgress ? "info" : "warn"} icon={false}>
                  {t(`${K}.state.${trip.state}`)}
                </AdminBadge>
              ) : (
                "—"
              )}
            </AdminRow>
            <AdminRow label={t(`${K}.datesLabel`)} last>
              {trip?.startsAt ? new Date(trip.startsAt).toLocaleDateString(locale) : "—"}
              {trip?.endsAt ? ` – ${new Date(trip.endsAt).toLocaleDateString(locale)}` : ""}
            </AdminRow>
          </AdminCard>

          <AdminGrid columns={3}>
            <AdminKpi
              label={t(`${K}.kpiSeats`)}
              value={trip ? `${trip.confirmedSeatsCount} / ${trip.totalCapacity}` : "—"}
              caption={t(`${K}.kpiSeatsCaption`)}
            />
            <AdminKpi
              label={t(`${K}.kpiGmv`)}
              value={
                gmv.length > 0
                  ? gmv.map((row) => formatMinor(row.amountMinor, row.currency, locale)).join(" · ")
                  : "—"
              }
              caption={t(`${K}.kpiGmvCaption`)}
            />
            <AdminKpi
              label={t(`${K}.kpiIncidents`)}
              value={alertsQuery.isSuccess ? alerts.length : "—"}
              caption={t(`${K}.kpiIncidentsCaption`)}
            />
          </AdminGrid>

          <AdminCard title={t(`${K}.trackingTitle`)} caption={t(`${K}.trackingCaption`)}>
            <AdminQueryState query={trackingQuery} loadingLabel={t(`${K}.loading`)}>
              {trackingRows.length > 0 ? (
                <AdminTable
                  caption={t(`${K}.trackingCaption`)}
                  columns={trackingColumns}
                  rows={trackingRows}
                  getRowKey={(row) => row.id}
                />
              ) : (
                <AdminEmpty
                  title={t(`${K}.noTrackingTitle`)}
                  description={t(`${K}.noTrackingBody`)}
                />
              )}
            </AdminQueryState>
            <p className="te-caption">{t(`${K}.driverStaffingNote`)}</p>
          </AdminCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AdminQueryState query={ledgerQuery} loadingLabel={t(`${K}.loading`)}>
              <AdminCard title={t(`${K}.bookingsTitle`)} caption={t(`${K}.bookingsCaption`)}>
                {ledgerRows.length > 0 ? (
                  <AdminTable
                    caption={t(`${K}.bookingsCaption`)}
                    columns={ledgerColumns}
                    rows={ledgerRows}
                    getRowKey={(row) => row.id}
                  />
                ) : (
                  <AdminEmpty
                    title={t(`${K}.noLedgerTitle`)}
                    description={t(`${K}.noLedgerBody`)}
                  />
                )}
              </AdminCard>
            </AdminQueryState>
            <AdminCard title={t(`${K}.dealsTitle`)} caption={t(`${K}.dealsCaption`)}>
              <AdminEmpty title={t(`${K}.noDealsTitle`)} description={t(`${K}.noDealsBody`)} />
            </AdminCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AdminQueryState query={alertsQuery} loadingLabel={t(`${K}.loading`)}>
              <AdminCard title={t(`${K}.incidentsTitle`)} caption={t(`${K}.incidentsCaption`)}>
                {incidentRows.length > 0 ? (
                  <AdminTable
                    caption={t(`${K}.incidentsCaption`)}
                    columns={incidentColumns}
                    rows={incidentRows}
                    getRowKey={(row) => row.id}
                  />
                ) : (
                  <AdminEmpty
                    title={t(`${K}.noIncidentsTitle`)}
                    description={t(`${K}.noIncidentsBody`)}
                  />
                )}
              </AdminCard>
            </AdminQueryState>
            <AdminCard title={t(`${K}.albumsTitle`)} caption={t(`${K}.albumsCaption`)}>
              <AdminEmpty title={t(`${K}.noAlbumsTitle`)} description={t(`${K}.noAlbumsBody`)} />
            </AdminCard>
          </div>

          <AdminCard title={t(`${K}.auditTitle`)} caption={t(`${K}.auditCaption`)}>
            <AdminEmpty title={t(`${K}.noAuditTitle`)} description={t(`${K}.noAuditBody`)} />
            <AdminLink screen="SCR-ADM-30">{t(`${K}.openAuditLog`)}</AdminLink>
          </AdminCard>

          {isInProgress ? (
            <AdminCard title={t(`${K}.blockedTitle`)} label={t(`${K}.blockedTitle`)}>
              <p className="te-body">
                {t(`${K}.blockedBody`, {
                  trip: (locale === "ar" ? trip?.titleAr : trip?.titleEn) || "",
                  travellers: trip?.confirmedSeatsCount ?? 0,
                })}
              </p>
              <AdminLink screen="SCR-ADM-40" variant="secondary">
                {t(`${K}.openIncidentHandling`)}
              </AdminLink>
              <p className="te-caption">{t(`${K}.blockedNote`)}</p>
            </AdminCard>
          ) : cancelOpen && trip ? (
            <AdminCard
              title={t(`${K}.cancelTitle`, {
                trip: (locale === "ar" ? trip.titleAr : trip.titleEn) || "",
              })}
            >
              <p className="te-body">{t(`${K}.cancelWarning`)}</p>
              <AdminSelect
                label={t(`${K}.cancelReasonLabel`)}
                options={CANCEL_REASONS()}
                value={cancelReasonCode}
                onValueChange={setCancelReasonCode}
              />
              <AdminTextarea
                label={t(`${K}.cancelMessageLabel`)}
                placeholder={t(`${K}.cancelMessagePlaceholder`)}
                value={cancelMessage}
                onChange={(event) => setCancelMessage(event.target.value)}
              />
              <AdminInput
                label={t(`${K}.confirmLabel`, { reference: trip.id })}
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
              />
              {cancelMutation.isError ? (
                <AdminAlert tone="danger" title={t(`${K}.cancelErrorTitle`)}>
                  {t(`${K}.cancelErrorBody`)}
                </AdminAlert>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <AdminButton variant="secondary" onClick={() => setCancelOpen(false)}>
                  {t(`${K}.keepTrip`)}
                </AdminButton>
                <AdminButton variant="danger" disabled={!canSubmitCancel} onClick={submitCancel}>
                  {t(`${K}.confirmCancel`)}
                </AdminButton>
              </div>
            </AdminCard>
          ) : null}
        </>
      )}
    </AdminPage>
  );
}
