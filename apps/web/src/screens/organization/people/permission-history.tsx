// Change history of one employee (SCR-ORG-35): who changed what, and when. Read only.
import type { ReactNode } from "react";

import { t } from "@trips-app/i18n";

import { OrgTable, type OrgColumn } from "../common/org-table";
import { NO_VALUE, OrgBadge, OrgEmpty } from "../common/org-ui";

import { AreaBadges, grantedAreas } from "./people-parts";

/** An audit entry as `employees.getById` returns it. */
export interface PermissionAuditEntry {
  id: string;
  actorRole: string;
  action: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  createdAt: string;
}

function whenLabel(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return NO_VALUE;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Cairo",
  }).format(date);
}

function whoLabel(role: string): string {
  if (role === "organization_owner") return t("screen.organization.people.permissionHistory.owner");
  if (role === "organization_employee")
    return t("screen.organization.people.permissionHistory.employee");
  if (role === "admin") return t("screen.organization.people.permissionHistory.platformAdmin");
  return role || NO_VALUE;
}

function changeLabel(action: string): string {
  if (action === "employee.invited")
    return t("screen.organization.people.permissionHistory.invitationSent");
  if (action === "employee.invite_resent")
    return t("screen.organization.people.permissionHistory.invitationResent");
  if (action === "employee.invite_accepted")
    return t("screen.organization.people.permissionHistory.invitationAccepted");
  if (action === "employee.permissions_updated")
    return t("screen.organization.people.permissionHistory.permissionsChanged");
  if (action.startsWith("employee.status."))
    return t("screen.organization.people.permissionHistory.statusChanged");
  return action;
}

function statusLabel(status: string): string {
  if (status === "active") return t("screen.organization.people.permissionHistory.statusActive");
  if (status === "invited") return t("screen.organization.people.permissionHistory.statusInvited");
  if (status === "suspended")
    return t("screen.organization.people.permissionHistory.statusSuspended");
  if (status === "revoked") return t("screen.organization.people.permissionHistory.statusRemoved");
  return status;
}

function StateCell({ state }: { state: Record<string, unknown> | null }): ReactNode {
  const none = t("screen.organization.people.permissionHistory.none");
  if (!state) return none;
  const permissions = state.permissions;
  if (permissions && typeof permissions === "object") {
    return (
      <AreaBadges areas={grantedAreas(permissions as Record<string, string>)} emptyLabel={none} />
    );
  }
  if (typeof state.status === "string") {
    return (
      <OrgBadge tone="neu" icon={false}>
        {statusLabel(state.status)}
      </OrgBadge>
    );
  }
  return none;
}

function columns(locale: string): readonly OrgColumn<PermissionAuditEntry>[] {
  return [
    {
      key: "when",
      header: t("screen.organization.people.permissionHistory.when"),
      render: (entry) => whenLabel(entry.createdAt, locale),
      className: "whitespace-nowrap",
    },
    {
      key: "who",
      header: t("screen.organization.people.permissionHistory.who"),
      render: (entry) => whoLabel(entry.actorRole),
    },
    {
      key: "change",
      header: t("screen.organization.people.permissionHistory.change"),
      render: (entry) => changeLabel(entry.action),
    },
    {
      key: "before",
      header: t("screen.organization.people.permissionHistory.before"),
      render: (entry) => <StateCell state={entry.beforeState} />,
    },
    {
      key: "after",
      header: t("screen.organization.people.permissionHistory.after"),
      render: (entry) => <StateCell state={entry.afterState} />,
    },
  ];
}

interface PermissionHistoryProps {
  entries: readonly PermissionAuditEntry[];
  locale: string;
  loading: boolean;
}

export function PermissionHistory({ entries, locale, loading }: PermissionHistoryProps) {
  return (
    <OrgTable
      columns={columns(locale)}
      rows={entries}
      rowKey={(entry) => entry.id}
      caption={t("screen.organization.people.permissionHistory.caption")}
      loading={loading}
      empty={
        <OrgEmpty title={t("screen.organization.people.permissionHistory.emptyTitle")}>
          {t("screen.organization.people.permissionHistory.emptyBody")}
        </OrgEmpty>
      }
    />
  );
}
