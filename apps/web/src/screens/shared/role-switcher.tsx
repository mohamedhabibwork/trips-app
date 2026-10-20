// The role and organization switcher from SCR-SHR-13: the roles one person holds and the
// organizations linked to one staff email. Each keeps its own data; no second account is made.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, ChoiceGroup, ChoiceRow, Notice } from "@/components/kit/controls";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

import { Overlay } from "./overlay";
import { SignInRequired } from "./sign-in-required";

type SwitchableRole =
  | "traveler"
  | "parent"
  | "platform_driver"
  | "org_driver"
  | "platform_photographer"
  | "org_photographer"
  | "organization_owner"
  | "organization_employee"
  | "moderator"
  | "admin";

const ROLE_KEYS: Record<SwitchableRole, string> = {
  traveler: "traveler",
  parent: "parent",
  platform_driver: "platformDriver",
  org_driver: "orgDriver",
  platform_photographer: "platformPhotographer",
  org_photographer: "orgPhotographer",
  organization_owner: "organizationOwner",
  organization_employee: "organizationEmployee",
  moderator: "moderator",
  admin: "admin",
};

function isSwitchableRole(role: string): role is SwitchableRole {
  return role in ROLE_KEYS;
}

interface RoleSwitcherProps {
  onClose: () => void;
}

export function RoleSwitcher({ onClose }: RoleSwitcherProps) {
  const { t, locale, status } = useAuth();
  const queryClient = useQueryClient();
  const signedIn = status === "authenticated";
  const rolesQuery = useQuery({
    ...serverQueryOptions(
      orpc.auth.listMyRolesAndOrganizations,
      "auth/listMyRolesAndOrganizations",
      { input: undefined },
    ),
    enabled: signedIn,
  });
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
  const switchRoleMutation = useMutation(
    serverMutationOptions(orpc.auth.switchRole, "auth/switchRole", { onSuccess }),
  );
  const switchOrgMutation = useMutation(
    serverMutationOptions(orpc.auth.switchOrganization, "auth/switchOrganization", { onSuccess }),
  );

  const roles = (rolesQuery.data?.roles ?? [])
    .map((entry) => entry.role)
    .filter(isSwitchableRole)
    .filter((role, index, list) => list.indexOf(role) === index);
  const organizations = (rolesQuery.data?.organizations ?? []).map((org) => ({
    id: org.tenantId,
    label:
      (locale === "ar"
        ? org.displayNameAr || org.displayNameEn
        : org.displayNameEn || org.displayNameAr) || org.tenantId,
  }));

  const [role, setRole] = useState<SwitchableRole | null>(null);
  const [organization, setOrganization] = useState<string | null>(null);
  const selectedRole = role ?? roles[0] ?? null;
  const busy = switchRoleMutation.isPending || switchOrgMutation.isPending;
  const failed = switchRoleMutation.isError || switchOrgMutation.isError;

  async function handleSwitch() {
    try {
      if (organization) await switchOrgMutation.mutateAsync({ targetTenantId: organization });
      if (role) {
        await switchRoleMutation.mutateAsync({
          targetRole: role,
          ...(organization ? { tenantId: organization } : {}),
        });
      }
      onClose();
    } catch {
      // The failure notice below explains it; the sheet stays open.
    }
  }

  return (
    <Overlay placement="sheet" labelledBy="role-switcher-title" onClose={onClose}>
      <h2 id="role-switcher-title" className="m-0 text-[22px] leading-[30px] font-bold">
        {t("screen.shared.roleSwitcher.title")}
      </h2>
      {!signedIn ? <SignInRequired message={t("screen.shared.roleSwitcher.signIn")} /> : null}
      {signedIn && rolesQuery.isPending ? (
        <p role="status" className="m-0 text-sm text-[var(--te-ink-muted)]">
          {t("screen.shared.roleSwitcher.loading")}
        </p>
      ) : null}
      {roles.length > 0 ? (
        <ChoiceGroup legend={t("screen.shared.roleSwitcher.roles")} muted>
          {roles.map((entry) => (
            <ChoiceRow
              key={entry}
              name="role"
              value={entry}
              checked={selectedRole === entry}
              onChange={() => setRole(entry)}
              disabled={busy}
            >
              {t(`screen.shared.roleSwitcher.role.${ROLE_KEYS[entry]}`)}
            </ChoiceRow>
          ))}
        </ChoiceGroup>
      ) : null}
      {organizations.length > 0 ? (
        <ChoiceGroup legend={t("screen.shared.roleSwitcher.organizations")} muted>
          {organizations.map((org) => (
            <ChoiceRow
              key={org.id}
              name="organization"
              value={org.id}
              checked={organization === org.id}
              onChange={() => setOrganization(org.id)}
              disabled={busy}
            >
              {org.label}
            </ChoiceRow>
          ))}
        </ChoiceGroup>
      ) : null}
      <p className="m-0 text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
        {t("screen.shared.roleSwitcher.note")}
      </p>
      {failed ? <Notice tone="danger">{t("screen.shared.roleSwitcher.failed")}</Notice> : null}
      <Button onClick={() => void handleSwitch()} disabled={busy || (!role && !organization)}>
        {busy ? t("auth.common.submitting") : t("screen.shared.roleSwitcher.switch")}
      </Button>
    </Overlay>
  );
}
