// SCR-ORG-61 My organizations: every organization the signed-in account can open, opened through
// `auth.switchOrganization`. Leaving an organization has no procedure yet and says so.
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { pathFor } from "@/navigation/web-routes";

import { OrgLink } from "../common/org-link";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";

const K = "screen.organization.workspace.myOrganizations";

interface OrgMembership {
  tenantId: string;
  displayNameEn: string | null;
  displayNameAr: string | null;
  planTier: string | null;
  role: string;
  status: string | null;
}

function planTone(planTier: string | null): "ok" | "warn" | "neu" {
  if (!planTier) return "neu";
  if (planTier === "none" || planTier === "expired") return "warn";
  return "ok";
}

function planLabel(planTier: string | null): string {
  if (!planTier || planTier === "none") return t(`${K}.planEnded`);
  return planTier.charAt(0).toUpperCase() + planTier.slice(1);
}

function roleLabel(role: string): string {
  if (role === "organization_owner") return t(`${K}.roleOwner`);
  if (role === "organization_employee") return t(`${K}.roleEmployee`);
  return role;
}

export function MyOrganizations(): ReactNode {
  const queryClient = useQueryClient();
  const { status, locale } = useAuth();
  const signedIn = status === "authenticated";
  const [leaveTarget, setLeaveTarget] = useState<OrgMembership | null>(null);

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

  const memberships: readonly OrgMembership[] = (rolesQuery.data?.organizations ?? []).map(
    (org) => ({
      tenantId: org.tenantId,
      displayNameEn: org.displayNameEn,
      displayNameAr: org.displayNameAr,
      planTier: org.planTier,
      role: org.role,
      status: rolesQuery.data?.roles.find((role) => role.tenantId === org.tenantId)?.status ?? null,
    }),
  );
  const displayName = (org: OrgMembership) =>
    (locale === "ar"
      ? org.displayNameAr || org.displayNameEn
      : org.displayNameEn || org.displayNameAr) || org.tenantId;
  const busy = switchMutation.isPending;

  function open(org: OrgMembership) {
    switchMutation.mutate({ targetTenantId: org.tenantId });
  }

  const columns: readonly OrgColumn<OrgMembership>[] = [
    {
      key: "name",
      header: t(`${K}.organization`),
      render: (org) => (
        <span className="flex flex-col">
          <b>{displayName(org)}</b>
          <span className="te-caption text-[var(--te-ink-muted)]">
            {org.status === "active"
              ? t(`${K}.statusActive`)
              : org.status === "paused"
                ? t(`${K}.statusPaused`)
                : (org.status ?? NO_VALUE)}
          </span>
        </span>
      ),
    },
    { key: "role", header: t(`${K}.yourRole`), render: (org) => roleLabel(org.role) },
    {
      key: "planTier",
      header: t(`${K}.plan`),
      render: (org) => (
        <OrgBadge tone={planTone(org.planTier)} icon={false}>
          {planLabel(org.planTier)}
        </OrgBadge>
      ),
    },
    {
      key: "action",
      header: t(`${K}.actions`),
      align: "end",
      render: (org) => (
        <span className="flex justify-end gap-2 whitespace-nowrap">
          <OrgButton variant="text" className="-mx-2" disabled={busy} onClick={() => open(org)}>
            {t(`${K}.open`)}
          </OrgButton>
          {org.role === "organization_owner" ? null : (
            <OrgButton variant="text" className="-mx-2" onClick={() => setLeaveTarget(org)}>
              {t(`${K}.leave`)}
            </OrgButton>
          )}
        </span>
      ),
    },
  ];

  return (
    <OrgPage>
      <OrgPageHeader title={t(`${K}.title`)} caption={t(`${K}.caption`)} />
      <OrgCard
        title={t(`${K}.accountCard`)}
        actions={<OrgBadge tone="ok">{t(`${K}.signedIn`)}</OrgBadge>}
      >
        <p className="m-0 text-sm text-[var(--te-ink-muted)]">{t(`${K}.accountNote`)}</p>
      </OrgCard>
      {rolesQuery.isError ? <OrgError onRetry={() => void rolesQuery.refetch()} /> : null}
      {switchMutation.isError ? (
        <OrgAlert tone="err" title={t(`${K}.switchFailedTitle`)}>
          {t(`${K}.switchFailedBody`)}
        </OrgAlert>
      ) : null}
      {leaveTarget ? (
        <OrgAlert tone="warn" title={t(`${K}.leaveTitle`, { name: displayName(leaveTarget) })}>
          <span className="block">{t(`${K}.leaveBody`)}</span>
          <span className="block font-semibold">{t(`${K}.leaveUnavailable`)}</span>
          <OrgButton variant="secondary" className="mt-2" onClick={() => setLeaveTarget(null)}>
            {t(`${K}.cancel`)}
          </OrgButton>
        </OrgAlert>
      ) : null}
      <OrgCard title={t(`${K}.listTitle`, { n: memberships.length })}>
        {rolesQuery.isLoading ? (
          <OrgLoading />
        ) : (
          <OrgTable
            columns={columns}
            rows={memberships}
            rowKey={(org) => org.tenantId}
            caption={t(`${K}.listTitle`, { n: memberships.length })}
            empty={
              <OrgEmpty title={t(`${K}.noOrganizations`)}>{t(`${K}.noOrganizationsBody`)}</OrgEmpty>
            }
          />
        )}
        <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.ownerNote`)}</p>
      </OrgCard>
      <OrgRow align="start">
        <OrgCard title={t(`${K}.pendingInvitations`)} className="lg:flex-1">
          <OrgEmpty title={t(`${K}.noPendingInvitations`)}>
            {t(`${K}.pendingInvitationsBody`)}
          </OrgEmpty>
        </OrgCard>
        <OrgCard title={t(`${K}.howAccessWorks`)} className="lg:flex-1">
          <ul className="m-0 flex list-none flex-col gap-3 p-0 text-sm leading-5">
            <li>{t(`${K}.ruleInvitations`)}</li>
            <li>{t(`${K}.ruleRoles`)}</li>
            <li>{t(`${K}.ruleIsolation`)}</li>
            <li>{t(`${K}.ruleSwitching`)}</li>
          </ul>
        </OrgCard>
      </OrgRow>
      <p className="te-caption m-0">
        <OrgLink slug="organization-profile-settings-and-branding">
          {t(`${K}.backToSettings`)}
        </OrgLink>{" "}
        ·{" "}
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
