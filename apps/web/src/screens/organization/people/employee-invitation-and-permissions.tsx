import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeCheckbox } from "@trips-app/ui/components/te-checkbox";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { getSelectedEmployeeId, OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const AREA_IDS = [
  "trips",
  "bookings",
  "accounting",
  "coupons",
  "employees",
  "fleet",
  "subscription",
] as const;

type AreaId = (typeof AREA_IDS)[number];

const AREA_LABELS: Record<AreaId, string> = {
  get trips() {
    return t("screen.organization.people.employeeInvitationAndPermissions.labels.trips");
  },
  get bookings() {
    return t("screen.organization.people.employeeInvitationAndPermissions.labels.bookings");
  },
  get accounting() {
    return t("screen.organization.people.employeeInvitationAndPermissions.labels.accounting");
  },
  get coupons() {
    return t("screen.organization.people.employeeInvitationAndPermissions.labels.coupons");
  },
  get employees() {
    return t("screen.organization.people.employeeInvitationAndPermissions.labels.employees");
  },
  get fleet() {
    return t("screen.organization.people.employeeInvitationAndPermissions.labels.fleet");
  },
  get subscription() {
    return t("screen.organization.people.employeeInvitationAndPermissions.labels.subscription");
  },
};

const INITIAL_AREAS: Record<AreaId, boolean> = {
  trips: false,
  bookings: false,
  accounting: false,
  coupons: false,
  employees: false,
  fleet: false,
  subscription: false,
};

interface ChangeRow {
  id: string;
  actor: string;
  time: string;
  before: string;
  after: string;
}

const CHANGE_COLUMNS = (): readonly TeDataTableColumn<ChangeRow>[] => [
  {
    key: "actor",
    header: t("screen.organization.people.employeeInvitationAndPermissions.changedBy"),
  },
  { key: "time", header: t("screen.organization.people.employeeInvitationAndPermissions.when") },
  {
    key: "before",
    header: t("screen.organization.people.employeeInvitationAndPermissions.before"),
  },
  { key: "after", header: t("screen.organization.people.employeeInvitationAndPermissions.after") },
];

type PermissionLevel = "none" | "view" | "manage";

function toMatrix(areas: Record<AreaId, boolean>): {
  trips: PermissionLevel;
  bookings: PermissionLevel;
  accounting: PermissionLevel;
  coupons: PermissionLevel;
  employees: PermissionLevel;
  fleet: PermissionLevel;
  subscription: PermissionLevel;
  tracking: PermissionLevel;
  settings: PermissionLevel;
} {
  return {
    trips: areas.trips ? "manage" : "none",
    bookings: areas.bookings ? "manage" : "none",
    accounting: areas.accounting ? "manage" : "none",
    coupons: areas.coupons ? "manage" : "none",
    employees: areas.employees ? "manage" : "none",
    fleet: areas.fleet ? "manage" : "none",
    subscription: areas.subscription ? "manage" : "none",
    tracking: areas.trips ? "manage" : "none",
    settings: "none",
  };
}

export function EmployeeInvitationAndPermissions() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus, actor } = useAuth();
  const [email, setEmail] = useState("");
  const [roleTitle, setRoleTitle] = useState("Operations Coordinator");
  const [areas, setAreas] = useState(INITIAL_AREAS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const preferredId = getSelectedEmployeeId();
  const employeesListQuery = useQuery(
    orpc.employees.list.queryOptions({
      input: {},
      enabled: authStatus === "authenticated" && Boolean(actor?.activeTenantId),
    }),
  );

  const target = useMemo(() => {
    const list = employeesListQuery.data?.employees ?? [];
    return (preferredId ? list.find((emp) => emp.id === preferredId) : undefined) ?? list[0];
  }, [employeesListQuery.data?.employees, preferredId]);

  const targetMembershipId = target?.id ?? null;

  const employeeDetailQuery = useQuery(
    orpc.employees.getById.queryOptions({
      input: { membershipId: targetMembershipId ?? "" },
      enabled:
        authStatus === "authenticated" &&
        Boolean(actor?.activeTenantId) &&
        Boolean(targetMembershipId),
    }),
  );

  useEffect(() => {
    if (target) {
      setEmail(target.invitedEmail);
      setRoleTitle(target.roleTitle);
      setAreas({
        trips: target.permissions.trips !== "none",
        bookings: target.permissions.bookings !== "none",
        accounting: target.permissions.accounting !== "none",
        coupons: target.permissions.coupons !== "none",
        employees: target.permissions.employees !== "none",
        fleet: target.permissions.fleet !== "none",
        subscription: target.permissions.subscription !== "none",
      });
    }
  }, [target]);

  const changeRows = useMemo<readonly ChangeRow[]>(() => {
    if (!employeeDetailQuery.data?.recentAuditLogs) return [];
    return employeeDetailQuery.data.recentAuditLogs.map((log) => ({
      id: log.id,
      actor: log.actorRole,
      time: new Date(log.createdAt).toLocaleString(),
      before: JSON.stringify(log.beforeState ?? {}),
      after: JSON.stringify(log.afterState ?? {}),
    }));
  }, [employeeDetailQuery.data?.recentAuditLogs]);

  const updatePermissionsMutation = useMutation(
    orpc.employees.updatePermissions.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.employees.key() });
      },
    }),
  );

  const inviteMutation = useMutation(
    orpc.employees.invite.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.employees.key() });
      },
    }),
  );

  const setArea = (area: AreaId, checked: boolean) => {
    setAreas((current) => ({ ...current, [area]: checked }));
  };

  async function handleSavePermissions() {
    if (authStatus === "authenticated" && targetMembershipId) {
      setErrorMsg(null);
      try {
        await updatePermissionsMutation.mutateAsync({
          membershipId: targetMembershipId,
          roleTitle: roleTitle.trim() || "Employee",
          permissions: toMatrix(areas),
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not update permissions.");
        return;
      }
    }
    void goTo("employees-list");
  }

  async function handleSendInvitation() {
    if (authStatus === "authenticated" && email.trim()) {
      setErrorMsg(null);
      try {
        await inviteMutation.mutateAsync({
          invitedEmail: email.trim(),
          roleTitle: roleTitle.trim() || "Employee",
          permissions: toMatrix(areas),
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not send invitation.");
        return;
      }
    }
    void goTo("employees-list");
  }

  const busy = updatePermissionsMutation.isPending || inviteMutation.isPending;

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "employees-list",
            label: t("screen.organization.people.employeeInvitationAndPermissions.backToEmployees"),
          }}
        />
        <TePageHeader
          title={t(
            "screen.organization.people.employeeInvitationAndPermissions.employeeInvitationAndPermissions",
          )}
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        <OrgSection title={t("screen.organization.people.employeeInvitationAndPermissions.invite")}>
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label={t("screen.organization.people.employeeInvitationAndPermissions.email")}
                type="email"
                placeholder={t(
                  "screen.organization.people.employeeInvitationAndPermissions.emailPlaceholder",
                )}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TeInput
                label={t("screen.organization.people.employeeInvitationAndPermissions.roleTitle")}
                placeholder={t(
                  "screen.organization.people.employeeInvitationAndPermissions.operationsCoordinator",
                )}
                value={roleTitle}
                onChange={(event) => setRoleTitle(event.target.value)}
              />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection
          title={t("screen.organization.people.employeeInvitationAndPermissions.permissionAreas")}
        >
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              {AREA_IDS.map((area) => (
                <TeCheckbox
                  key={area}
                  label={AREA_LABELS[area]}
                  checked={areas[area]}
                  onCheckedChange={(checked) => setArea(area, checked)}
                />
              ))}
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection
          title={t("screen.organization.people.employeeInvitationAndPermissions.changeHistory")}
        >
          <TeDataTable
            columns={CHANGE_COLUMNS()}
            rows={changeRows}
            getRowKey={(row) => row.id}
            caption={t(
              "screen.organization.people.employeeInvitationAndPermissions.permissionChangeHistory",
            )}
            emptyTitle={t(
              "screen.organization.people.employeeInvitationAndPermissions.noChangesYet",
            )}
            emptyDescription={t(
              "screen.organization.people.employeeInvitationAndPermissions.changesToPermissionAreasAre",
            )}
          />
        </OrgSection>
        <div className="flex flex-wrap justify-end gap-3">
          <TeButton
            variant="secondary"
            disabled={busy}
            onClick={() => void handleSavePermissions()}
          >
            {t("screen.organization.people.employeeInvitationAndPermissions.savePermissions")}
          </TeButton>
          <TeButton disabled={busy} onClick={() => void handleSendInvitation()}>
            {t("screen.organization.people.employeeInvitationAndPermissions.sendInvitation")}
          </TeButton>
        </div>
      </div>
    </StatePreview>
  );
}
