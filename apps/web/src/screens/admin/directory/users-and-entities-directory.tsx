import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import {
  TE_ROLES,
  TeRoleBadge,
  roleLabel,
  type TeRole,
} from "@trips-app/ui/components/te-role-badge";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, useAdminNavigate } from "../common/admin-links";
import {
  AdminActions,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  setSelectedAdminEntityId,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface EntityRow {
  id: string;
  name: string;
  role: TeRole;
  organization: string;
  status: "active" | "suspended";
}

const STATUS_PRESENTATION = (): Record<EntityRow["status"], AdminStatusPresentation> => ({
  active: {
    tone: "success",
    icon: "check",
    label: t("screen.admin.directory.usersAndEntitiesDirectory.active"),
  },
  suspended: {
    tone: "danger",
    icon: "lock",
    label: t("screen.admin.directory.usersAndEntitiesDirectory.suspended"),
  },
});

const ROLE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.directory.usersAndEntitiesDirectory.allRoles") },
  ...TE_ROLES.map((role) => ({ value: role, label: roleLabel(role) })),
];
const STATUS_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.directory.usersAndEntitiesDirectory.allStatuses") },
  { value: "active", label: t("screen.admin.directory.usersAndEntitiesDirectory.activeLabel") },
  {
    value: "suspended",
    label: t("screen.admin.directory.usersAndEntitiesDirectory.suspendedLabel"),
  },
  {
    value: "deletion",
    label: t("screen.admin.directory.usersAndEntitiesDirectory.deletionRequested"),
  },
];

function mapAppRole(applicationType: string): TeRole {
  if (applicationType === "organization") return "organization";
  if (applicationType === "platform_photographer") return "photographer";
  return "driver";
}

export function UsersAndEntitiesDirectory() {
  const { status: authStatus } = useAuth();
  const goTo = useAdminNavigate();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  const rows: readonly EntityRow[] = (queueQuery.data ?? []).map((app) => {
    const payload = (app.payload ?? {}) as Record<string, unknown>;
    const legalEntity = typeof payload.legalEntityName === "string" ? payload.legalEntityName : "-";
    return {
      id: app.id,
      name: app.applicant?.fullName ?? legalEntity ?? app.applicantAccountId,
      role: mapAppRole(app.applicationType),
      organization: legalEntity,
      status: app.state === "Rejected" || app.state === "Closed" ? "suspended" : "active",
    };
  });

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter((row) => {
    if (roleFilter !== "all" && row.role !== roleFilter) return false;
    if (statusFilter !== "all" && row.status !== statusFilter) return false;
    if (
      normalizedQuery &&
      !row.name.toLowerCase().includes(normalizedQuery) &&
      !row.organization.toLowerCase().includes(normalizedQuery)
    ) {
      return false;
    }
    return true;
  });

  const columns: readonly TeDataTableColumn<EntityRow>[] = [
    { key: "name", header: t("screen.admin.directory.usersAndEntitiesDirectory.name") },
    {
      key: "role",
      header: t("screen.admin.directory.usersAndEntitiesDirectory.role"),
      render: (row) => <TeRoleBadge role={row.role} />,
    },
    {
      key: "organization",
      header: t("screen.admin.directory.usersAndEntitiesDirectory.organization"),
    },
    {
      key: "status",
      header: t("screen.admin.directory.usersAndEntitiesDirectory.status"),
      render: (row) => <AdminStatus status={STATUS_PRESENTATION()[row.status]} />,
    },
    {
      key: "open",
      header: t("screen.admin.directory.usersAndEntitiesDirectory.action"),
      render: (row) => (
        <TeButton
          variant="secondary"
          aria-label={t("screen.admin.directory.usersAndEntitiesDirectory.open", {
            name: row.name,
          })}
          onClick={() => {
            setSelectedAdminEntityId(row.id);
            void goTo("entity-detail");
          }}
        >
          {t("screen.admin.directory.usersAndEntitiesDirectory.open2")}
        </TeButton>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.directory.usersAndEntitiesDirectory.usersAndEntitiesDirectory")}
        description={t(
          "screen.admin.directory.usersAndEntitiesDirectory.findAnyUserOrganizationDriver",
        )}
        actions={
          <AdminActions>
            <AdminScreenLink slug="deletion-and-data-requests" variant="secondary">
              {t("screen.admin.directory.usersAndEntitiesDirectory.deletionRequests")}
            </AdminScreenLink>
            <AdminScreenLink slug="admin-staff-accounts" variant="secondary">
              {t("screen.admin.directory.usersAndEntitiesDirectory.adminStaffAccounts")}
            </AdminScreenLink>
          </AdminActions>
        }
      />
      <StatePreview
        emptyTitle={t("screen.admin.directory.usersAndEntitiesDirectory.noResults")}
        emptyDescription={t(
          "screen.admin.directory.usersAndEntitiesDirectory.changeTheSearchOrThe",
        )}
        loadingLabel={t("screen.admin.directory.usersAndEntitiesDirectory.loadingTheDirectory")}
      >
        <AdminFilters>
          <TeSearchField
            label={t("screen.admin.directory.usersAndEntitiesDirectory.search")}
            placeholder={t(
              "screen.admin.directory.usersAndEntitiesDirectory.nameEmailPhoneOrganizationOr",
            )}
            clearLabel={t("screen.admin.directory.usersAndEntitiesDirectory.clearSearch")}
            value={query}
            onValueChange={setQuery}
          />
          <TeSelect
            label={t("screen.admin.directory.usersAndEntitiesDirectory.roleLabel")}
            options={ROLE_OPTIONS()}
            value={roleFilter}
            onValueChange={setRoleFilter}
          />
          <TeSelect
            label={t("screen.admin.directory.usersAndEntitiesDirectory.statusLabel")}
            options={STATUS_OPTIONS()}
            value={statusFilter}
            onValueChange={setStatusFilter}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.directory.usersAndEntitiesDirectory.results")}>
          <TeDataTable
            columns={columns}
            rows={visibleRows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.directory.usersAndEntitiesDirectory.usersAndEntities")}
            emptyTitle={t("screen.admin.directory.usersAndEntitiesDirectory.noResultsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.directory.usersAndEntitiesDirectory.changeTheSearchOrTheEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
