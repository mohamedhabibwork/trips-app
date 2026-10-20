// SCR-ORG-36 CRM and webhooks: connect a CRM and send signed events to the organization's system.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import {
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";

import { WEBHOOK_FORM_ID, WebhookForm, type WebhookValues } from "./webhook-form";

export function CrmAndWebhooks() {
  const queryClient = useQueryClient();
  const { status: authStatus, actor } = useAuth();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const settingsQuery = useQuery(
    serverQueryOptions(
      orpc.organization.getOrganizationSettings,
      "organization/getOrganizationSettings",
      { input: {}, enabled },
    ),
  );
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.organization.key() });
  };
  const configureWebhooksMutation = useMutation(
    serverMutationOptions(orpc.organization.configureWebhooks, "organization/configureWebhooks", {
      onSuccess: invalidate,
    }),
  );
  const updateSettingsMutation = useMutation(
    serverMutationOptions(
      orpc.organization.updateOrganizationSettings,
      "organization/updateOrganizationSettings",
      { onSuccess: invalidate },
    ),
  );

  const settings = settingsQuery.data?.settings;
  const endpoint = settings?.webhookEndpoints[0] ?? null;
  const crmConnected = Boolean(settings?.crmProvider);
  const busy = configureWebhooksMutation.isPending || updateSettingsMutation.isPending;
  const newSecret = configureWebhooksMutation.data?.newlyGeneratedSecrets.find(
    (secret) => !endpoint || secret.endpointId === endpoint.id,
  )?.signingSecret;

  // The service replaces the whole list, so every other endpoint is sent back unchanged.
  function saveEndpoint(values: WebhookValues, rotateSecret: boolean) {
    if (!enabled) return;
    const others = (settings?.webhookEndpoints ?? [])
      .filter((item) => item.id !== endpoint?.id)
      .map((item) => ({
        id: item.id,
        url: item.url,
        events: [...item.events],
        enabled: item.enabled,
      }));
    configureWebhooksMutation.mutate({
      endpoints: [
        {
          id: endpoint?.id,
          url: values.url,
          events: [...values.events],
          enabled: true,
          rotateSecret,
        },
        ...others,
      ],
    });
  }

  // Connecting a CRM needs the provider's sign-in, which no procedure offers yet; a connection
  // saved earlier can still be removed.
  function disconnectCrm() {
    if (!enabled) return;
    updateSettingsMutation.mutate({ crmProvider: null });
  }

  const failed = configureWebhooksMutation.isError || updateSettingsMutation.isError;

  return (
    <OrgPage className="gap-5">
      <OrgPageHeader
        title={t("screen.organization.people.crmAndWebhooks.title")}
        caption={t("screen.organization.people.crmAndWebhooks.caption")}
        actions={
          <OrgButton type="submit" form={WEBHOOK_FORM_ID} disabled={!enabled || busy}>
            {endpoint
              ? t("screen.organization.people.crmAndWebhooks.saveEndpoint")
              : t("screen.organization.people.crmAndWebhooks.addEndpoint")}
          </OrgButton>
        }
      />
      {failed ? (
        <OrgAlert tone="err" title={t("screen.organization.people.crmAndWebhooks.notSavedTitle")}>
          {t("screen.organization.people.crmAndWebhooks.notSavedBody")}
        </OrgAlert>
      ) : null}
      {newSecret ? (
        <OrgAlert tone="info" title={t("screen.organization.people.crmAndWebhooks.newSecretTitle")}>
          <span className="block">
            {t("screen.organization.people.crmAndWebhooks.newSecretBody")}
          </span>
          <code className="mt-1 block break-all font-mono text-sm">{newSecret}</code>
        </OrgAlert>
      ) : null}
      {settingsQuery.isError ? <OrgError onRetry={() => void settingsQuery.refetch()} /> : null}
      {settingsQuery.isLoading ? (
        <OrgLoading rows={6} />
      ) : (
        <>
          <WebhookForm
            key={settingsQuery.dataUpdatedAt}
            endpoint={endpoint}
            disabled={!enabled || busy}
            onSave={saveEndpoint}
            crmCard={
              <OrgCard
                title={t("screen.organization.people.crmAndWebhooks.crmConnection")}
                actions={
                  crmConnected ? (
                    <OrgBadge tone="ok">
                      {t("screen.organization.people.crmAndWebhooks.connected")}
                    </OrgBadge>
                  ) : (
                    <OrgBadge tone="neu" icon="offline">
                      {t("screen.organization.people.crmAndWebhooks.notConnected")}
                    </OrgBadge>
                  )
                }
                className="flex-1"
              >
                <p className="m-0">{t("screen.organization.people.crmAndWebhooks.crmBody")}</p>
                {crmConnected ? (
                  <div>
                    <OrgButton
                      variant="secondary"
                      disabled={!enabled || busy}
                      onClick={disconnectCrm}
                    >
                      {t("screen.organization.people.crmAndWebhooks.disconnectCrm")}
                    </OrgButton>
                  </div>
                ) : (
                  <p className="te-caption m-0 text-[var(--te-ink-muted)]">
                    {t("screen.organization.people.crmAndWebhooks.connectUnavailable")}
                  </p>
                )}
              </OrgCard>
            }
          />
          <OrgCard title={t("screen.organization.people.crmAndWebhooks.deliveryLog")}>
            <OrgEmpty
              title={t("screen.organization.people.crmAndWebhooks.deliveryLogUnavailableTitle")}
            >
              {t("screen.organization.people.crmAndWebhooks.deliveryLogUnavailableBody")}
            </OrgEmpty>
          </OrgCard>
        </>
      )}
    </OrgPage>
  );
}
