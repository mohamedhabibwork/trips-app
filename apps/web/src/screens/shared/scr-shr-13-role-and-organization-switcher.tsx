import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeChip } from "@trips-app/ui/components/te-chip";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { goBack } from "./screen-actions";

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

const ROLE_OPTIONS = (): readonly { id: string; targetRole: SwitchableRole; label: string }[] => [
  {
    id: "traveler",
    targetRole: "traveler",
    label: t("screen.shared.scrShr13RoleAndOrganizationSwitcher.traveler"),
  },
  {
    id: "driver",
    targetRole: "platform_driver",
    label: t("screen.shared.scrShr13RoleAndOrganizationSwitcher.driver"),
  },
];

/** Switch between roles of one person, or between organizations linked to one staff email. */
export function ScrShr13RoleAndOrganizationSwitcher() {
  const queryClient = useQueryClient();
  const rolesAndOrgsQuery = useQuery(
    orpc.auth.listMyRolesAndOrganizations.queryOptions({ input: undefined }),
  );
  const orgSettingsQuery = useQuery(
    orpc.organization.getOrganizationSettings.queryOptions({ input: {} }),
  );

  const switchRoleMutation = useMutation(
    orpc.auth.switchRole.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );

  const switchOrgMutation = useMutation(
    orpc.auth.switchOrganization.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );

  const rolesFromQuery = rolesAndOrgsQuery.data?.roles;
  const roles: readonly { id: string; targetRole: SwitchableRole; label: string }[] =
    rolesFromQuery && rolesFromQuery.length > 0
      ? rolesFromQuery.map((r) => ({
          id: r.role,
          targetRole: r.role as SwitchableRole,
          label:
            r.role === "traveler"
              ? t("screen.shared.scrShr13RoleAndOrganizationSwitcher.traveler")
              : r.role === "platform_driver" || r.role === "org_driver"
                ? t("screen.shared.scrShr13RoleAndOrganizationSwitcher.driver")
                : r.role,
        }))
      : ROLE_OPTIONS();

  const orgsFromQuery = rolesAndOrgsQuery.data?.organizations ?? [];
  const orgFromSettings = orgSettingsQuery.data?.organization;
  const organizations: { id: string; label: string }[] = orgsFromQuery.map((org) => ({
    id: org.tenantId,
    label: org.displayNameEn || org.displayNameAr || org.tenantId,
  }));
  if (orgFromSettings && !organizations.some((item) => item.id === orgFromSettings.id)) {
    organizations.unshift({
      id: orgFromSettings.id,
      label:
        orgFromSettings.displayNameEn ||
        orgFromSettings.displayNameAr ||
        orgFromSettings.legalEntityName,
    });
  }

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const activeRole = selectedRole ?? roles[0]?.id ?? "traveler";

  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const activeOrganization = selectedOrg ?? organizations[0]?.id ?? "";

  const handleSelectRole = (role: { id: string; targetRole: SwitchableRole }) => {
    setSelectedRole(role.id);
    void switchRoleMutation
      .mutateAsync({
        targetRole: role.targetRole,
        ...(activeOrganization ? { tenantId: activeOrganization } : {}),
      })
      .catch(() => {});
  };

  const handleSelectOrganization = (organizationId: string) => {
    setSelectedOrg(organizationId);
    void switchOrgMutation.mutateAsync({ targetTenantId: organizationId }).catch(() => {});
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      <TePageHeader
        title={t("screen.shared.scrShr13RoleAndOrganizationSwitcher.roleAndOrganizationSwitcher")}
        description={t("screen.shared.scrShr13RoleAndOrganizationSwitcher.onlyRolesYouHoldAnd")}
        actions={
          <TeButton variant="ghost" onClick={goBack}>
            {t("screen.shared.scrShr13RoleAndOrganizationSwitcher.back")}
          </TeButton>
        }
      />
      <section className="flex flex-col gap-3" aria-labelledby="switch-roles-heading">
        <h2 id="switch-roles-heading" className="te-h3">
          {t("screen.shared.scrShr13RoleAndOrganizationSwitcher.roles")}
        </h2>
        <div role="group" aria-labelledby="switch-roles-heading" className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <TeChip
              key={role.id}
              selected={activeRole === role.id}
              onClick={() => handleSelectRole(role)}
            >
              {role.label}
            </TeChip>
          ))}
        </div>
        <p className="te-body" aria-live="polite">
          {t("screen.shared.scrShr13RoleAndOrganizationSwitcher.showingRole", {
            role: roles.find((role) => role.id === activeRole)?.label ?? "",
          })}
        </p>
      </section>
      <section className="flex flex-col gap-3" aria-labelledby="switch-orgs-heading">
        <h2 id="switch-orgs-heading" className="te-h3">
          {t("screen.shared.scrShr13RoleAndOrganizationSwitcher.organizations")}
        </h2>
        <div role="group" aria-labelledby="switch-orgs-heading" className="flex flex-wrap gap-2">
          {organizations.map((organization) => (
            <TeChip
              key={organization.id}
              selected={activeOrganization === organization.id}
              onClick={() => handleSelectOrganization(organization.id)}
            >
              {organization.label}
            </TeChip>
          ))}
        </div>
      </section>
    </div>
  );
}
