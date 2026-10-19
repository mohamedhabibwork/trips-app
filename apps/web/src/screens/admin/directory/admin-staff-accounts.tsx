// SCR-ADM-11 Admin staff accounts (docs/design/web/admin/SCR-ADM-11.dc.html): create admin
// accounts by invitation and see their set-up state. The API has no staff list procedure, so the
// table holds the invitations sent from this page; a reset needs the admin's account ID, which only
// a staff list would provide.
import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { orpc } from "@/utils/orpc";

import { AdminButton } from "../common/admin-actions";
import { AdminInput, AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminEmpty } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminPage,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";

type SubRole = "super_admin" | "operations" | "finance";

interface StaffRow {
  id: string;
  /** Present once the invitation is accepted; the authenticator reset needs it. */
  accountId: string | null;
  name: string;
  email: string;
  subRole: SubRole;
}

const RESET_REASON = "Authenticator reset from the admin staff accounts page";

const subRoleOptions = (): readonly AdminOption[] => [
  { value: "operations", label: t("screen.admin.directory.adminStaffAccounts.operations") },
  { value: "finance", label: t("screen.admin.directory.adminStaffAccounts.finance") },
  { value: "super_admin", label: t("screen.admin.directory.adminStaffAccounts.superAdmin") },
];

function subRoleLabel(subRole: SubRole): string {
  return subRoleOptions().find((option) => option.value === subRole)?.label ?? subRole;
}

function isSubRole(value: string): value is SubRole {
  return value === "super_admin" || value === "operations" || value === "finance";
}

export function AdminStaffAccounts() {
  const queryClient = useQueryClient();
  const [isFormOpen, setFormOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subRole, setSubRole] = useState<SubRole>("operations");
  const [rows, setRows] = useState<readonly StaffRow[]>([]);

  const inviteMutation = useMutation(
    orpc.auth.adminInviteStaff.mutationOptions({
      onSuccess: (result, input) => {
        void queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
        setRows((current) => [
          ...current,
          {
            id: result.inviteId,
            accountId: null,
            name: input.fullName,
            email: result.email,
            subRole: input.subRole,
          },
        ]);
        setFullName("");
        setEmail("");
        setFormOpen(false);
      },
    }),
  );
  const resetMutation = useMutation(
    orpc.auth.adminResetTotp.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );

  const submitInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
    inviteMutation.mutate({ fullName: fullName.trim(), email: email.trim(), subRole });
  };

  const columns: readonly AdminColumn<StaffRow>[] = [
    {
      key: "name",
      header: t("screen.admin.directory.adminStaffAccounts.name"),
      render: (row) => row.name,
      wrap: true,
    },
    {
      key: "email",
      header: t("screen.admin.directory.adminStaffAccounts.email"),
      render: (row) => row.email,
    },
    {
      key: "country",
      header: t("screen.admin.directory.adminStaffAccounts.country"),
      render: () => "—",
    },
    {
      key: "subRole",
      header: t("screen.admin.directory.adminStaffAccounts.subRole"),
      render: (row) => subRoleLabel(row.subRole),
    },
    {
      key: "authenticator",
      header: t("screen.admin.directory.adminStaffAccounts.authenticator"),
      render: () => (
        <AdminBadge tone="warn">
          {t("screen.admin.directory.adminStaffAccounts.notSetUp")}
        </AdminBadge>
      ),
    },
    {
      key: "status",
      header: t("screen.admin.directory.adminStaffAccounts.status"),
      render: () => (
        <AdminBadge icon={false}>
          {t("screen.admin.directory.adminStaffAccounts.setUpRequired")}
        </AdminBadge>
      ),
    },
    {
      key: "action",
      header: (
        <span className="te-caption">{t("screen.admin.directory.adminStaffAccounts.action")}</span>
      ),
      render: (row) => (
        <AdminButton
          variant="link"
          disabled={!row.accountId || resetMutation.isPending}
          aria-label={t("screen.admin.directory.adminStaffAccounts.resetAuthenticatorFor", {
            name: row.name,
          })}
          onClick={() =>
            row.accountId &&
            resetMutation.mutate({ targetAdminAccountId: row.accountId, reason: RESET_REASON })
          }
        >
          {t("screen.admin.directory.adminStaffAccounts.resetAuthenticator")}
        </AdminButton>
      ),
    },
  ];

  return (
    <AdminPage
      title={t("screen.admin.directory.adminStaffAccounts.title")}
      description={t("screen.admin.directory.adminStaffAccounts.description")}
      actions={
        <AdminButton variant="primary" onClick={() => setFormOpen(true)} disabled={isFormOpen}>
          {t("screen.admin.directory.adminStaffAccounts.createAdmin")}
        </AdminButton>
      }
    >
      <AdminAlert tone="info">
        {t("screen.admin.directory.adminStaffAccounts.setupNotice")}
      </AdminAlert>
      {inviteMutation.isSuccess ? (
        <AdminAlert tone="success">
          {t("screen.admin.directory.adminStaffAccounts.invitationSent", {
            email: inviteMutation.data.email,
          })}
        </AdminAlert>
      ) : null}
      {inviteMutation.isError || resetMutation.isError ? (
        <AdminAlert tone="danger" title={t("screen.admin.directory.adminStaffAccounts.notSaved")}>
          {t("screen.admin.directory.adminStaffAccounts.notSavedBody")}
        </AdminAlert>
      ) : null}
      {resetMutation.isSuccess ? (
        <AdminAlert tone="success">
          {t("screen.admin.directory.adminStaffAccounts.resetDone")}
        </AdminAlert>
      ) : null}
      {isFormOpen ? (
        <AdminCard title={t("screen.admin.directory.adminStaffAccounts.createAdmin")}>
          <form className="flex flex-col gap-4" onSubmit={submitInvite} noValidate>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <AdminInput
                label={t("screen.admin.directory.adminStaffAccounts.fullName")}
                value={fullName}
                minLength={2}
                maxLength={120}
                required
                autoComplete="off"
                onChange={(event) => setFullName(event.target.value)}
              />
              <AdminInput
                label={t("screen.admin.directory.adminStaffAccounts.email")}
                type="email"
                value={email}
                required
                autoComplete="off"
                onChange={(event) => setEmail(event.target.value)}
              />
              <AdminSelect
                label={t("screen.admin.directory.adminStaffAccounts.subRole")}
                options={subRoleOptions()}
                value={subRole}
                onValueChange={(value) => isSubRole(value) && setSubRole(value)}
              />
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <AdminButton onClick={() => setFormOpen(false)}>
                {t("screen.admin.directory.adminStaffAccounts.cancel")}
              </AdminButton>
              <AdminButton type="submit" variant="primary" disabled={inviteMutation.isPending}>
                {t("screen.admin.directory.adminStaffAccounts.sendInvitation")}
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      ) : null}
      <AdminTable
        caption={t("screen.admin.directory.adminStaffAccounts.tableCaption")}
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        empty={
          <AdminEmpty
            title={t("screen.admin.directory.adminStaffAccounts.emptyTitle")}
            description={t("screen.admin.directory.adminStaffAccounts.emptyBody")}
          />
        }
      />
    </AdminPage>
  );
}
