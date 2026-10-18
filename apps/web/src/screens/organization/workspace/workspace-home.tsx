import { useQuery } from "@tanstack/react-query";

import { TeCard } from "@trips-app/ui/components/te-card";
import { TeChecklist, type TeChecklistItem } from "@trips-app/ui/components/te-checklist";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TeNotificationItem } from "@trips-app/ui/components/te-notification-item";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrganizationNav } from "../common/organization-nav";
import { OrgButtonLink, OrgLink } from "../common/org-link";
import type { OrgSlug } from "../common/org-routes";
import { OrgSection, setActiveWizardTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface UpcomingTripRow {
  id: string;
  trip: string;
  dates: string;
  readyGaps: string;
}

interface AlertItem {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

interface AreaLink {
  slug: OrgSlug;
  label: string;
}

const UPCOMING_COLUMNS = (): readonly TeDataTableColumn<UpcomingTripRow>[] => [
  {
    key: "trip",
    header: t("screen.organization.workspace.workspaceHome.trip"),
    render: (row) => (
      <OrgLink slug="trip-command-view" onClick={() => setActiveWizardTripId(row.id)}>
        {row.trip}
      </OrgLink>
    ),
  },
  { key: "dates", header: t("screen.organization.workspace.workspaceHome.dates") },
  {
    key: "readyGaps",
    header: t("screen.organization.workspace.workspaceHome.readyGaps"),
    align: "end",
  },
];

const MORE_AREAS = (): readonly AreaLink[] => [
  {
    slug: "vehicle-registry",
    label: t("screen.organization.workspace.workspaceHome.vehicleRegistry"),
  },
  {
    slug: "crm-and-webhooks",
    label: t("screen.organization.workspace.workspaceHome.crmAndWebhooks"),
  },
  {
    slug: "child-safety-reports",
    label: t("screen.organization.workspace.workspaceHome.childSafetyReports"),
  },
];

export function WorkspaceHome() {
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
  const inboxQuery = useQuery({
    ...orpc.notifications.listInbox.queryOptions({ input: {} }),
    enabled,
  });

  const allTrips = tripsQuery.data?.items ?? [];
  const activeCount = allTrips.filter(
    (item) => item.state !== "cancelled" && item.state !== "completed",
  ).length;
  const activeTripsCount = String(activeCount);

  const upcoming = allTrips.filter(
    (item) =>
      item.state === "published" || item.state === "scheduled" || item.state === "Selection",
  );
  const upcomingTripsCount = String(upcoming.length);

  const gapsCount = upcoming.filter((item) => item.hasStaffingGap).length;
  const readyGapsCount = String(gapsCount);

  const upcomingRows: readonly UpcomingTripRow[] = upcoming.map((item) => {
    const start = item.startsAt ? new Date(item.startsAt).toISOString().slice(0, 10) : "";
    const end = item.endsAt ? new Date(item.endsAt).toISOString().slice(0, 10) : "";
    return {
      id: item.id,
      trip: item.titleEn || item.titleAr,
      dates: start && end ? `${start} – ${end}` : start,
      readyGaps: item.hasStaffingGap ? "1" : "0",
    };
  });

  const settingsRes = settingsQuery.data;
  let planLimitHint: string | undefined = undefined;
  if (settingsRes) {
    const maxTrips = settingsRes.planEntitlements.limits?.activeTripsPerMonth;
    if (maxTrips !== undefined && maxTrips !== null) {
      planLimitHint = `${settingsRes.planEntitlements.tier} limit: ${maxTrips}`;
    } else {
      planLimitHint = t("screen.organization.workspace.workspaceHome.monthlyLimitPlanLimit");
    }
  }

  const setupState = {
    profile: Boolean(
      settingsRes?.organization.displayNameEn && settingsRes?.settings.operationsContactEmail,
    ),
    accounting: Boolean(settingsRes?.settings.billingAddress || settingsRes?.settings.taxNumber),
    crm: Boolean(settingsRes?.settings.crmProvider),
    webhooks: Boolean(
      settingsRes?.settings.webhookEndpoints && settingsRes.settings.webhookEndpoints.length > 0,
    ),
  };

  const inboxRes = inboxQuery.data ?? [];
  const alerts: readonly AlertItem[] = inboxRes.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.titleEn || item.titleAr,
    body: item.bodyEn || item.bodyAr,
    time: new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    unread: item.readAt === null,
  }));

  const setupItems: readonly TeChecklistItem[] = [
    {
      id: "profile",
      label: t("screen.organization.workspace.workspaceHome.organizationProfile"),
      checked: setupState.profile,
    },
    {
      id: "accounting",
      label: t("screen.organization.workspace.workspaceHome.accountingAndInvoiceDetails"),
      checked: setupState.accounting,
    },
    {
      id: "crm",
      label: t("screen.organization.workspace.workspaceHome.crmConnectionOptional"),
      checked: setupState.crm,
    },
    {
      id: "webhooks",
      label: t("screen.organization.workspace.workspaceHome.webhooksOptional"),
      checked: setupState.webhooks,
    },
  ];

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <OrganizationNav currentSlug="workspace-home" />
        <TePageHeader
          title={t("screen.organization.workspace.workspaceHome.workspaceHome")}
          description={t("screen.organization.workspace.workspaceHome.yourOrganizationSStatusAnd")}
          actions={
            <OrgButtonLink slug="trip-wizard-step-1-basics">
              {t("screen.organization.workspace.workspaceHome.createTrip")}
            </OrgButtonLink>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TeKpiTile
            label={t("screen.organization.workspace.workspaceHome.activeTripsThisMonth")}
            value={activeTripsCount}
            hint={
              planLimitHint ??
              t("screen.organization.workspace.workspaceHome.monthlyLimitPlanLimit")
            }
          />
          <TeKpiTile
            label={t("screen.organization.workspace.workspaceHome.upcomingTrips")}
            value={upcomingTripsCount}
          />
          <TeKpiTile
            label={t("screen.organization.workspace.workspaceHome.tripsWithReadyGaps")}
            value={readyGapsCount}
          />
        </div>
        {alerts.length > 0 ? (
          <OrgSection title={t("screen.organization.workspace.workspaceHome.alerts")}>
            {alerts.map((alert) => (
              <TeNotificationItem
                key={alert.id}
                title={alert.title}
                body={alert.body}
                time={alert.time}
                unread={alert.unread}
              />
            ))}
          </OrgSection>
        ) : null}
        <OrgSection title={t("screen.organization.workspace.workspaceHome.upcomingTripsTitle")}>
          <TeDataTable
            columns={UPCOMING_COLUMNS()}
            rows={upcomingRows}
            getRowKey={(row) => row.id}
            caption={t("screen.organization.workspace.workspaceHome.upcomingTripsCaption")}
            emptyTitle={t("screen.organization.workspace.workspaceHome.noUpcomingTrips")}
            emptyDescription={t("screen.organization.workspace.workspaceHome.createATripToSee")}
          />
        </OrgSection>
        <OrgSection title={t("screen.organization.workspace.workspaceHome.moreAreas")}>
          <ul className="flex flex-wrap gap-2">
            {MORE_AREAS().map((area) => (
              <li key={area.slug}>
                <OrgButtonLink slug={area.slug} variant="secondary">
                  {area.label}
                </OrgButtonLink>
              </li>
            ))}
          </ul>
        </OrgSection>
        <OrgSection title={t("screen.organization.workspace.workspaceHome.setupChecklist")}>
          <TeCard>
            <TeChecklist
              items={setupItems}
              ariaLabel={t("screen.organization.workspace.workspaceHome.setupChecklistAriaLabel")}
            />
          </TeCard>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
