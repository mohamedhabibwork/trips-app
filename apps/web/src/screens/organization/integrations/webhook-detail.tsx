// SCR-ORG-60 Webhook endpoint: one endpoint's events, its pause switch and secret rotation.
// The delivery log the design shows has no recording procedure yet, so it renders honestly empty.
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { OrgButtonLink, useOrgParams } from "../common/org-link";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
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
import { INTEGRATION_EVENTS, IntegrationsTabs, integrationEventLabel } from "./integrations-parts";

const K = "screen.organization.integrations.webhookDetail";

export function WebhookDetail(): ReactNode {
  const queryClient = useQueryClient();
  const { endpointId } = useOrgParams();
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
  const configureMutation = useMutation(
    serverMutationOptions(orpc.organization.configureWebhooks, "organization/configureWebhooks", {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: orpc.organization.key(),
        });
      },
    }),
  );

  const [showSecret, setShowSecret] = useState(false);
  const endpoint = (settingsQuery.data?.settings.webhookEndpoints ?? []).find(
    (item) => item.id === endpointId,
  );
  const loaded = settingsQuery.isSuccess;
  const busy = configureMutation.isPending;
  const rotatedSecret = configureMutation.data?.newlyGeneratedSecrets.find(
    (secret) => secret.endpointId === endpointId,
  )?.signingSecret;

  /** The service replaces the whole list, so every other endpoint is sent back unchanged. */
  function saveEndpoint(enabledNext: boolean, rotateSecret: boolean) {
    if (!enabled || !settingsQuery.data) return;
    const settings = settingsQuery.data.settings;
    configureMutation.mutate({
      endpoints: settings.webhookEndpoints.map((item) => ({
        id: item.id,
        url: item.url,
        events: [...item.events],
        enabled: item.id === endpointId ? enabledNext : item.enabled,
        rotateSecret: item.id === endpointId ? rotateSecret : false,
      })),
    });
  }

  if (loaded && !endpoint) {
    return (
      <OrgPage>
        <OrgPageHeader title={t(`${K}.title`)} caption={t(`${K}.caption`)} />
        <IntegrationsTabs activeSlug="webhooks" />
        <OrgEmpty title={t(`${K}.notFound`)}>
          <OrgButtonLink slug="webhooks" variant="secondary">
            {t(`${K}.backToEndpoints`)}
          </OrgButtonLink>
        </OrgEmpty>
      </OrgPage>
    );
  }

  return (
    <OrgPage>
      <OrgPageHeader
        title={<code className="font-mono text-2xl break-all">{endpoint?.url ?? NO_VALUE}</code>}
        caption={t(`${K}.caption`)}
        badge={
          endpoint ? (
            endpoint.enabled ? (
              <OrgBadge tone="ok">{t(`${K}.active`)}</OrgBadge>
            ) : (
              <OrgBadge tone="neu" icon={false}>
                {t(`${K}.paused`)}
              </OrgBadge>
            )
          ) : undefined
        }
        actions={
          <div className="flex flex-wrap gap-3">
            <OrgButton
              variant="secondary"
              disabled={!endpoint || busy}
              onClick={() => saveEndpoint(!endpoint?.enabled, false)}
            >
              {endpoint?.enabled ? t(`${K}.pause`) : t(`${K}.resume`)}
            </OrgButton>
            <OrgButton
              variant="danger"
              disabled={!endpoint || busy}
              onClick={() => saveEndpoint(endpoint?.enabled ?? true, true)}
            >
              {t(`${K}.rotate`)}
            </OrgButton>
          </div>
        }
      />
      <OrgButtonLink slug="webhooks" variant="text" className="-ms-2 self-start">
        {t(`${K}.back`)}
      </OrgButtonLink>
      <IntegrationsTabs activeSlug="webhooks" />
      {configureMutation.isError ? (
        <OrgAlert tone="err" title={t(`${K}.notSavedTitle`)}>
          {t(`${K}.notSavedBody`)}
        </OrgAlert>
      ) : null}
      {rotatedSecret ? (
        <OrgAlert tone="info" title={t(`${K}.newSecretTitle`)}>
          <span className="block">{t(`${K}.newSecretBody`)}</span>
          <code className="mt-1 block font-mono text-sm break-all">{rotatedSecret}</code>
        </OrgAlert>
      ) : null}
      {settingsQuery.isError ? <OrgError onRetry={() => void settingsQuery.refetch()} /> : null}
      {settingsQuery.isLoading ? (
        <OrgLoading rows={6} />
      ) : (
        <>
          <OrgKpiRow>
            <OrgKpi
              label={t(`${K}.kpiEvents`)}
              value={endpoint?.events.length ?? NO_VALUE}
              hint={t(`${K}.subscribedEvents`)}
            />
            <OrgKpi
              label={t(`${K}.kpiState`)}
              value={
                endpoint
                  ? endpoint.enabled
                    ? t(`${K}.stateActive`)
                    : t(`${K}.statePaused`)
                  : NO_VALUE
              }
              hint={endpoint?.enabled ? undefined : t(`${K}.pausedHint`)}
            />
          </OrgKpiRow>
          <OrgRow align="start">
            <OrgCard title={t(`${K}.subscribedEvents`)} className="lg:flex-[2]">
              <ul className="m-0 flex list-none flex-col gap-2 p-0 sm:flex-row sm:flex-wrap">
                {(endpoint?.events ?? []).map((event) => {
                  const known = INTEGRATION_EVENTS.find((item) => item.id === event);
                  return (
                    <li key={event}>
                      <code className="font-mono text-[13px] font-semibold">{event}</code>
                      <span className="te-caption block text-[var(--te-ink-muted)]">
                        {known ? integrationEventLabel(known.id) : t(`${K}.customEvent`)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.eventsHint`)}</p>
            </OrgCard>
            <OrgCard title={t(`${K}.signingSecret`)} className="lg:flex-1">
              <p className="m-0 text-sm leading-5">{t(`${K}.secretIntro`)}</p>
              <code className="block rounded-lg bg-[var(--te-surface)] px-3 py-2 font-mono text-sm break-all">
                {rotatedSecret
                  ? showSecret
                    ? rotatedSecret
                    : t(`${K}.secretMasked`)
                  : showSecret
                    ? t(`${K}.secretRevealUnavailable`)
                    : t(`${K}.secretMaskedInitial`)}
              </code>
              <div>
                <OrgButton variant="secondary" onClick={() => setShowSecret((current) => !current)}>
                  {showSecret ? t(`${K}.hide`) : t(`${K}.reveal`)}
                </OrgButton>
              </div>
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">
                {rotatedSecret ? t(`${K}.secretRotatedNote`) : t(`${K}.secretStoredNote`)}
              </p>
            </OrgCard>
          </OrgRow>
          <OrgCard title={t(`${K}.deliveryLog`)}>
            <OrgEmpty title={t(`${K}.logUnavailableTitle`)}>
              {t(`${K}.logUnavailableBody`)}
            </OrgEmpty>
          </OrgCard>
        </>
      )}
    </OrgPage>
  );
}
