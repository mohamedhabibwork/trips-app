import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import {
  AdminActions,
  AdminPage,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface AdminRow {
  id: string;
  name: string;
  email: string;
  state: "active" | "setup-required";
  authenticator: string;
}

const STATE_PRESENTATION = (): Record<AdminRow["state"], AdminStatusPresentation> => ({
  active: {
    tone: "success",
    icon: "check",
    label: t("screen.admin.directory.adminStaffAccounts.active"),
  },
  "setup-required": {
    tone: "warning",
    icon: "clock",
    label: t("screen.admin.directory.adminStaffAccounts.setUpRequired"),
  },
});

const COLUMNS = (onResetTotp: (row: AdminRow) => void): readonly TeDataTableColumn<AdminRow>[] => [
  { key: "name", header: t("screen.admin.directory.adminStaffAccounts.name") },
  { key: "email", header: t("screen.admin.directory.adminStaffAccounts.email") },
  {
    key: "state",
    header: t("screen.admin.directory.adminStaffAccounts.status"),
    render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
  },
  { key: "authenticator", header: t("screen.admin.directory.adminStaffAccounts.authenticator") },
  {
    key: "reset",
    header: t("screen.admin.directory.adminStaffAccounts.action"),
    render: (row) => (
      <TeButton
        variant="ghost"
        onClick={() => onResetTotp(row)}
        aria-label={t("screen.admin.directory.adminStaffAccounts.resetAuthenticatorFor", {
          name: row.name,
        })}
      >
        {t("screen.admin.directory.adminStaffAccounts.resetAuthenticator")}
      </TeButton>
    ),
  },
];

export function AdminStaffAccounts() {
  const { actor } = useAuth();
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<readonly AdminRow[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("EG");

  const resetTotpMutation = useMutation(
    orpc.auth.adminResetTotp.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const inviteStaffMutation = useMutation(
    orpc.auth.adminInviteStaff.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );

  useEffect(() => {
    if (!actor) return;
    setRows([
      {
        id: actor.accountId,
        name: actor.adminSubRole ?? actor.activeRole,
        email: `${actor.accountId.slice(0, 8)}@trips.app`,
        state: "active",
        authenticator: "Set up",
      },
    ]);
  }, [actor]);

  const handleResetTotp = (row: AdminRow) => {
    void resetTotpMutation
      .mutateAsync({
        targetAdminAccountId: row.id,
        reason: "Admin requested TOTP reset from staff directory",
      })
      .catch(() => {});
    setRows((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? { ...item, state: "setup-required", authenticator: "Not set up" }
          : item,
      ),
    );
  };

  const handleCreate = () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) return;
    const optimisticId = `admin-${Date.now()}`;
    setRows((prev) => [
      ...prev,
      {
        id: optimisticId,
        name: trimmedName,
        email: trimmedEmail,
        state: "setup-required",
        authenticator: "Not set up",
      },
    ]);
    setFullName("");
    setEmail("");
    void inviteStaffMutation
      .mutateAsync({
        email: trimmedEmail,
        fullName: trimmedName,
        subRole: "operations",
      })
      .then((res) => {
        const createdId = (res as { accountId?: string } | undefined)?.accountId;
        if (!createdId) return;
        setRows((prev) =>
          prev.map((item) => (item.id === optimisticId ? { ...item, id: createdId } : item)),
        );
      })
      .catch(() => {});
  };

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.directory.adminStaffAccounts.adminStaffAccounts")}
        description={t("screen.admin.directory.adminStaffAccounts.createAdminAccountsAndSee")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.directory.adminStaffAccounts.noAdminAccounts")}
        emptyDescription={t("screen.admin.directory.adminStaffAccounts.createTheFirstAdminAccount")}
        loadingLabel={t("screen.admin.directory.adminStaffAccounts.loadingTheAdminAccounts")}
      >
        <AdminPanel title={t("screen.admin.directory.adminStaffAccounts.createAdminAccount")}>
          <TeInput
            label={t("screen.admin.directory.adminStaffAccounts.fullName")}
            placeholder={t("screen.admin.directory.adminStaffAccounts.fullNamePlaceholder")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <TeInput
            label={t("screen.admin.directory.adminStaffAccounts.emailLabel")}
            type="email"
            placeholder={t("screen.admin.directory.adminStaffAccounts.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TeInput
            label={t("screen.admin.directory.adminStaffAccounts.country")}
            placeholder={t("screen.admin.directory.adminStaffAccounts.countryPlaceholder")}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            supportingText={t("screen.admin.directory.adminStaffAccounts.countryIsProposedInD")}
          />
          <AdminActions>
            <TeButton onClick={handleCreate}>
              {t("screen.admin.directory.adminStaffAccounts.createAdminAccount2")}
            </TeButton>
          </AdminActions>
        </AdminPanel>
        <TeInlineAlert
          tone="info"
          title={t("screen.admin.directory.adminStaffAccounts.howAdminAccountsStart")}
        >
          {t("screen.admin.directory.adminStaffAccounts.aNewAdminMustSet")}
        </TeInlineAlert>
        <AdminPanel title={t("screen.admin.directory.adminStaffAccounts.adminAccounts")}>
          <TeDataTable
            columns={COLUMNS(handleResetTotp)}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.directory.adminStaffAccounts.adminStaffAccountsCaption")}
            emptyTitle={t("screen.admin.directory.adminStaffAccounts.noAdminAccountsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.directory.adminStaffAccounts.createTheFirstAdminAccountEmptyDescription",
            )}
          />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
