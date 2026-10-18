import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, OrgLink, WorkspaceBackLink } from "../common/org-link";
import { setSelectedEmployeeId, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

type EmployeeStatus = "active" | "invited" | "suspended" | "revoked";

interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  status: EmployeeStatus;
  permissions: string;
}

function summarizePermissions(permissions: Record<string, string>): string {
  const granted = Object.entries(permissions)
    .filter(([, level]) => level && level !== "none")
    .map(([area, level]) => `${area} (${level})`);
  return granted.length > 0 ? granted.join(", ") : "None";
}

function buildColumns(
  onRemove: (row: EmployeeRow) => void,
): readonly TeDataTableColumn<EmployeeRow>[] {
  return [
    {
      key: "name",
      header: t("screen.organization.people.employeesList.name"),
      render: (row) => (
        <OrgLink
          slug="employee-invitation-and-permissions"
          onClick={() => setSelectedEmployeeId(row.id)}
        >
          {row.name}
        </OrgLink>
      ),
    },
    { key: "email", header: t("screen.organization.people.employeesList.email") },
    {
      key: "status",
      header: t("screen.organization.people.employeesList.status"),
      render: (row) =>
        row.status === "active" ? (
          <StateBadge
            tone="success"
            icon="check"
            label={t("screen.organization.people.employeesList.active")}
          />
        ) : row.status === "invited" ? (
          <StateBadge
            tone="info"
            icon="clock"
            label={t("screen.organization.people.employeesList.invited")}
          />
        ) : (
          <StateBadge tone="warning" icon="alert" label={row.status} />
        ),
    },
    { key: "permissions", header: t("screen.organization.people.employeesList.permissionAreas") },
    {
      key: "remove",
      header: t("screen.organization.people.employeesList.remove"),
      align: "end",
      render: (row) => (
        <TeButton variant="ghost" size="default" onClick={() => onRemove(row)}>
          {t("screen.organization.people.employeesList.remove2")}
        </TeButton>
      ),
    },
  ];
}

export function EmployeesList() {
  const queryClient = useQueryClient();
  const { status: authStatus, actor } = useAuth();
  const [query, setQuery] = useState("");
  const [removeTarget, setRemoveTarget] = useState<EmployeeRow | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const employeesQuery = useQuery(
    orpc.employees.list.queryOptions({
      input: {},
      enabled: authStatus === "authenticated" && Boolean(actor?.activeTenantId),
    }),
  );

  const updateStatusMutation = useMutation(
    orpc.employees.updateStatus.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.employees.key() });
      },
    }),
  );

  const rows = useMemo<readonly EmployeeRow[]>(() => {
    if (!employeesQuery.data?.employees) return [];
    return employeesQuery.data.employees.map((emp) => ({
      id: emp.id,
      name: emp.fullName ?? emp.roleTitle,
      email: emp.invitedEmail,
      status: emp.status,
      permissions: summarizePermissions(emp.permissions),
    }));
  }, [employeesQuery.data?.employees]);

  const { quotaLabel, quotaHint } = useMemo(() => {
    const q = employeesQuery.data?.quota;
    if (!q) return { quotaLabel: "0 of 20", quotaHint: "Growth plan limit" };
    const maxStr = q.maxAllowed !== null ? String(q.maxAllowed) : "Unlimited";
    return {
      quotaLabel: `${q.usedCount} of ${maxStr}`,
      quotaHint: `${q.planTier} plan limit`,
    };
  }, [employeesQuery.data?.quota]);

  async function handleConfirmRemove() {
    const target = removeTarget;
    setRemoveTarget(null);
    if (!target) return;
    if (authStatus === "authenticated" && !target.id.startsWith("employee-")) {
      try {
        await updateStatusMutation.mutateAsync({
          membershipId: target.id,
          status: "revoked",
          reason: "Removed from organization people directory",
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not remove employee.");
      }
    }
  }

  const columns = buildColumns((row) => setRemoveTarget(row));
  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter(
    (row) =>
      row.name.toLowerCase().includes(normalizedQuery) ||
      row.email.toLowerCase().includes(normalizedQuery),
  );

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title={t("screen.organization.people.employeesList.employeesList")}
          actions={
            <OrgButtonLink slug="employee-invitation-and-permissions">
              {t("screen.organization.people.employeesList.inviteEmployee")}
            </OrgButtonLink>
          }
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile
            label={t("screen.organization.people.employeesList.employees")}
            value={quotaLabel}
            hint={quotaHint}
          />
        </div>
        <TeSearchField
          label={t("screen.organization.people.employeesList.searchEmployees")}
          value={query}
          onValueChange={setQuery}
          clearLabel={t("screen.organization.people.employeesList.clearSearch")}
        />
        <TeDataTable
          columns={columns}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption={t("screen.organization.people.employeesList.employeesCaption")}
          emptyTitle={t("screen.organization.people.employeesList.noEmployeesYet")}
          emptyDescription={t(
            "screen.organization.people.employeesList.inviteEmployeesAndGiveThem",
          )}
        />
        <TeDialog
          open={removeTarget !== null}
          onOpenChange={(open) => {
            if (!open) setRemoveTarget(null);
          }}
          title={t("screen.organization.people.employeesList.removeThisEmployee")}
          description={t("screen.organization.people.employeesList.accessEndsAtOncePast")}
          primaryLabel={t("screen.organization.people.employeesList.removeEmployee")}
          onPrimary={() => void handleConfirmRemove()}
          secondaryLabel={t("screen.organization.people.employeesList.keepEmployee")}
          onSecondary={() => setRemoveTarget(null)}
          tone="danger"
        />
      </div>
    </StatePreview>
  );
}
