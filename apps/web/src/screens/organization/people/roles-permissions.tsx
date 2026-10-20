// SCR-ORG-64 Roles and permissions: the access matrix of the design, drawn from real data — the
// organization's employees and their nine permission areas. A cell is that employee's live level
// and editing it calls `employees.updatePermissions`; templates have no procedure and are not
// invented.
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { OrgButtonLink } from "../common/org-link";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";
import {
  PERMISSION_AREAS,
  permissionAreaLabel,
  type PermissionArea,
  type PermissionLevel,
  type PermissionMatrix,
} from "../people/people-parts";

const K = "screen.organization.people.rolesPermissions";
const MATRIX_COLUMNS = 5;

interface EmployeeRecord {
  id: string;
  name: string;
  roleTitle: string;
  permissions: PermissionMatrix;
}

const FULL_NONE = Object.fromEntries(
  PERMISSION_AREAS.map((area) => [area, "none"]),
) as PermissionMatrix;

export function RolesPermissions(): ReactNode {
  const queryClient = useQueryClient();
  const { status: authStatus, actor } = useAuth();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const employeesQuery = useQuery({
    ...serverQueryOptions(orpc.employees.list, "employees/list", { input: {}, enabled }),
  });
  const updateMutation = useMutation(
    serverMutationOptions(orpc.employees.updatePermissions, "employees/updatePermissions", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.employees.key() });
      },
    }),
  );

  const employees: readonly EmployeeRecord[] = (employeesQuery.data?.employees ?? [])
    .filter((employee) => employee.status === "active")
    .slice(0, MATRIX_COLUMNS)
    .map((employee) => ({
      id: employee.id,
      name: employee.fullName ?? employee.roleTitle,
      roleTitle: employee.roleTitle,
      permissions: employee.permissions ?? FULL_NONE,
    }));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = employees.find((employee) => employee.id === selectedId) ?? employees[0] ?? null;
  const loaded = employeesQuery.isSuccess;
  const busy = updateMutation.isPending;

  function setLevel(area: PermissionArea, level: PermissionLevel) {
    if (!selected) return;
    updateMutation.mutate({
      membershipId: selected.id,
      roleTitle: selected.roleTitle,
      permissions: { ...selected.permissions, [area]: level },
    });
  }

  const changeColumns: readonly OrgColumn<PermissionArea>[] = PERMISSION_AREAS.map((area) => ({
    key: area,
    header: permissionAreaLabel(area),
    render: (row) =>
      selected ? (
        <select
          aria-label={`${selected.name}: ${permissionAreaLabel(row)}`}
          className="min-h-9 w-full max-w-[140px] rounded-lg border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-2 py-1 text-sm"
          value={selected.permissions[row] ?? "none"}
          disabled={busy}
          onChange={(change) => setLevel(row, change.target.value as PermissionLevel)}
        >
          <option value="none">{t(`${K}.levelNone`)}</option>
          <option value="view">{t(`${K}.levelView`)}</option>
          <option value="manage">{t(`${K}.levelManage`)}</option>
        </select>
      ) : (
        NO_VALUE
      ),
  }));

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        actions={
          <OrgButtonLink slug="employee-invitation-and-permissions" variant="secondary">
            {t(`${K}.inviteEmployee`)}
          </OrgButtonLink>
        }
      />
      {updateMutation.isError ? (
        <OrgAlert tone="err" title={t(`${K}.saveFailedTitle`)}>
          {t(`${K}.saveFailedBody`)}
        </OrgAlert>
      ) : null}
      {employeesQuery.isError ? <OrgError onRetry={() => void employeesQuery.refetch()} /> : null}
      <OrgCard title={t(`${K}.accessByEmployee`)}>
        <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.matrixIntro`)}</p>
        {employeesQuery.isLoading ? (
          <OrgLoading rows={8} />
        ) : (
          <OrgTable
            columns={changeColumns}
            rows={[...PERMISSION_AREAS]}
            rowKey={(area) => area}
            caption={t(`${K}.accessByEmployee`)}
            empty={<OrgEmptyState />}
          />
        )}
        {loaded && employees.length > MATRIX_COLUMNS ? (
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t(`${K}.showingFirst`, {
              n: MATRIX_COLUMNS,
              total: employeesQuery.data?.employees.length ?? 0,
            })}
          </p>
        ) : null}
      </OrgCard>
      <OrgCard title={t(`${K}.employeesInMatrix`)}>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {employees.map((employee) => (
            <li key={employee.id}>
              <OrgButton
                variant={selected?.id === employee.id ? "primary" : "secondary"}
                onClick={() => setSelectedId(employee.id)}
              >
                {employee.name || employee.roleTitle}
              </OrgButton>
            </li>
          ))}
        </ul>
        {selected ? (
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t(`${K}.editingLine`, { name: selected.name || selected.roleTitle })}
          </p>
        ) : null}
      </OrgCard>
      <OrgCard title={t(`${K}.roleTemplates`)}>
        <OrgAlert tone="info" title={t(`${K}.templatesUnavailableTitle`)}>
          {t(`${K}.templatesUnavailableBody`)}
        </OrgAlert>
      </OrgCard>
    </OrgPage>
  );
}

function OrgEmptyState(): ReactNode {
  return (
    <OrgAlert tone="info" title={t(`${K}.noEmployeesTitle`)}>
      {t(`${K}.noEmployeesBody`)}
    </OrgAlert>
  );
}
