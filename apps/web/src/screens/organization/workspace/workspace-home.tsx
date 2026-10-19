// SCR-ORG-01 Workspace home: plan usage, setup checklist and the trips leaving next.
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { useOrgUsage } from "../trips/trip-parts";

import { OrgButtonLink } from "../common/org-link";
import {
  NO_VALUE,
  OrgAlert,
  OrgCard,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { isoDay } from "../common/org-shared";

import { SetupChecklist, UpcomingTripsTable, type SetupState } from "./workspace-home-parts";

/** Deal states that still wait on the organization or the supplier. */
const PENDING_DEAL_STATES = new Set([
  "pending_supplier",
  "countered_by_supplier",
  "countered_by_org",
]);
const DAY_MS = 24 * 60 * 60 * 1000;

/** The plan catalog fields the grace-period date needs. */
interface CatalogPlan {
  id: string;
  gracePeriodDays: number;
}

function useWorkspaceData() {
  const { status: authStatus, actor } = useAuth();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled,
  });
  const settingsQuery = useQuery({
    ...orpc.organization.getOrganizationSettings.queryOptions({ input: {} }),
    enabled,
  });
  const subscriptionQuery = useQuery({
    ...orpc.plans.getOrganizationSubscription.queryOptions({ input: undefined }),
    enabled,
  });
  const dealsQuery = useQuery({
    ...orpc.negotiation.listOrganizationNegotiations.queryOptions({ input: {} }),
    enabled,
  });
  const inGrace = subscriptionQuery.data?.status === "past_due";
  const catalogQuery = useQuery({
    ...orpc.plans.getCatalog.queryOptions({ input: { role: "organization" } }),
    enabled: enabled && inGrace,
  });

  return { actor, tripsQuery, settingsQuery, subscriptionQuery, dealsQuery, catalogQuery, inGrace };
}

/** Last day the features stay on: end of the paid period plus the plan's grace days. */
function graceEndDay(data: ReturnType<typeof useWorkspaceData>): string | null {
  const subscription = data.subscriptionQuery.data;
  if (!data.inGrace || !subscription) return null;
  const catalog: readonly CatalogPlan[] = data.catalogQuery.data ?? [];
  const plan = catalog.find((entry) => entry.id === subscription.planId);
  if (!plan) return null;
  const periodEnd = new Date(subscription.currentPeriodEnd).getTime();
  return isoDay(new Date(periodEnd + plan.gracePeriodDays * DAY_MS));
}

export function WorkspaceHome() {
  const { locale } = useAuth();
  const data = useWorkspaceData();
  const usageQuery = useOrgUsage();
  const { actor, tripsQuery, settingsQuery, dealsQuery } = data;

  const settings = settingsQuery.data;
  const trips = tripsQuery.data?.items ?? [];
  const now = Date.now();
  const activeTrips = trips.filter(
    (trip) => !["draft", "cancelled", "completed", "archived"].includes(trip.state),
  );
  const upcomingTrips = activeTrips
    .filter((trip) => trip.startsAt && new Date(trip.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt ?? 0).getTime() - new Date(b.startsAt ?? 0).getTime());
  const readyGaps = upcomingTrips.filter((trip) => trip.hasStaffingGap).length;
  const pendingDeals = (dealsQuery.data?.items ?? []).filter((deal) =>
    PENDING_DEAL_STATES.has(deal.status),
  ).length;

  // "This month" is counted on the server the way the plan limit is enforced.
  const usedThisMonth = usageQuery.data?.activeTripsThisMonth;
  const limit = settings?.planEntitlements.limits?.activeTripsPerMonth;
  const activeValue =
    usedThisMonth === undefined
      ? NO_VALUE
      : limit === null || limit === undefined
        ? String(usedThisMonth)
        : t("screen.organization.workspace.workspaceHome.nOfLimit", { n: usedThisMonth, limit });

  const orgName = settings
    ? (locale === "ar"
        ? settings.organization.displayNameAr || settings.organization.displayNameEn
        : settings.organization.displayNameEn || settings.organization.displayNameAr) || NO_VALUE
    : NO_VALUE;
  const caption =
    actor?.activeRole === "organization_employee"
      ? t("screen.organization.workspace.workspaceHome.captionEmployee", { name: orgName })
      : t("screen.organization.workspace.workspaceHome.captionOwner", { name: orgName });

  const setup: SetupState | null = settings
    ? {
        profile: Boolean(
          settings.organization.displayNameEn && settings.settings.operationsContactEmail,
        ),
        accounting: Boolean(settings.settings.billingAddress && settings.settings.taxNumber),
        integrations: Boolean(
          settings.settings.crmProvider || settings.settings.webhookEndpoints.length > 0,
        ),
      }
    : null;
  const graceDay = graceEndDay(data);

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.workspace.workspaceHome.title")}
        caption={caption}
        actions={
          <OrgButtonLink slug="trip-wizard-step-1-basics">
            {t("screen.organization.workspace.workspaceHome.createTrip")}
          </OrgButtonLink>
        }
      />
      {graceDay ? (
        <OrgAlert tone="warn" title={t("screen.organization.workspace.workspaceHome.gracePeriod")}>
          {t("screen.organization.workspace.workspaceHome.gracePeriodBody", { date: graceDay })}
        </OrgAlert>
      ) : null}
      <OrgKpiRow>
        <OrgKpi
          label={t("screen.organization.workspace.workspaceHome.activeTripsThisMonth")}
          value={activeValue}
        />
        <OrgKpi
          label={t("screen.organization.workspace.workspaceHome.upcomingTripsWithReadyGaps")}
          value={tripsQuery.isSuccess ? String(readyGaps) : NO_VALUE}
        />
        <OrgKpi
          label={t("screen.organization.workspace.workspaceHome.dealRequestsPending")}
          value={dealsQuery.isSuccess ? String(pendingDeals) : NO_VALUE}
        />
      </OrgKpiRow>
      <OrgRow align="start">
        <OrgCard
          title={t("screen.organization.workspace.workspaceHome.setupChecklist")}
          className="flex-1"
        >
          <SetupChecklist
            setup={setup}
            loading={settingsQuery.isLoading}
            error={settingsQuery.isError}
            onRetry={() => void settingsQuery.refetch()}
          />
        </OrgCard>
        <OrgCard
          title={t("screen.organization.workspace.workspaceHome.upcomingTrips")}
          className="lg:flex-[2]"
        >
          <UpcomingTripsTable
            trips={upcomingTrips.slice(0, 5)}
            locale={locale}
            loading={tripsQuery.isLoading}
            error={tripsQuery.isError}
            onRetry={() => void tripsQuery.refetch()}
          />
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
