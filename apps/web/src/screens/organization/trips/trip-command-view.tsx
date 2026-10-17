import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import type { OrgSlug } from "../common/org-routes";
import {
  OrgSection,
  StateBadge,
  TRIP_STATES,
  TripStateBadge,
  type TripState,
} from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const CURRENT_STATE: TripState = "Published";

interface VehicleGapRow {
  id: string;
  vehicle: string;
  driver: string;
  moderator: string;
  openDeal: string;
}

interface SectionLink {
  slug: OrgSlug;
  label: string;
}

const GAP_ROWS: readonly VehicleGapRow[] = [
  {
    id: "vehicle-1",
    vehicle: "[Vehicle plate]",
    driver: "Missing",
    moderator: "Missing",
    openDeal: "None",
  },
];

const GAP_COLUMNS: readonly TeDataTableColumn<VehicleGapRow>[] = [
  { key: "vehicle", header: "Vehicle" },
  {
    key: "driver",
    header: "Driver",
    render: (row) =>
      row.driver === "Missing" ? (
        <StateBadge tone="danger" icon="alert" label="Missing" />
      ) : (
        <StateBadge tone="success" icon="check" label="Assigned" />
      ),
  },
  {
    key: "moderator",
    header: "Moderator",
    render: (row) =>
      row.moderator === "Missing" ? (
        <StateBadge tone="danger" icon="alert" label="Missing" />
      ) : (
        <StateBadge tone="success" icon="check" label="Assigned" />
      ),
  },
  { key: "openDeal", header: "Open deal" },
];

const SECTION_LINKS: readonly SectionLink[] = [
  { slug: "staffing-board", label: "Staffing" },
  { slug: "seat-map-and-seat-assignment", label: "Seat map" },
  { slug: "bookings-and-travelers", label: "Bookings" },
  { slug: "program-editor", label: "Programs" },
  { slug: "program-enrollment-report", label: "Enrollment report" },
  { slug: "live-operations", label: "Live operations" },
  { slug: "trip-accounting", label: "Accounting" },
  { slug: "trip-report-review", label: "Trip reports" },
];

export function TripCommandView() {
  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink />
        <TePageHeader
          title="Trip command view"
          description="[Trip name]"
          actions={
            <OrgButtonLink slug="cancel-trip-decision" variant="ghost">
              Cancel trip
            </OrgButtonLink>
          }
        />
        <OrgSection title="Lifecycle">
          <ol className="flex flex-wrap gap-2">
            {TRIP_STATES.map((state) => (
              <li key={state} aria-current={state === CURRENT_STATE ? "step" : undefined}>
                <TripStateBadge state={state} />
              </li>
            ))}
          </ol>
        </OrgSection>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TeKpiTile label="Seats sold" value="0" />
          <TeKpiTile label="Seats held" value="0" />
          <TeKpiTile label="Seats reserved" value="0" />
          <TeKpiTile label="Occupancy" value="0%" />
        </div>
        <OrgSection title="Ready gaps">
          <TeDataTable
            columns={GAP_COLUMNS}
            rows={GAP_ROWS}
            getRowKey={(row) => row.id}
            caption="Ready gaps per vehicle"
            emptyTitle="No gaps"
            emptyDescription="Every vehicle has a driver and a moderator."
          />
        </OrgSection>
        <OrgSection title="Go to">
          <ul className="flex flex-wrap gap-2">
            {SECTION_LINKS.map((link) => (
              <li key={link.slug}>
                <OrgButtonLink slug={link.slug} variant="secondary">
                  {link.label}
                </OrgButtonLink>
              </li>
            ))}
          </ul>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
