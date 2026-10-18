// SCR-ORG-36 CRM and webhooks: connect a CRM and send signed events to the organization's system.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgTable } from "../common/org-table";
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

/** The CRM the one-click connection sets up. */
const DEFAULT_CRM_PROVIDER = "hubspot";

export function CrmAndWebhooks() {
  const queryClient = useQueryClient();
  const { status: authStatus, actor } = useAuth();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const settingsQuery = useQuery(
    orpc.organization.getOrganizationSettings.queryOptions({ input: {}, enabled }),
  );
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.organization.key() });
  };
  const configureWebhooksMutation = useMutation(
    orpc.organization.configureWebhooks.mutationOptions({ onSuccess: invalidate }),
  );
  const updateSettingsMutation = useMutation(
    orpc.organization.updateOrganizationSettings.mutationOptions({ onSuccess: invalidate }),
  );

  const settings = settingsQuery.data?.settings;
  const endpoint = settings?.webhookEndpoints[0] ?? null;
  const crmConnected = Boolean(settings?.crmProvider);
  const busy = configureWebhooksMutation.isPending || updateSettingsMutation.isPending;
  const newSecret = configureWebhooksMutation.data?.newlyGeneratedSecrets[0]?.signingSecret;

  function saveEndpoint(values: WebhookValues, rotateSecret: boolean) {
    if (!enabled) return;
    configureWebhooksMutation.mutate({
      endpoints: [
        {
          id: endpoint?.id,
          url: values.url,
          events: [...values.events],
          enabled: true,
          rotateSecret,
        },
      ],
    });
  }

  function toggleCrm() {
    if (!enabled) return;
    updateSettingsMutation.mutate({ crmProvider: crmConnected ? null : DEFAULT_CRM_PROVIDER });
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
                <div>
                  <OrgButton variant="secondary" disabled={!enabled || busy} onClick={toggleCrm}>
                    {crmConnected
                      ? t("screen.organization.people.crmAndWebhooks.disconnectCrm")
                      : t("screen.organization.people.crmAndWebhooks.connectCrm")}
                  </OrgButton>
                </div>
              </OrgCard>
            }
          />
          <OrgCard title={t("screen.organization.people.crmAndWebhooks.deliveryLog")}>
            <OrgTable
              columns={[
                { key: "time", header: t("screen.organization.people.crmAndWebhooks.time") },
                { key: "event", header: t("screen.organization.people.crmAndWebhooks.event") },
                { key: "outcome", header: t("screen.organization.people.crmAndWebhooks.outcome") },
                {
                  key: "attempts",
                  header: t("screen.organization.people.crmAndWebhooks.attempts"),
                },
              ]}
              rows={[]}
              rowKey={() => ""}
              caption={t("screen.organization.people.crmAndWebhooks.deliveryLog")}
              empty={
                <OrgEmpty title={t("screen.organization.people.crmAndWebhooks.noDeliveriesTitle")}>
                  {t("screen.organization.people.crmAndWebhooks.noDeliveriesBody")}
                </OrgEmpty>
              }
            />
          </OrgCard>
        </>
      )}
    </OrgPage>
  );
}
