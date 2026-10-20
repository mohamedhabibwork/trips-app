// SCR-ORG-58 Webhooks: the organization's delivery endpoints, their status and the event catalog.
// Endpoints live in the organization settings and are edited through `configureWebhooks`.
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgButtonLink, OrgLink } from "../common/org-link";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgBadge,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import {
  DeliveryRules,
  INTEGRATION_EVENTS,
  INTEGRATIONS_K,
  IntegrationsTabs,
  integrationEventLabel,
  integrationGroupLabel,
} from "./integrations-parts";

const K = "screen.organization.integrations.webhooks";

interface EndpointRow {
  id: string;
  url: string;
  eventsCount: string;
  enabled: boolean;
}

function endpointColumns(): readonly OrgColumn<EndpointRow>[] {
  return [
    {
      key: "url",
      header: t(`${K}.endpoint`),
      render: (row) => (
        <span className="flex min-w-0 flex-col gap-0.5">
          <code className="font-mono text-[13px] font-semibold break-all">{row.url}</code>
          <span className="te-caption text-[var(--te-ink-muted)]">{row.eventsCount}</span>
        </span>
      ),
    },
    {
      key: "enabled",
      header: t(`${K}.status`),
      render: (row) =>
        row.enabled ? (
          <OrgBadge tone="ok">{t(`${K}.active`)}</OrgBadge>
        ) : (
          <OrgBadge tone="neu" icon={false}>
            {t(`${K}.paused`)}
          </OrgBadge>
        ),
    },
    {
      key: "open",
      header: t(`${K}.open`),
      align: "end",
      hiddenHeader: true,
      render: (row) => (
        <OrgLink slug="webhook-detail" params={{ endpointId: row.id }} className="text-[13px]">
          {t(`${K}.open`)}
        </OrgLink>
      ),
    },
  ];
}

export function WebhooksList(): ReactNode {
  const { status: authStatus, actor } = useAuth();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const settingsQuery = useQuery({
    ...serverQueryOptions(
      orpc.organization.getOrganizationSettings,
      "organization/getOrganizationSettings",
      {
        input: {},
      },
    ),
    enabled,
  });

  const endpoints = settingsQuery.data?.settings.webhookEndpoints ?? [];
  const activeCount = endpoints.filter((endpoint) => endpoint.enabled).length;
  const loaded = settingsQuery.isSuccess;

  const rows: readonly EndpointRow[] = endpoints.map((endpoint) => ({
    id: endpoint.id,
    url: endpoint.url,
    eventsCount: t(`${K}.nEvents`, { n: endpoint.events.length }),
    enabled: endpoint.enabled,
  }));

  const groups = [...new Set(INTEGRATION_EVENTS.map((event) => event.group))];

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        actions={<OrgButtonLink slug="webhook-new">{t(`${K}.addEndpoint`)}</OrgButtonLink>}
      />
      <IntegrationsTabs activeSlug="webhooks" />
      {settingsQuery.isError ? <OrgError onRetry={() => void settingsQuery.refetch()} /> : null}
      <OrgKpiRow>
        <OrgKpi
          label={t(`${K}.kpiEndpoints`)}
          value={loaded ? endpoints.length : NO_VALUE}
          hint={t(`${K}.nActive`, { n: activeCount })}
        />
        <OrgKpi
          label={t(`${K}.kpiEvents`)}
          value={INTEGRATION_EVENTS.length}
          hint={t(`${K}.eventsAcrossGroups`, { n: groups.length })}
        />
      </OrgKpiRow>
      <OrgCard title={t(`${K}.endpoints`)}>
        {settingsQuery.isLoading ? (
          <OrgLoading />
        ) : (
          <OrgTable
            columns={endpointColumns()}
            rows={rows}
            rowKey={(row) => row.id}
            caption={t(`${K}.endpoints`)}
            empty={<OrgEmpty title={t(`${K}.noEndpoints`)}>{t(`${K}.noEndpointsBody`)}</OrgEmpty>}
          />
        )}
        <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.signingNote`)}</p>
      </OrgCard>
      <OrgRow align="start">
        <OrgCard title={t(`${INTEGRATIONS_K}.planUsage`)} className="lg:flex-1">
          <p className="m-0 text-sm leading-5">
            {t(`${INTEGRATIONS_K}.endpointsUsed`, { n: activeCount })}
          </p>
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t(`${INTEGRATIONS_K}.planUsageNote`)}
          </p>
          <OrgButtonLink slug="subscription-and-billing" variant="text" className="-ms-2">
            {t(`${INTEGRATIONS_K}.comparePlans`)}
          </OrgButtonLink>
        </OrgCard>
        <DeliveryRules />
      </OrgRow>
      <OrgCard title={t(`${K}.eventCatalog`)}>
        <p className="m-0 text-sm text-[var(--te-ink-muted)]">{t(`${K}.eventCatalogIntro`)}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group}
              className="flex flex-col gap-2 rounded-xl border border-[var(--te-hairline)] p-4"
            >
              <b>{integrationGroupLabel(group)}</b>
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {INTEGRATION_EVENTS.filter((event) => event.group === group).map((event) => (
                  <li key={event.id}>
                    <code className="font-mono text-[13px]">{event.id}</code>
                    <span className="te-caption block text-[var(--te-ink-muted)]">
                      {integrationEventLabel(event.id)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </OrgCard>
    </OrgPage>
  );
}
