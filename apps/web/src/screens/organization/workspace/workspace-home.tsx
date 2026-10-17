import { TeCard } from "@trips-app/ui/components/te-card";
import { TeChecklist, type TeChecklistItem } from "@trips-app/ui/components/te-checklist";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TeNotificationItem } from "@trips-app/ui/components/te-notification-item";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { OrganizationNav } from "../common/organization-nav";
import { OrgButtonLink, OrgLink } from "../common/org-link";
import type { OrgSlug } from "../common/org-routes";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface UpcomingTripRow {
  id: string;
  trip: string;
  dates: string;
  readyGaps: string;
}

interface AreaLink {
  slug: OrgSlug;
  label: string;
}

const SETUP_ITEMS: readonly TeChecklistItem[] = [
  { id: "profile", label: "Organization profile", checked: false },
  { id: "accounting", label: "Accounting and invoice details", checked: false },
  { id: "crm", label: "CRM connection (optional)", checked: false },
  { id: "webhooks", label: "Webhooks (optional)", checked: false },
];

const UPCOMING_COLUMNS: readonly TeDataTableColumn<UpcomingTripRow>[] = [
  {
    key: "trip",
    header: "Trip",
    render: (row) => <OrgLink slug="trip-command-view">{row.trip}</OrgLink>,
  },
  { key: "dates", header: "Dates" },
  { key: "readyGaps", header: "Ready gaps", align: "end" },
];

const UPCOMING_ROWS: readonly UpcomingTripRow[] = [
  { id: "upcoming-1", trip: "[Trip name]", dates: "[Dates]", readyGaps: "0" },
];

const MORE_AREAS: readonly AreaLink[] = [
  { slug: "vehicle-registry", label: "Vehicle registry" },
  { slug: "crm-and-webhooks", label: "CRM and webhooks" },
  { slug: "child-safety-reports", label: "Child-safety reports" },
];

export function WorkspaceHome() {
  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <OrganizationNav currentSlug="workspace-home" />
        <TePageHeader
          title="Workspace home"
          description="Your organization's status and the next step."
          actions={<OrgButtonLink slug="trip-wizard-step-1-basics">Create trip</OrgButtonLink>}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TeKpiTile label="Active trips this month" value="0" hint="Monthly limit: [plan limit]" />
          <TeKpiTile label="Upcoming trips" value="0" />
          <TeKpiTile label="Trips with Ready gaps" value="0" />
        </div>
        <OrgSection title="Alerts">
          <TeNotificationItem
            title="[Trip name]: changes requested"
            body="Review the requested changes and reply."
            time="[Time]"
            unread
          />
          <TeNotificationItem
            title="Pending deal request"
            body="[Vehicle or slot]: a platform supplier is waiting for a reply."
            time="[Time]"
            unread
          />
        </OrgSection>
        <OrgSection title="Upcoming trips">
          <TeDataTable
            columns={UPCOMING_COLUMNS}
            rows={UPCOMING_ROWS}
            getRowKey={(row) => row.id}
            caption="Upcoming trips"
            emptyTitle="No upcoming trips"
            emptyDescription="Create a trip to see it here."
          />
        </OrgSection>
        <OrgSection title="More areas">
          <ul className="flex flex-wrap gap-2">
            {MORE_AREAS.map((area) => (
              <li key={area.slug}>
                <OrgButtonLink slug={area.slug} variant="secondary">
                  {area.label}
                </OrgButtonLink>
              </li>
            ))}
          </ul>
        </OrgSection>
        <OrgSection title="Setup checklist">
          <TeCard>
            <TeChecklist items={SETUP_ITEMS} ariaLabel="Setup checklist" />
          </TeCard>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
