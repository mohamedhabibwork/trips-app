// SCR-ORG-59 Add webhook endpoint: URL and events for a new delivery endpoint. Saving replaces the
// endpoint list through `configureWebhooks`; the signing secret is shown once in the response.
import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { trackEvent } from "@/utils/analytics";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { OrgChoice, OrgInput } from "../common/org-form";
import { OrgButtonLink, useOrgNavigate } from "../common/org-link";
import {
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import {
  INTEGRATION_EVENTS,
  INTEGRATIONS_K,
  IntegrationsTabs,
  integrationEventLabel,
  type IntegrationEventId,
} from "./integrations-parts";

const K = "screen.organization.integrations.webhookNew";
const FORM_ID = "webhook-new-form";

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function WebhookNew(): ReactNode {
  const queryClient = useQueryClient();
  const navigate = useOrgNavigate();
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
        trackEvent("webhook_configured", { surface: "organization" });
        void queryClient.invalidateQueries({
          queryKey: orpc.organization.key(),
        });
        navigate("webhooks");
      },
      onError: () => trackEvent("webhook_config_failed", { surface: "organization" }),
    }),
  );

  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<ReadonlySet<IntegrationEventId>>(
    () => new Set(INTEGRATION_EVENTS.map((event) => event.id)),
  );
  const [submitted, setSubmitted] = useState(false);

  const settings = settingsQuery.data?.settings;
  const busy = configureMutation.isPending;
  const newSecret = configureMutation.data?.newlyGeneratedSecrets[0]?.signingSecret;

  function toggle(event: IntegrationEventId, checked: boolean) {
    setEvents((current) => {
      const next = new Set(current);
      if (checked) next.add(event);
      else next.delete(event);
      return next;
    });
  }

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSubmitted(true);
    if (!enabled || !isHttpsUrl(url.trim()) || events.size === 0 || !settings) return;
    configureMutation.mutate({
      endpoints: [
        ...settings.webhookEndpoints.map((item) => ({
          id: item.id,
          url: item.url,
          events: [...item.events],
          enabled: item.enabled,
        })),
        {
          url: url.trim(),
          events: INTEGRATION_EVENTS.map((event) => event.id).filter((id) => events.has(id)),
          enabled: true,
        },
      ],
    });
  }

  const urlError = submitted && !isHttpsUrl(url.trim()) ? t(`${K}.urlInvalid`) : undefined;
  const eventsError = submitted && events.size === 0;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        actions={
          <OrgButton type="submit" form={FORM_ID} disabled={!enabled || busy}>
            {t(`${K}.create`)}
          </OrgButton>
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
      {newSecret ? (
        <OrgAlert tone="ok" title={t(`${K}.secretTitle`)}>
          <span className="block">{t(`${K}.secretBody`)}</span>
          <code className="mt-1 block font-mono text-sm break-all">{newSecret}</code>
        </OrgAlert>
      ) : null}
      {settingsQuery.isError ? <OrgError onRetry={() => void settingsQuery.refetch()} /> : null}
      {settingsQuery.isLoading ? (
        <OrgLoading rows={6} />
      ) : (
        <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="contents">
          <OrgCard title={t(`${K}.endpointCard`)}>
            <OrgInput
              label={t(`${K}.endpointUrl`)}
              type="url"
              inputMode="url"
              placeholder="https://"
              hint={t(`${K}.urlHint`)}
              value={url}
              onChange={(change) => setUrl(change.target.value)}
              error={urlError}
              fieldClassName="max-w-[560px]"
            />
          </OrgCard>
          <OrgCard title={t(`${K}.eventsCard`)}>
            <fieldset className="m-0 grid gap-x-6 gap-y-2 border-0 p-0 sm:grid-cols-2 lg:grid-cols-3">
              <legend className="sr-only">{t(`${K}.eventsCard`)}</legend>
              {INTEGRATION_EVENTS.map((event) => (
                <OrgChoice
                  key={event.id}
                  type="checkbox"
                  className="min-h-9"
                  checked={events.has(event.id)}
                  onChange={(change) => toggle(event.id, change.target.checked)}
                >
                  <span>
                    <code className="font-mono text-[13px]">{event.id}</code>
                    <span className="te-caption block text-[var(--te-ink-muted)]">
                      {integrationEventLabel(event.id)}
                    </span>
                  </span>
                </OrgChoice>
              ))}
            </fieldset>
            {eventsError ? (
              <p className="te-caption m-0 text-[var(--te-danger)]">{t(`${K}.eventsRequired`)}</p>
            ) : null}
          </OrgCard>
          <OrgRow align="start">
            <OrgCard title={t(`${K}.retriesCard`)} className="lg:flex-1">
              <p className="m-0 text-sm leading-5">{t(`${K}.retriesBody`)}</p>
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.retriesNote`)}</p>
            </OrgCard>
            <OrgCard title={t(`${K}.secretCard`)} className="lg:flex-1">
              <p className="m-0 text-sm leading-5">{t(`${K}.secretIntro`)}</p>
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.secretNote`)}</p>
            </OrgCard>
          </OrgRow>
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t(`${INTEGRATIONS_K}.planUsageNote`)}
          </p>
        </form>
      )}
    </OrgPage>
  );
}
