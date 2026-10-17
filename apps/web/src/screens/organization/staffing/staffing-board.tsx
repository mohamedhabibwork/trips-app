import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import type { OrgSlug } from "../common/org-routes";
import { StateBadge, type StatePresentation } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

type StaffingState = "organization" | "accepted" | "negotiating" | "finalized" | "missing";

interface StaffingRow {
  id: string;
  vehicle: string;
  driver: StaffingState;
  moderator: StaffingState;
  photographer: StaffingState;
}

const STAFFING_PRESENTATION: Record<StaffingState, StatePresentation> = {
  organization: { tone: "neutral", icon: "user", label: "Organization-owned" },
  accepted: { tone: "success", icon: "check", label: "Accepted" },
  negotiating: { tone: "warning", icon: "refresh", label: "Platform negotiating" },
  finalized: { tone: "success", icon: "check", label: "Platform finalized" },
  missing: { tone: "danger", icon: "alert", label: "Missing" },
};

const DEAL_STATES: readonly StaffingState[] = ["negotiating", "finalized"];

function StaffingCell({ state }: { state: StaffingState }) {
  return <StateBadge {...STAFFING_PRESENTATION[state]} />;
}

/** Row action: a platform deal opens the negotiation, org-owned staff opens their list, gaps open supplier search. */
function manageSlugFor(row: StaffingRow): OrgSlug {
  if (DEAL_STATES.includes(row.driver) || DEAL_STATES.includes(row.photographer)) {
    return "deal-detail-and-negotiation";
  }
  if (row.driver === "organization") {
    return "organization-owned-drivers-and-photographers";
  }
  return "platform-supplier-search-and-deal-start";
}

const STAFFING_ROWS: readonly StaffingRow[] = [
  {
    id: "vehicle-1",
    vehicle: "[Vehicle plate]",
    driver: "missing",
    moderator: "missing",
    photographer: "negotiating",
  },
];

const COLUMNS: readonly TeDataTableColumn<StaffingRow>[] = [
  { key: "vehicle", header: "Vehicle" },
  { key: "driver", header: "Driver", render: (row) => <StaffingCell state={row.driver} /> },
  {
    key: "moderator",
    header: "Moderator",
    render: (row) => <StaffingCell state={row.moderator} />,
  },
  {
    key: "photographer",
    header: "Photographer",
    render: (row) => <StaffingCell state={row.photographer} />,
  },
  {
    key: "actions",
    header: "Actions",
    align: "end",
    render: (row) => (
      <OrgButtonLink slug={manageSlugFor(row)} variant="ghost">
        Manage
      </OrgButtonLink>
    ),
  },
];

export function StaffingBoard() {
  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink parent={{ slug: "trip-command-view", label: "Back to trip" }} />
        <TePageHeader
          title="Staffing board"
          description="[Trip name]"
          actions={
            <div className="flex flex-wrap gap-3">
              <OrgButtonLink slug="organization-owned-drivers-and-photographers" variant="ghost">
                Organization-owned staff
              </OrgButtonLink>
              <OrgButtonLink slug="platform-supplier-search-and-deal-start" variant="secondary">
                Find platform supplier
              </OrgButtonLink>
            </div>
          }
        />
        <TeInlineAlert tone="warning" title="Ready is blocked">
          Every vehicle needs a driver and a moderator before the trip can be Ready.
        </TeInlineAlert>
        <TeDataTable
          columns={COLUMNS}
          rows={STAFFING_ROWS}
          getRowKey={(row) => row.id}
          caption="Staffing for each vehicle"
          emptyTitle="No vehicles on this trip"
          emptyDescription="Add vehicles to the trip to assign staff."
        />
      </div>
    </StatePreview>
  );
}
