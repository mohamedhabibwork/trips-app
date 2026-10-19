// SCR-ADM-07 Users and entities (docs/design/web/admin/SCR-ADM-07.dc.html): search any
// organization, driver or photographer, filter by role, and open the account. The directory is
// built from the onboarding applications, the only account list the API serves today.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminLink } from "../common/admin-actions";
import { AdminInput, AdminSelect, type AdminOption } from "../common/admin-form";
import { setSelectedAdminEntityId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminFilterBar, AdminPage, AdminTable, type AdminColumn } from "../common/admin-ui";
import {
  AccountStatusBadge,
  entityName,
  entityRole,
  readLegalName,
  readPayload,
  roleLabel,
  type EntityRole,
} from "./directory-shared";

interface EntityRow {
  id: string;
  name: string;
  role: EntityRole;
  email: string | null;
  searchText: string;
}

const ROLE_FILTERS = ["organization", "driver", "photographer", "traveler", "moderator"] as const;

const roleOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.directory.usersAndEntitiesDirectory.allRoles") },
  ...ROLE_FILTERS.map((role) => ({ value: role, label: roleLabel(role) })),
];

const statusOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.directory.usersAndEntitiesDirectory.allStatuses") },
  { value: "active", label: t("screen.admin.directory.usersAndEntitiesDirectory.active") },
  { value: "suspended", label: t("screen.admin.directory.usersAndEntitiesDirectory.suspended") },
];

function matchesSearch(row: EntityRow, search: string): boolean {
  const needle = search.trim().toLowerCase();
  return needle === "" || row.searchText.includes(needle);
}

export function UsersAndEntitiesDirectory() {
  const { status: authStatus } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  const allRows: readonly EntityRow[] = (queueQuery.data ?? []).map((item) => {
    const payload = readPayload(item.payload);
    const name = entityName(item);
    const email = item.applicant?.email ?? null;
    const searchable = [name, email, item.applicant?.phone, readLegalName(payload), item.id];
    return {
      id: item.id,
      name,
      role: entityRole(item.applicationType),
      email,
      searchText: searchable.filter(Boolean).join(" ").toLowerCase(),
    };
  });
  const rows = allRows.filter(
    (row) => (roleFilter === "all" || row.role === roleFilter) && matchesSearch(row, search),
  );

  const columns: readonly AdminColumn<EntityRow>[] = [
    {
      key: "name",
      header: t("screen.admin.directory.usersAndEntitiesDirectory.name"),
      render: (row) => row.name,
      wrap: true,
    },
    {
      key: "role",
      header: t("screen.admin.directory.usersAndEntitiesDirectory.role"),
      render: (row) => roleLabel(row.role),
    },
    {
      key: "email",
      header: t("screen.admin.directory.usersAndEntitiesDirectory.email"),
      render: (row) => row.email ?? "—",
    },
    {
      // The application list carries no account status; the detail page shows it.
      key: "status",
      header: t("screen.admin.directory.usersAndEntitiesDirectory.status"),
      render: () => <AccountStatusBadge status={null} />,
    },
    {
      key: "action",
      header: (
        <span className="te-caption">
          {t("screen.admin.directory.usersAndEntitiesDirectory.action")}
        </span>
      ),
      render: (row) => (
        <AdminLink
          screen="SCR-ADM-08"
          params={{ entityId: row.id }}
          ariaLabel={t("screen.admin.directory.usersAndEntitiesDirectory.openAccountFor", {
            name: row.name,
          })}
          onClick={() => setSelectedAdminEntityId(row.id)}
        >
          {t("screen.admin.directory.usersAndEntitiesDirectory.openAccount")}
        </AdminLink>
      ),
    },
  ];

  return (
    <AdminPage
      title={t("screen.admin.directory.usersAndEntitiesDirectory.title")}
      description={t("screen.admin.directory.usersAndEntitiesDirectory.description")}
    >
      <AdminFilterBar label={t("screen.admin.directory.usersAndEntitiesDirectory.filters")}>
        <AdminInput
          className="lg:flex-[3]!"
          type="search"
          label={t("screen.admin.directory.usersAndEntitiesDirectory.search")}
          placeholder={t("screen.admin.directory.usersAndEntitiesDirectory.searchPlaceholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <AdminSelect
          label={t("screen.admin.directory.usersAndEntitiesDirectory.role")}
          options={roleOptions()}
          value={roleFilter}
          onValueChange={setRoleFilter}
        />
        <AdminSelect
          label={t("screen.admin.directory.usersAndEntitiesDirectory.status")}
          options={statusOptions()}
          value={statusFilter}
          onValueChange={setStatusFilter}
          disabled
          title={t("screen.admin.directory.usersAndEntitiesDirectory.statusFilterUnavailable")}
        />
      </AdminFilterBar>
      <AdminQueryState
        query={queueQuery}
        loadingLabel={t("screen.admin.directory.usersAndEntitiesDirectory.loading")}
      >
        <AdminTable
          caption={t("screen.admin.directory.usersAndEntitiesDirectory.tableCaption")}
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          empty={
            <AdminEmpty
              title={t("screen.admin.directory.usersAndEntitiesDirectory.emptyTitle")}
              description={t("screen.admin.directory.usersAndEntitiesDirectory.emptyBody")}
            />
          }
        />
      </AdminQueryState>
    </AdminPage>
  );
}
