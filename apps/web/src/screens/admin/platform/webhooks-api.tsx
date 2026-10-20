// SCR-ADM-42 Webhooks & API (docs/design/web/AdmWebhooks.dc.html): the deprecated API version
// banner, delivery volume, platform outbound endpoints, the event catalog and per-organization
// endpoint health. The event catalog is real — WEBHOOK_EVENT_TYPE lookups serve it; system
// settings carry the platform configuration fields the page repeats. Delivery volume, outbound
// endpoint registry and per-organization endpoint health have no store yet and say so.
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { AdminButton } from "../common/admin-actions";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminGrid,
  AdminKpi,
  AdminPage,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";

const K = "screen.admin.platform.webhooksApi";

interface EventRow {
  code: string;
  name: string;
  description: string;
}

export function WebhooksApi() {
  const { status: authStatus, locale } = useAuth();
  const settingsQuery = useQuery({
    ...serverQueryOptions(orpc.admin.getSystemSettings, "admin/getSystemSettings", {
      input: undefined,
    }),
    enabled: authStatus === "authenticated",
  });
  const eventsQuery = useQuery({
    ...serverQueryOptions(orpc.lookups.getByTypeCodes, "lookups/getByTypeCodes", {
      input: { codes: ["WEBHOOK_EVENT_TYPE"] },
    }),
    enabled: authStatus === "authenticated",
  });

  const events: readonly EventRow[] = (
    eventsQuery.data?.lookupTypes.WEBHOOK_EVENT_TYPE?.items ?? []
  )
    .map((item) => ({
      code: item.code,
      name: item.code,
      description: (locale === "ar" ? item.description?.ar : item.description?.en) || item.code,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  const eventColumns: readonly AdminColumn<EventRow>[] = [
    { key: "event", header: t(`${K}.eventColumn`), render: (row) => row.name },
    {
      key: "description",
      header: t(`${K}.descriptionColumn`),
      render: (row) => row.description,
      wrap: true,
    },
    {
      key: "payload",
      header: t(`${K}.payloadColumn`),
      render: () => (
        <AdminBadge tone="neutral" icon={false}>
          {t(`${K}.hmacSigned`)}
        </AdminBadge>
      ),
      headerWrap: true,
    },
    {
      key: "subscribers",
      header: t(`${K}.subscribersColumn`),
      render: () => t(`${K}.notRecorded`),
      align: "end",
      headerWrap: true,
    },
  ];

  return (
    <AdminPage
      title={t(`${K}.title`)}
      description={t(`${K}.description`)}
      actions={
        <AdminButton variant="secondary" disabled title={t(`${K}.orgViewNote`)}>
          {t(`${K}.organizationView`)}
        </AdminButton>
      }
    >
      <AdminAlert tone="warning" title={t(`${K}.deprecationTitle`)}>
        {t(`${K}.deprecationBody`)}
        <span className="mt-2 block">
          <AdminButton variant="secondary" small disabled title={t(`${K}.noEmailProcedure`)}>
            {t(`${K}.emailOwners`)}
          </AdminButton>
        </span>
      </AdminAlert>

      <AdminGrid columns={3}>
        <AdminKpi
          label={t(`${K}.kpiEndpoints`)}
          value="—"
          caption={t(`${K}.kpiEndpointsCaption`)}
        />
        <AdminKpi label={t(`${K}.kpiSuccess`)} value="—" caption={t(`${K}.noDeliverySource`)} />
        <AdminKpi label={t(`${K}.kpiFailing`)} value="—" caption={t(`${K}.noDeliverySource`)} />
      </AdminGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NoDeliveryCard
          title={t(`${K}.deliveryVolume`)}
          caption={t(`${K}.deliveryVolumeCaption`)}
        />
        <AdminCard title={t(`${K}.outboundTitle`)} caption={t(`${K}.outboundCaption`)}>
          <AdminEmpty title={t(`${K}.noOutboundTitle`)} description={t(`${K}.noOutboundBody`)} />
        </AdminCard>
      </div>

      <AdminQueryState query={eventsQuery} loadingLabel={t(`${K}.loading`)}>
        <AdminCard
          title={t(`${K}.catalogTitle`, { count: events.length })}
          caption={t(`${K}.catalogCaption`)}
        >
          <AdminTable
            caption={t(`${K}.catalogCaption`)}
            columns={eventColumns}
            rows={events}
            getRowKey={(row) => row.code}
            empty={
              <AdminEmpty
                title={t(`${K}.catalogEmptyTitle`)}
                description={t(`${K}.catalogEmptyBody`)}
              />
            }
          />
        </AdminCard>
      </AdminQueryState>

      <AdminCard
        title={t(`${K}.orgEndpointsTitle`, { count: 0 })}
        caption={t(`${K}.orgEndpointsCaption`)}
      >
        <AdminEmpty
          title={t(`${K}.noOrgEndpointsTitle`)}
          description={t(`${K}.noOrgEndpointsBody`)}
        />
      </AdminCard>

      <AdminCard label={t(`${K}.platformConfigLabel`)}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--te-hairline)] py-2.5">
          <span className="te-body">{t(`${K}.minAppVersion`)}</span>
          <span className="te-label">
            {settingsQuery.data?.maintenanceAndSupport.minMobileAppVersion ?? "—"}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
          <span className="te-body">{t(`${K}.publicApiFlag`)}</span>
          <AdminBadge
            tone={settingsQuery.data?.featureFlags.p6_live_tracking_public_api ? "ok" : "warn"}
            icon={false}
          >
            {settingsQuery.data?.featureFlags.p6_live_tracking_public_api
              ? t(`${K}.flagOn`)
              : t(`${K}.flagOff`)}
          </AdminBadge>
        </div>
      </AdminCard>
    </AdminPage>
  );
}

function NoDeliveryCard({ title, caption }: { title: string; caption: string }) {
  return (
    <AdminCard title={title} caption={caption}>
      <AdminEmpty title={t(`${K}.noDeliveryTitle`)} description={t(`${K}.noDeliveryBody`)} />
    </AdminCard>
  );
}
