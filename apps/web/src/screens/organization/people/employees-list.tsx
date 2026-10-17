import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";

import { OrgButtonLink, OrgLink, WorkspaceBackLink } from "../common/org-link";
import { StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

type EmployeeStatus = "active" | "invited";

interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  status: EmployeeStatus;
  permissions: string;
}

const EMPLOYEE_ROWS: readonly EmployeeRow[] = [
  {
    id: "employee-1",
    name: "[Employee name]",
    email: "[Email]",
    status: "active",
    permissions: "[Permission areas]",
  },
  {
    id: "employee-2",
    name: "[Employee name]",
    email: "[Email]",
    status: "invited",
    permissions: "[Permission areas]",
  },
];

function buildColumns(onRemove: () => void): readonly TeDataTableColumn<EmployeeRow>[] {
  return [
    {
      key: "name",
      header: "Name",
      render: (row) => <OrgLink slug="employee-invitation-and-permissions">{row.name}</OrgLink>,
    },
    { key: "email", header: "Email" },
    {
      key: "status",
      header: "Status",
      render: (row) =>
        row.status === "active" ? (
          <StateBadge tone="success" icon="check" label="Active" />
        ) : (
          <StateBadge tone="info" icon="clock" label="Invited" />
        ),
    },
    { key: "permissions", header: "Permission areas" },
    {
      key: "remove",
      header: "Remove",
      align: "end",
      render: () => (
        <TeButton variant="ghost" size="default" onClick={onRemove}>
          Remove
        </TeButton>
      ),
    },
  ];
}

export function EmployeesList() {
  const [query, setQuery] = useState("");
  const [removeOpen, setRemoveOpen] = useState(false);
  const columns = buildColumns(() => setRemoveOpen(true));

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = EMPLOYEE_ROWS.filter(
    (row) =>
      row.name.toLowerCase().includes(normalizedQuery) ||
      row.email.toLowerCase().includes(normalizedQuery),
  );

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title="Employees list"
          actions={
            <OrgButtonLink slug="employee-invitation-and-permissions">
              Invite employee
            </OrgButtonLink>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile label="Employees" value="0 of 20" hint="Growth plan limit" />
        </div>
        <TeSearchField
          label="Search employees"
          value={query}
          onValueChange={setQuery}
          clearLabel="Clear search"
        />
        <TeDataTable
          columns={columns}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption="Employees"
          emptyTitle="No employees yet"
          emptyDescription="Invite employees and give them the permission areas they need."
        />
        <TeDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          title="Remove this employee?"
          description="Access ends at once. Past audit entries are kept."
          primaryLabel="Remove employee"
          onPrimary={() => setRemoveOpen(false)}
          secondaryLabel="Keep employee"
          onSecondary={() => setRemoveOpen(false)}
          tone="danger"
        />
      </div>
    </StatePreview>
  );
}
