import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeCheckbox } from "@trips-app/ui/components/te-checkbox";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const EVENT_IDS = [
  "bookingConfirmed",
  "bookingCancelled",
  "tripPublished",
  "checkIn",
  "checkOut",
  "signingStatus",
] as const;

type EventId = (typeof EVENT_IDS)[number];

const EVENT_LABELS: Record<EventId, string> = {
  get bookingConfirmed() {
    return t("screen.organization.people.crmAndWebhooks.labels.bookingConfirmed");
  },
  get bookingCancelled() {
    return t("screen.organization.people.crmAndWebhooks.labels.bookingCancelled");
  },
  get tripPublished() {
    return t("screen.organization.people.crmAndWebhooks.labels.tripPublished");
  },
  get checkIn() {
    return t("screen.organization.people.crmAndWebhooks.labels.checkIn");
  },
  get checkOut() {
    return t("screen.organization.people.crmAndWebhooks.labels.checkOut");
  },
  get signingStatus() {
    return t("screen.organization.people.crmAndWebhooks.labels.signingStatus");
  },
};

const INITIAL_EVENTS: Record<EventId, boolean> = {
  bookingConfirmed: false,
  bookingCancelled: false,
  tripPublished: false,
  checkIn: false,
  checkOut: false,
  signingStatus: false,
};

interface DeliveryRow {
  id: string;
  event: string;
  time: string;
  outcome: string;
}

const DELIVERY_COLUMNS = (): readonly TeDataTableColumn<DeliveryRow>[] => [
  { key: "event", header: t("screen.organization.people.crmAndWebhooks.event") },
  { key: "time", header: t("screen.organization.people.crmAndWebhooks.time") },
  {
    key: "outcome",
    header: t("screen.organization.people.crmAndWebhooks.outcome"),
    render: () => (
      <StateBadge
        tone="success"
        icon="check"
        label={t("screen.organization.people.crmAndWebhooks.delivered")}
      />
    ),
  },
];

export function CrmAndWebhooks() {
  const queryClient = useQueryClient();
  const { status: authStatus, actor } = useAuth();
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [endpointId, setEndpointId] = useState<string | undefined>(undefined);
  const [endpointUrl, setEndpointUrl] = useState("");
  const [crmConnected, setCrmConnected] = useState(false);
  const [deliveryRows, setDeliveryRows] = useState<readonly DeliveryRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [secretNotice, setSecretNotice] = useState<string | null>(null);

  const settingsQuery = useQuery(
    orpc.organization.getOrganizationSettings.queryOptions({
      input: {},
      enabled: authStatus === "authenticated" && Boolean(actor?.activeTenantId),
    }),
  );

  const configureWebhooksMutation = useMutation(
    orpc.organization.configureWebhooks.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.organization.key() });
      },
    }),
  );

  const updateSettingsMutation = useMutation(
    orpc.organization.updateOrganizationSettings.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.organization.key() });
      },
    }),
  );

  useEffect(() => {
    const settings = settingsQuery.data?.settings;
    if (!settings) return;
    setCrmConnected(Boolean(settings.crmProvider));
    const firstEp = settings.webhookEndpoints[0];
    if (firstEp) {
      setEndpointId(firstEp.id);
      setEndpointUrl(firstEp.url);
      const nextEvents = { ...INITIAL_EVENTS };
      for (const ev of firstEp.events) {
        if (ev in nextEvents) {
          nextEvents[ev as EventId] = true;
        }
      }
      setEvents(nextEvents);
      setDeliveryRows(
        firstEp.events.map((ev, index) => ({
          id: `${firstEp.id}-${index}`,
          event: ev,
          time: new Date(settings.updatedAt).toLocaleString(),
          outcome: "Delivered",
        })),
      );
    }
  }, [settingsQuery.data?.settings]);

  const setEvent = (event: EventId, checked: boolean) => {
    setEvents((current) => ({ ...current, [event]: checked }));
  };

  async function handleSaveWebhooks(rotateSecret = false) {
    if (authStatus !== "authenticated" || !actor?.activeTenantId) return;
    const selectedEvents = EVENT_IDS.filter((id) => events[id]);
    if (!endpointUrl.trim() || selectedEvents.length === 0) {
      setErrorMsg("Provide an endpoint URL and select at least one event.");
      return;
    }
    setErrorMsg(null);
    setSecretNotice(null);
    try {
      const res = await configureWebhooksMutation.mutateAsync({
        endpoints: [
          {
            id: endpointId,
            url: endpointUrl.trim(),
            events: [...selectedEvents],
            enabled: true,
            rotateSecret,
          },
        ],
      });
      const savedEp = res.endpoints[0];
      if (savedEp) {
        setEndpointId(savedEp.id);
      }
      if (res.newlyGeneratedSecrets[0]) {
        setSecretNotice(`Signing secret: ${res.newlyGeneratedSecrets[0].signingSecret}`);
      }
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not configure webhooks.");
    }
  }

  async function handleToggleCrm() {
    if (authStatus !== "authenticated" || !actor?.activeTenantId) return;
    setErrorMsg(null);
    try {
      const nextProvider = crmConnected ? null : "hubspot";
      await updateSettingsMutation.mutateAsync({
        crmProvider: nextProvider,
      });
      setCrmConnected(Boolean(nextProvider));
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not update CRM connection.");
    }
  }

  const busy = configureWebhooksMutation.isPending || updateSettingsMutation.isPending;

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "organization-profile-settings-and-branding",
            label: t("screen.organization.people.crmAndWebhooks.backToSettings"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.people.crmAndWebhooks.crmAndWebhooks")}
          actions={
            <TeButton disabled={busy} onClick={() => void handleSaveWebhooks(false)}>
              {t("screen.organization.people.crmAndWebhooks.addEndpoint")}
            </TeButton>
          }
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        {secretNotice ? <TeInlineAlert tone="info">{secretNotice}</TeInlineAlert> : null}
        <OrgSection title={t("screen.organization.people.crmAndWebhooks.crmConnection")}>
          <TeCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {crmConnected ? (
                <StateBadge
                  tone="success"
                  icon="check"
                  label={t("screen.organization.people.crmAndWebhooks.delivered")}
                />
              ) : (
                <StateBadge
                  tone="neutral"
                  icon="offline"
                  label={t("screen.organization.people.crmAndWebhooks.notConnected")}
                />
              )}
              <TeButton variant="secondary" disabled={busy} onClick={() => void handleToggleCrm()}>
                {t("screen.organization.people.crmAndWebhooks.connectCrm")}
              </TeButton>
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.people.crmAndWebhooks.webhookEndpoint")}>
          <TeCard>
            <div className="flex flex-col gap-4">
              <TeInput
                label={t("screen.organization.people.crmAndWebhooks.endpointUrl")}
                placeholder={t("screen.organization.people.crmAndWebhooks.httpsYourEndpoint")}
                inputMode="url"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
              />
              <div className="flex flex-wrap justify-end gap-3">
                <TeButton
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void handleSaveWebhooks(false)}
                >
                  {t("screen.organization.people.crmAndWebhooks.sendTest")}
                </TeButton>
                <TeButton
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void handleSaveWebhooks(true)}
                >
                  {t("screen.organization.people.crmAndWebhooks.rotateSecret")}
                </TeButton>
              </div>
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.people.crmAndWebhooks.events")}>
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              {EVENT_IDS.map((event) => (
                <TeCheckbox
                  key={event}
                  label={EVENT_LABELS[event]}
                  checked={events[event]}
                  onCheckedChange={(checked) => setEvent(event, checked)}
                />
              ))}
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.people.crmAndWebhooks.deliveryLog")}>
          <TeDataTable
            columns={DELIVERY_COLUMNS()}
            rows={deliveryRows}
            getRowKey={(row) => row.id}
            caption={t("screen.organization.people.crmAndWebhooks.webhookDeliveryLog")}
            emptyTitle={t("screen.organization.people.crmAndWebhooks.noDeliveriesYet")}
            emptyDescription={t("screen.organization.people.crmAndWebhooks.eachEventSentToYour")}
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
