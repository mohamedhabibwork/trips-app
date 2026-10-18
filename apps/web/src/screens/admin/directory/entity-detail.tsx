import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeTimeline, type TeTimelineItem } from "@trips-app/ui/components/te-timeline";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  getSelectedAdminEntityId,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface TripRow {
  id: string;
  trip: string;
  state: string;
  dates: string;
}

const ACTIVE = (): AdminStatusPresentation => ({
  tone: "success",
  icon: "check",
  label: t("screen.admin.directory.entityDetail.active"),
});

const TRIP_COLUMNS = (): readonly TeDataTableColumn<TripRow>[] => [
  { key: "trip", header: t("screen.admin.directory.entityDetail.trip") },
  { key: "state", header: t("screen.admin.directory.entityDetail.state") },
  { key: "dates", header: t("screen.admin.directory.entityDetail.dates") },
];

export function EntityDetail() {
  const { status: authStatus } = useAuth();

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });
  const tripsQuery = useQuery({
    ...orpc.trips.browsePublicTrips.queryOptions({ input: {} }),
  });
  const catalogQuery = useQuery({
    ...orpc.plans.getCatalog.queryOptions({ input: {} }),
  });

  const apps = queueQuery.data ?? [];
  const publicTrips = tripsQuery.data ?? { items: [] };
  const catalog = catalogQuery.data ?? [];

  const selectedId = getSelectedAdminEntityId();
  const found = apps.find((a) => a.id === selectedId) ?? apps[0];
  const payload = (found?.payload ?? {}) as Record<string, unknown>;

  const entityName =
    found?.applicant?.fullName ??
    (typeof payload.legalEntityName === "string"
      ? payload.legalEntityName
      : (found?.applicantAccountId ?? "-"));
  const email =
    found?.applicant?.email ??
    (typeof payload.billingContactEmail === "string" ? payload.billingContactEmail : "-");
  const phone =
    found?.applicant?.phone ??
    (typeof payload.billingContactPhone === "string" ? payload.billingContactPhone : "-");
  const country = typeof payload.countryCode === "string" ? payload.countryCode : "EG";
  const entityType = found?.applicationType ?? "-";
  const isSuspended = found?.state === "Rejected" || found?.state === "Closed";

  const firstPlan = catalog[0];
  const planName = firstPlan ? firstPlan.nameEn : "Starter";
  const billingStatus = firstPlan ? "Active" : "Active";
  const renewalDate = firstPlan
    ? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    : "-";

  const tripRows: readonly TripRow[] = publicTrips.items.map((trip) => ({
    id: trip.id,
    trip: trip.titleEn || trip.titleAr,
    state: trip.state,
    dates: trip.startsAt ? new Date(trip.startsAt).toISOString().slice(0, 10) : "-",
  }));

  const historyItems: readonly TeTimelineItem[] = apps.slice(0, 10).map((a) => ({
    id: a.id,
    time: new Date(a.updatedAt).toISOString().slice(0, 16).replace("T", " "),
    label: `${a.state} (${a.applicationType})`,
    state: "done" as const,
  }));

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.directory.entityDetail.entityDetail")}
        description={t("screen.admin.directory.entityDetail.entityNameProfilePlanTrips")}
        actions={
          <AdminActions>
            <AdminScreenLink slug="deletion-and-data-requests" variant="ghost">
              {t("screen.admin.directory.entityDetail.handleDeletion")}
            </AdminScreenLink>
            <AdminScreenLink slug="subscriptions-and-overrides" variant="secondary">
              {t("screen.admin.directory.entityDetail.grantOrOverridePlan")}
            </AdminScreenLink>
            <AdminScreenLink slug="request-lab-test-decision" variant="secondary">
              {t("screen.admin.directory.entityDetail.requestLabTest")}
            </AdminScreenLink>
            <AdminScreenLink slug="suspend-or-reinstate-decision" variant="primary">
              {t("screen.admin.directory.entityDetail.suspendOrReinstate")}
            </AdminScreenLink>
          </AdminActions>
        }
      />
      <StatePreview
        emptyTitle={t("screen.admin.directory.entityDetail.noTripsOrBookings")}
        emptyDescription={t("screen.admin.directory.entityDetail.thisAccountHasNoTrips")}
        loadingLabel={t("screen.admin.directory.entityDetail.loadingTheAccount")}
      >
        {isSuspended ? (
          <TeInlineAlert tone="warning" title={t("screen.admin.directory.entityDetail.suspended")}>
            {t("screen.admin.directory.entityDetail.signInIsRefusedWhile")}
          </TeInlineAlert>
        ) : null}
        <AdminPanel title={t("screen.admin.directory.entityDetail.profile")}>
          <AdminStatus status={ACTIVE()} />
          <AdminFacts
            items={[
              { label: t("screen.admin.directory.entityDetail.name"), value: entityName },
              { label: t("screen.admin.directory.entityDetail.email"), value: email },
              { label: t("screen.admin.directory.entityDetail.phone"), value: phone },
              { label: t("screen.admin.directory.entityDetail.country"), value: country },
              {
                label: t("screen.admin.directory.entityDetail.entityType"),
                value: entityType,
              },
              {
                label: t("screen.admin.directory.entityDetail.deletionRequest"),
                value: "None",
              },
            ]}
          />
          <AdminScreenLink slug="users-and-entities-directory">
            {t("screen.admin.directory.entityDetail.backToDirectory")}
          </AdminScreenLink>
        </AdminPanel>
        <AdminPanel title={t("screen.admin.directory.entityDetail.roleAssignments")}>
          <p>{t("screen.admin.directory.entityDetail.roleAssignments2")}</p>
        </AdminPanel>
        <AdminPanel title={t("screen.admin.directory.entityDetail.planAndSubscription")}>
          <AdminFacts
            items={[
              { label: t("screen.admin.directory.entityDetail.plan"), value: planName },
              {
                label: t("screen.admin.directory.entityDetail.billingStatus"),
                value: billingStatus,
              },
              { label: t("screen.admin.directory.entityDetail.renewalDate"), value: renewalDate },
            ]}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.directory.entityDetail.tripsAndBookings")}>
          <TeDataTable
            columns={TRIP_COLUMNS()}
            rows={tripRows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.directory.entityDetail.tripsAndBookingsCaption")}
            emptyTitle={t("screen.admin.directory.entityDetail.noTripsOrBookingsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.directory.entityDetail.thisAccountHasNoTripsEmptyDescription",
            )}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.directory.entityDetail.auditHistory")}>
          <TeTimeline
            items={historyItems}
            ariaLabel={t("screen.admin.directory.entityDetail.auditHistoryForThisAccount")}
          />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
