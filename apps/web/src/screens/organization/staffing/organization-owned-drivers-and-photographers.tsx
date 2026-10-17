import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface StaffMemberRow {
  id: string;
  name: string;
  type: string;
  status: string;
  vehicles: string;
}

const STAFF_ROWS: readonly StaffMemberRow[] = [
  {
    id: "staff-1",
    name: "[Name]",
    type: "Driver",
    status: "Active",
    vehicles: "0",
  },
];

function buildColumns(onRemove: () => void): readonly TeDataTableColumn<StaffMemberRow>[] {
  return [
    { key: "name", header: "Name" },
    { key: "type", header: "Type" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StateBadge tone="success" icon="check" label={row.status} />,
    },
    { key: "vehicles", header: "Vehicle assignments", align: "end" },
    {
      key: "remove",
      header: "Remove",
      render: () => (
        <TeButton variant="ghost" size="default" onClick={onRemove}>
          Remove
        </TeButton>
      ),
    },
  ];
}

export function OrganizationOwnedDriversAndPhotographers() {
  const [removeOpen, setRemoveOpen] = useState(false);
  const columns = buildColumns(() => setRemoveOpen(true));

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "staffing-board", label: "Back to staffing board" }} />
        <TePageHeader
          title="Organization-owned drivers and photographers"
          actions={<TeButton>Add driver or photographer</TeButton>}
        />
        <TeInlineAlert tone="info">
          Organization-owned staff are visible only to your organization. They are accepted
          automatically when assigned to a trip.
        </TeInlineAlert>
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile label="Organization-owned staff" value="0" hint="Cap: [staff cap]" />
        </div>
        <OrgSection title="Staff">
          <TeDataTable
            columns={columns}
            rows={STAFF_ROWS}
            getRowKey={(row) => row.id}
            caption="Organization-owned drivers and photographers"
            emptyTitle="No organization-owned staff yet"
            emptyDescription="Add a driver or photographer to assign them to trips."
          />
        </OrgSection>
        <TeDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          title="Remove this staff member?"
          description="Future assignments are affected. Trips already assigned keep their history."
          primaryLabel="Remove"
          onPrimary={() => setRemoveOpen(false)}
          secondaryLabel="Keep"
          onSecondary={() => setRemoveOpen(false)}
          tone="danger"
        />
      </div>
    </StatePreview>
  );
}
