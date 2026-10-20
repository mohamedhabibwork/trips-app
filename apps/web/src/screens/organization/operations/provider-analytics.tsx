// SCR-ORG-46 Provider analytics: own crew versus platform crew. Own staff come from the
// organization's supplier roster, platform crew from its staffing deals; per-trip cost and rating
// series have no data source yet and say so.
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgButtonLink } from "../common/org-link";
import {
  NO_VALUE,
  OrgBadge,
  OrgCard,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import {
  AnalyticsTabs,
  BarRow,
  EnterpriseUpgradeCard,
  NoSourceEmpty,
  PlanViewBadge,
  usePlanViewLabel,
} from "./analytics-parts";

const K = "screen.organization.operations.providerAnalytics";

interface SupplierRow {
  id: string;
  name: string;
  role: "org_driver" | "org_photographer" | string;
  status: string;
}

interface DealRow {
  id: string;
  tripId: string;
  status: string;
}

const OPEN_DEAL_STATUSES = ["pending_supplier", "countered_by_supplier", "countered_by_org"];

function roleLabel(role: string): string {
  if (role === "org_driver") return t(`${K}.roleDriver`);
  if (role === "org_photographer") return t(`${K}.rolePhotographer`);
  return role || NO_VALUE;
}

function statusTone(status: string): "ok" | "warn" | "neu" {
  if (status === "active" || status === "approved") return "ok";
  if (status === "pending" || status === "suspended") return "warn";
  return "neu";
}

export function ProviderAnalytics() {
  const { status: authStatus, actor } = useAuth();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const suppliersQuery = useQuery({
    ...serverQueryOptions(
      orpc.onboarding.listOrganizationSuppliers,
      "onboarding/listOrganizationSuppliers",
      { input: {} },
    ),
    enabled,
  });
  const negotiationsQuery = useQuery({
    ...serverQueryOptions(
      orpc.negotiation.listOrganizationNegotiations,
      "negotiation/listOrganizationNegotiations",
      { input: {} },
    ),
    enabled,
  });
  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
      input: {},
    }),
    enabled,
  });

  const suppliers: readonly SupplierRow[] = (suppliersQuery.data?.suppliers ?? []).map(
    (supplier) => ({
      id: supplier.supplierAccountId,
      name: supplier.fullName,
      role: supplier.supplierRole,
      status: supplier.status,
    }),
  );
  const deals: readonly DealRow[] = (negotiationsQuery.data?.items ?? []).map((deal) => ({
    id: deal.id,
    tripId: deal.tripId,
    status: deal.status,
  }));
  const drivers = suppliers.filter((supplier) => supplier.role === "org_driver");
  const photographers = suppliers.filter((supplier) => supplier.role === "org_photographer");
  const openDeals = deals.filter((deal) => OPEN_DEAL_STATUSES.includes(deal.status));
  const trips = tripsQuery.data?.items ?? [];
  const planView = usePlanViewLabel();
  const loaded = suppliersQuery.isSuccess && negotiationsQuery.isSuccess;

  // Trips the platform staffed: any vehicle whose staffing carries a platform source.
  const platformStaffedTrips = trips.filter((trip) => {
    const dealTripIds = new Set(deals.map((deal) => deal.tripId));
    return dealTripIds.has(trip.id);
  }).length;
  const ownTrips = Math.max(0, trips.length - platformStaffedTrips);
  const staffedTotal = trips.length;
  const platformPercent =
    staffedTotal > 0 ? Math.round((platformStaffedTrips / staffedTotal) * 100) : 0;

  const failed = suppliersQuery.isError || negotiationsQuery.isError || tripsQuery.isError;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={
          <span className="flex flex-wrap items-center gap-3">
            <PlanViewBadge label={planView} />
            {t(`${K}.caption`)}
          </span>
        }
        actions={
          <OrgButtonLink slug="staffing-board" variant="secondary">
            {t(`${K}.openStaffing`)}
          </OrgButtonLink>
        }
      />
      <AnalyticsTabs activeSlug="provider-analytics" />
      {failed ? (
        <OrgError
          onRetry={() => {
            void suppliersQuery.refetch();
            void negotiationsQuery.refetch();
            void tripsQuery.refetch();
          }}
        />
      ) : null}
      <EnterpriseUpgradeCard what={t(`${K}.unlocksLine`)} />
      <OrgKpiRow>
        <OrgKpi
          label={t(`${K}.kpiOwnCrew`)}
          value={loaded ? suppliers.length : NO_VALUE}
          hint={t(`${K}.ownCrewSplit`, {
            drivers: drivers.length,
            photographers: photographers.length,
          })}
        />
        <OrgKpi
          label={t(`${K}.kpiPlatformDeals`)}
          value={loaded ? deals.length : NO_VALUE}
          hint={t(`${K}.nOpen`, { n: openDeals.length })}
        />
        <OrgKpi
          label={t(`${K}.kpiTripsStaffed`)}
          value={loaded ? staffedTotal : NO_VALUE}
          hint={t(`${K}.ownVsPlatformTrips`, { own: ownTrips, platform: platformStaffedTrips })}
        />
      </OrgKpiRow>
      <OrgRow align="start">
        <OrgCard title={t(`${K}.ownVsPlatform`)} className="lg:flex-1">
          {loaded && staffedTotal > 0 ? (
            <div className="flex flex-col gap-3">
              <BarRow
                label={t(`${K}.ownCrewTrips`)}
                value={t(`${K}.nTrips`, { n: ownTrips })}
                percent={100 - platformPercent}
              />
              <BarRow
                label={t(`${K}.platformTrips`)}
                value={t(`${K}.nTrips`, { n: platformStaffedTrips })}
                percent={platformPercent}
                tone="accent"
              />
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">
                {t(`${K}.ownVsPlatformNote`)}
              </p>
            </div>
          ) : loaded ? (
            <NoSourceEmpty body={t(`${K}.noTripsYet`)} />
          ) : (
            <OrgLoading rows={3} />
          )}
        </OrgCard>
        <OrgCard title={t(`${K}.costPerTrip`)} className="lg:flex-1">
          <NoSourceEmpty body={t(`${K}.costNoSource`)} />
        </OrgCard>
      </OrgRow>
      <OrgCard title={t(`${K}.ownCrewRoster`)}>
        {suppliersQuery.isLoading ? (
          <OrgLoading />
        ) : suppliers.length === 0 ? (
          <NoSourceEmpty body={t(`${K}.noOwnCrew`)} />
        ) : (
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {suppliers.map((supplier) => (
              <li
                key={supplier.id}
                className="flex items-center gap-2 rounded-xl border border-[var(--te-hairline)] px-3 py-2 text-sm"
              >
                <b>{supplier.name || NO_VALUE}</b>
                <span className="text-[var(--te-ink-muted)]">{roleLabel(supplier.role)}</span>
                <OrgBadge tone={statusTone(supplier.status)} icon={false}>
                  {supplier.status || NO_VALUE}
                </OrgBadge>
              </li>
            ))}
          </ul>
        )}
        <OrgButtonLink
          slug="organization-owned-drivers-and-photographers"
          variant="text"
          className="-ms-2"
        >
          {t(`${K}.manageOwnCrew`)}
        </OrgButtonLink>
      </OrgCard>
    </OrgPage>
  );
}
