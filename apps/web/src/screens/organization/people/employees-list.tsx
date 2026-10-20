// SCR-ORG-34 Employees: who can open this dashboard, their status and their permission areas.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { OrgButtonLink, OrgLink } from "../common/org-link";
import { setSelectedEmployeeId } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgEmpty,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";

import { AreaBadges, grantedAreas, type PermissionArea } from "./people-parts";

type EmployeeStatus = "active" | "invited" | "suspended" | "revoked";

interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  status: EmployeeStatus;
  areas: readonly PermissionArea[];
}

function StatusBadge({ status }: { status: EmployeeStatus }) {
  switch (status) {
    case "active":
      return <OrgBadge tone="ok">{t("screen.organization.people.employeesList.active")}</OrgBadge>;
    case "invited":
      return (
        <OrgBadge tone="warn" icon="mail">
          {t("screen.organization.people.employeesList.invitationSent")}
        </OrgBadge>
      );
    case "suspended":
      return (
        <OrgBadge tone="warn">{t("screen.organization.people.employeesList.suspended")}</OrgBadge>
      );
    case "revoked":
      return (
        <OrgBadge tone="neu" icon="close">
          {t("screen.organization.people.employeesList.removed")}
        </OrgBadge>
      );
  }
}

function columns(
  onRemove: (row: EmployeeRow) => void,
  onResend: (row: EmployeeRow) => void,
): readonly OrgColumn<EmployeeRow>[] {
  return [
    {
      key: "name",
      header: t("screen.organization.people.employeesList.name"),
      render: (row) => (
        <OrgLink
          slug="employee-invitation-and-permissions"
          onClick={() => setSelectedEmployeeId(row.id)}
          className="text-[var(--te-ink)]"
        >
          {row.name}
        </OrgLink>
      ),
    },
    { key: "email", header: t("screen.organization.people.employeesList.email") },
    {
      key: "status",
      header: t("screen.organization.people.employeesList.status"),
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "areas",
      header: t("screen.organization.people.employeesList.permissionAreas"),
      render: (row) => (
        <AreaBadges
          areas={row.areas}
          emptyLabel={t("screen.organization.people.employeesList.none")}
        />
      ),
    },
    {
      key: "action",
      header: t("screen.organization.people.employeesList.action"),
      render: (row) =>
        row.status === "revoked" ? (
          NO_VALUE
        ) : (
          <span className="flex flex-wrap gap-1">
            {row.status === "invited" ? (
              <OrgButton
                variant="text"
                aria-label={t("screen.organization.people.employeesList.resendInviteTo", {
                  name: row.name,
                })}
                onClick={() => onResend(row)}
              >
                {t("screen.organization.people.employeesList.resendInvite")}
              </OrgButton>
            ) : null}
            <OrgButton
              variant="text"
              aria-label={t("screen.organization.people.employeesList.removeName", {
                name: row.name,
              })}
              onClick={() => onRemove(row)}
            >
              {t("screen.organization.people.employeesList.remove")}
            </OrgButton>
          </span>
        ),
    },
  ];
}

export function EmployeesList() {
  const queryClient = useQueryClient();
  const { status: authStatus, actor } = useAuth();
  const [removeTarget, setRemoveTarget] = useState<EmployeeRow | null>(null);

  const employeesQuery = useQuery(
    serverQueryOptions(orpc.employees.list, "employees/list", {
      input: {},
      enabled: authStatus === "authenticated" && Boolean(actor?.activeTenantId),
    }),
  );

  const updateStatusMutation = useMutation(
    serverMutationOptions(orpc.employees.updateStatus, "employees/updateStatus", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.employees.key() });
      },
    }),
  );

  const resendMutation = useMutation(
    serverMutationOptions(orpc.employees.resendInvite, "employees/resendInvite", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.employees.key() });
      },
    }),
  );

  const rows: readonly EmployeeRow[] =
    employeesQuery.data?.employees.map((employee) => ({
      id: employee.id,
      name: employee.fullName ?? employee.roleTitle,
      email: employee.invitedEmail,
      status: employee.status,
      areas: grantedAreas(employee.permissions),
    })) ?? [];

  const quota = employeesQuery.data?.quota;
  const quotaValue = !quota
    ? NO_VALUE
    : quota.maxAllowed === null
      ? String(quota.usedCount)
      : t("screen.organization.people.employeesList.nOfLimit", {
          n: quota.usedCount,
          limit: quota.maxAllowed,
        });
  const waiting = employeesQuery.isSuccess
    ? String(rows.filter((row) => row.status === "invited").length)
    : NO_VALUE;

  function handleConfirmRemove() {
    const target = removeTarget;
    setRemoveTarget(null);
    if (!target || authStatus !== "authenticated") return;
    updateStatusMutation.mutate({
      membershipId: target.id,
      status: "revoked",
      reason: "Removed from organization people directory",
    });
  }

  const inviteLink = (
    <OrgButtonLink
      slug="employee-invitation-and-permissions"
      onClick={() => setSelectedEmployeeId(null)}
    >
      {t("screen.organization.people.employeesList.inviteEmployee")}
    </OrgButtonLink>
  );

  return (
    <OrgPage className="gap-5">
      <OrgPageHeader
        title={t("screen.organization.people.employeesList.title")}
        caption={t("screen.organization.people.employeesList.caption")}
        actions={inviteLink}
      />
      <OrgKpiRow>
        <OrgKpi
          label={t("screen.organization.people.employeesList.employeesOnYourPlan")}
          value={quotaValue}
        />
        <OrgKpi
          label={t("screen.organization.people.employeesList.invitationsWaiting")}
          value={waiting}
        />
      </OrgKpiRow>
      {resendMutation.isSuccess ? (
        <OrgAlert tone="ok" title={t("screen.organization.people.employeesList.inviteResentTitle")}>
          {t("screen.organization.people.employeesList.inviteResentBody")}
        </OrgAlert>
      ) : null}
      {resendMutation.isError ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.people.employeesList.inviteNotResentTitle")}
        >
          {t("screen.organization.people.employeesList.inviteNotResentBody")}
        </OrgAlert>
      ) : null}
      {updateStatusMutation.isError ? (
        <OrgAlert tone="err" title={t("screen.organization.people.employeesList.notRemovedTitle")}>
          {t("screen.organization.people.employeesList.notRemovedBody")}
        </OrgAlert>
      ) : null}
      {employeesQuery.isError ? (
        <OrgError onRetry={() => void employeesQuery.refetch()} />
      ) : (
        <OrgTable
          columns={columns(setRemoveTarget, (row) =>
            resendMutation.mutate({ membershipId: row.id }),
          )}
          rows={rows}
          rowKey={(row) => row.id}
          caption={t("screen.organization.people.employeesList.title")}
          loading={employeesQuery.isLoading}
          empty={
            <OrgEmpty title={t("screen.organization.people.employeesList.emptyTitle")}>
              {t("screen.organization.people.employeesList.emptyBody")}
            </OrgEmpty>
          }
        />
      )}
      <p className="te-caption m-0 text-[var(--te-ink-muted)]">
        {t("screen.organization.people.employeesList.removalNote")}
      </p>
      <TeDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title={t("screen.organization.people.employeesList.removeThisEmployee")}
        description={t("screen.organization.people.employeesList.removalNote")}
        primaryLabel={t("screen.organization.people.employeesList.removeEmployee")}
        onPrimary={handleConfirmRemove}
        secondaryLabel={t("screen.organization.people.employeesList.keepEmployee")}
        onSecondary={() => setRemoveTarget(null)}
        tone="danger"
      />
    </OrgPage>
  );
}
