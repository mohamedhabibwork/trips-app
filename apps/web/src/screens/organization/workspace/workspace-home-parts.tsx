// Pieces of SCR-ORG-01 Workspace home: the setup checklist and the upcoming trips table.
import { t } from "@trips-app/i18n";

import { OrgButtonLink, OrgLink } from "../common/org-link";
import { isoDay, tripTitle } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { NO_VALUE, OrgBadge, OrgEmpty, OrgError, OrgLoading } from "../common/org-ui";

export interface SetupState {
  profile: boolean;
  accounting: boolean;
  /** CRM or a webhook endpoint is set up (optional step). */
  integrations: boolean;
}

interface SetupChecklistProps {
  setup: SetupState | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

function RequiredBadge({ done }: { done: boolean | undefined }) {
  if (done === undefined) return <span className="text-[var(--te-ink-muted)]">{NO_VALUE}</span>;
  return done ? (
    <OrgBadge tone="ok">{t("screen.organization.workspace.workspaceHomeParts.done")}</OrgBadge>
  ) : (
    <OrgBadge tone="warn">{t("screen.organization.workspace.workspaceHomeParts.toDo")}</OrgBadge>
  );
}

export function SetupChecklist({ setup, loading, error, onRetry }: SetupChecklistProps) {
  if (loading) return <OrgLoading rows={3} />;
  if (error) return <OrgError onRetry={onRetry} />;
  const items = [
    {
      id: "profile",
      label: t("screen.organization.workspace.workspaceHomeParts.profile"),
      badge: <RequiredBadge done={setup?.profile} />,
    },
    {
      id: "accounting",
      label: t("screen.organization.workspace.workspaceHomeParts.accountingAndInvoiceDetails"),
      badge: <RequiredBadge done={setup?.accounting} />,
    },
    {
      id: "integrations",
      label: t("screen.organization.workspace.workspaceHomeParts.crmAndWebhooks"),
      badge: setup?.integrations ? (
        <OrgBadge tone="ok">{t("screen.organization.workspace.workspaceHomeParts.done")}</OrgBadge>
      ) : (
        <OrgBadge tone="neu">
          {t("screen.organization.workspace.workspaceHomeParts.optional")}
        </OrgBadge>
      ),
    },
  ];
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-2">
          <span>{item.label}</span>
          {item.badge}
        </li>
      ))}
    </ul>
  );
}

/** The fields of an organization trip this table reads. */
export interface UpcomingTrip {
  id: string;
  titleEn: string;
  titleAr: string;
  startsAt: string | Date | null;
  origin?: { nameEn: string; nameAr: string } | null;
  vehicles: readonly unknown[];
  hasStaffingGap: boolean;
}

interface UpcomingTripsTableProps {
  trips: readonly UpcomingTrip[];
  locale: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

/** Departure time on the trip's clock (trips run on Cairo time). */
function departureTime(value: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Cairo",
  }).format(new Date(value));
}

function departs(trip: UpcomingTrip, locale: string): string {
  const date = isoDay(trip.startsAt);
  if (!date || !trip.startsAt) return NO_VALUE;
  const time = departureTime(trip.startsAt, locale);
  const place = trip.origin
    ? (locale === "ar" ? trip.origin.nameAr || trip.origin.nameEn : trip.origin.nameEn) || ""
    : "";
  return place
    ? t("screen.organization.workspace.workspaceHomeParts.departsFrom", { date, time, place })
    : t("screen.organization.workspace.workspaceHomeParts.departsAt", { date, time });
}

function columns(locale: string): readonly OrgColumn<UpcomingTrip>[] {
  return [
    {
      key: "trip",
      header: t("screen.organization.workspace.workspaceHomeParts.trip"),
      render: (trip) => (
        <OrgLink
          slug="trip-command-view"
          params={{ tripId: trip.id }}
          className="text-[var(--te-ink)]"
        >
          {tripTitle(trip, locale) || NO_VALUE}
        </OrgLink>
      ),
    },
    {
      key: "departs",
      header: t("screen.organization.workspace.workspaceHomeParts.departs"),
      render: (trip) => departs(trip, locale),
    },
    {
      key: "vehicles",
      header: t("screen.organization.workspace.workspaceHomeParts.vehicles"),
      render: (trip) => String(trip.vehicles.length),
    },
    {
      key: "readiness",
      header: t("screen.organization.workspace.workspaceHomeParts.readiness"),
      render: (trip) =>
        trip.hasStaffingGap ? (
          <OrgBadge tone="warn">
            {t("screen.organization.workspace.workspaceHomeParts.staffingGap")}
          </OrgBadge>
        ) : (
          <OrgBadge tone="ok">
            {t("screen.organization.workspace.workspaceHomeParts.ready")}
          </OrgBadge>
        ),
    },
  ];
}

export function UpcomingTripsTable({
  trips,
  locale,
  loading,
  error,
  onRetry,
}: UpcomingTripsTableProps) {
  if (error) return <OrgError onRetry={onRetry} />;
  return (
    <OrgTable
      columns={columns(locale)}
      rows={trips}
      rowKey={(trip) => trip.id}
      caption={t("screen.organization.workspace.workspaceHomeParts.upcomingTripsCaption")}
      loading={loading}
      empty={
        <OrgEmpty
          title={t("screen.organization.workspace.workspaceHomeParts.noUpcomingTrips")}
          action={
            <OrgButtonLink slug="trip-wizard-step-1-basics" variant="secondary">
              {t("screen.organization.workspace.workspaceHomeParts.createTrip")}
            </OrgButtonLink>
          }
        >
          {t("screen.organization.workspace.workspaceHomeParts.noUpcomingTripsBody")}
        </OrgEmpty>
      }
    />
  );
}
