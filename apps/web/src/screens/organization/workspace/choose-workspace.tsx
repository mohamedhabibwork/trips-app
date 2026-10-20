// SCR-ORG-62 Choose workspace: the organization cards a multi-organization account opens after
// sign-in. Opening one switches the active workspace through `auth.switchOrganization`.
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { pathFor } from "@/navigation/web-routes";
import { cn } from "@trips-app/ui/lib/utils";

import { OrgAlert, OrgBadge, OrgLoading, OrgPage, OrgPageHeader } from "../common/org-ui";

const K = "screen.organization.workspace.chooseWorkspace";

interface WorkspaceCard {
  tenantId: string;
  name: string;
  role: string;
  planTier: string | null;
  status: string | null;
}

function roleLabel(role: string): string {
  if (role === "organization_owner") return t(`${K}.roleOwner`);
  if (role === "organization_employee") return t(`${K}.roleEmployee`);
  return role;
}

export function ChooseWorkspace(): ReactNode {
  const queryClient = useQueryClient();
  const { status, locale } = useAuth();
  const signedIn = status === "authenticated";

  const rolesQuery = useQuery({
    ...serverQueryOptions(
      orpc.auth.listMyRolesAndOrganizations,
      "auth/listMyRolesAndOrganizations",
      { input: undefined },
    ),
    enabled: signedIn,
  });
  const switchMutation = useMutation(
    serverMutationOptions(orpc.auth.switchOrganization, "auth/switchOrganization", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );

  const cards: readonly WorkspaceCard[] = (rolesQuery.data?.organizations ?? []).map((org) => ({
    tenantId: org.tenantId,
    name:
      (locale === "ar"
        ? org.displayNameAr || org.displayNameEn
        : org.displayNameEn || org.displayNameAr) || org.tenantId,
    role: org.role,
    planTier: org.planTier,
    status: rolesQuery.data?.roles.find((role) => role.tenantId === org.tenantId)?.status ?? null,
  }));

  function open(tenantId: string) {
    switchMutation.mutate({ targetTenantId: tenantId });
  }

  return (
    <OrgPage className="mx-auto w-full max-w-[720px]">
      <OrgPageHeader title={t(`${K}.title`)} caption={t(`${K}.caption`, { n: cards.length })} />
      {rolesQuery.isError ? <OrgAlert tone="err" title={t(`${K}.loadFailed`)} /> : null}
      {switchMutation.isError ? (
        <OrgAlert tone="err" title={t(`${K}.switchFailedTitle`)}>
          {t(`${K}.switchFailedBody`)}
        </OrgAlert>
      ) : null}
      {rolesQuery.isLoading ? <OrgLoading rows={3} /> : null}
      {rolesQuery.isSuccess && cards.length === 0 ? (
        <OrgAlert tone="info" title={t(`${K}.noOrganizationsTitle`)}>
          {t(`${K}.noOrganizationsBody`)}
        </OrgAlert>
      ) : null}
      <div className="flex flex-col gap-4">
        {cards.map((card) => {
          const actionNeeded = card.status === "paused";
          return (
            <button
              key={card.tenantId}
              type="button"
              disabled={switchMutation.isPending}
              onClick={() => open(card.tenantId)}
              className={cn(
                "flex min-h-16 cursor-pointer items-center gap-4 rounded-xl border border-[var(--te-hairline)] bg-[var(--te-surface-raised)] p-4 text-start no-underline",
                "hover:border-[var(--te-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--te-ink)]",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-base leading-6 font-semibold">{card.name}</span>
                <span className="te-caption text-[var(--te-ink-muted)]">
                  {roleLabel(card.role)}
                  {card.planTier && card.planTier !== "none"
                    ? ` · ${t(`${K}.planLine`, { plan: card.planTier })}`
                    : ""}
                </span>
              </span>
              {actionNeeded ? (
                <OrgBadge tone="warn" icon={false}>
                  {t(`${K}.actionNeeded`)}
                </OrgBadge>
              ) : (
                <OrgBadge tone="ok" icon={false}>
                  {t(`${K}.active`)}
                </OrgBadge>
              )}
            </button>
          );
        })}
      </div>
      <p className="te-caption m-0">
        <a
          href={pathFor("SCR-PUB-06")}
          className="font-semibold text-[var(--te-primary-text)] underline-offset-4 hover:underline"
        >
          {t(`${K}.registerNew`)}
        </a>
      </p>
    </OrgPage>
  );
}
