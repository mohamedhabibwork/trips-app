// SCR-ORG-48 Campaigns: email, SMS, WhatsApp and push to customers who opted in
// (docs/design/web/OrgCampaigns.dc.html). Campaign sending is not backed by a procedure yet, so
// the quota and the list state that honestly; the connect state comes from the settings' CRM
// provider.
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
  OrgCard,
  OrgEmpty,
  OrgKpi,
  OrgKpiRow,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { CrmConnectBadge, CrmTabs } from "./crm-parts";

const K = "screen.organization.crm.campaigns";

interface CampaignRow {
  id: string;
  name: string;
  channel: string;
  segment: string;
  status: string;
}

const CAMPAIGN_COLUMNS: readonly OrgColumn<CampaignRow>[] = [
  { key: "name", header: t(`${K}.colCampaign`) },
  { key: "channel", header: t(`${K}.colChannel`) },
  { key: "segment", header: t(`${K}.colSegment`) },
  { key: "status", header: t(`${K}.colStatus`) },
  { key: "sent", header: t(`${K}.colSent`), align: "end" },
  { key: "open", header: t(`${K}.colOpen`), align: "end" },
  { key: "click", header: t(`${K}.colClick`), align: "end" },
  { key: "bookings", header: t(`${K}.colBookings`), align: "end" },
  { key: "revenue", header: t(`${K}.colRevenue`), align: "end" },
];

export function Campaigns(): ReactNode {
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
  const provider = settingsQuery.data?.settings.crmProvider;
  const connected = Boolean(provider);
  const loaded = settingsQuery.isSuccess;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        actions={<OrgButtonLink slug="crm-campaign-new">{t(`${K}.newCampaign`)}</OrgButtonLink>}
      />
      <CrmTabs activeSlug="crm-campaigns" />
      <OrgKpiRow>
        <OrgKpi
          label={t(`${K}.kpiMessagesThisMonth`)}
          value={NO_VALUE}
          hint={t(`${K}.kpiQuotaNote`)}
        />
        <OrgKpi label={t(`${K}.kpiCampaigns`)} value={0} hint={t(`${K}.kpiCampaignsHint`)} />
      </OrgKpiRow>
      {settingsQuery.isError ? (
        <OrgCard title={t(`${K}.connection`)}>
          <p className="m-0 text-sm text-[var(--te-ink-muted)]">{t(`${K}.settingsUnavailable`)}</p>
        </OrgCard>
      ) : loaded ? (
        connected ? (
          <OrgCard title={t(`${K}.campaignsTitle`)}>
            <OrgTable
              columns={CAMPAIGN_COLUMNS}
              rows={[]}
              rowKey={(row) => row.id}
              caption={t(`${K}.campaignsTitle`)}
              empty={
                <OrgEmpty title={t(`${K}.noCampaignsTitle`)}>{t(`${K}.noCampaignsBody`)}</OrgEmpty>
              }
            />
          </OrgCard>
        ) : (
          <OrgCard title={t(`${K}.connection`)}>
            <OrgEmpty title={t(`${K}.notConnectedTitle`)}>
              {t(`${K}.notConnectedBody`)}
              <span className="mt-1 block">
                <OrgLink slug="crm-and-webhooks">{t(`${K}.openCrmSettings`)}</OrgLink>
              </span>
            </OrgEmpty>
          </OrgCard>
        )
      ) : (
        <OrgLoading rows={4} />
      )}
      <OrgRow align="start">
        <OrgCard title={t(`${K}.attributionTitle`)} className="lg:flex-1">
          <ul className="m-0 flex list-none flex-col gap-3 p-0 text-sm leading-5">
            <li>{t(`${K}.attributionWindow`)}</li>
            <li>{t(`${K}.consentRule`)}</li>
            <li>{t(`${K}.unsubRule`)}</li>
          </ul>
        </OrgCard>
        <OrgCard title={t(`${K}.connectStateTitle`)} className="lg:flex-1">
          <div className="flex flex-col gap-3">
            <CrmConnectBadge />
            <p className="te-caption m-0 text-[var(--te-ink-muted)]">
              {t(`${K}.connectStateNote`)}
            </p>
            <OrgButtonLink slug="crm-segments" variant="secondary">
              {t(`${K}.manageSegments`)}
            </OrgButtonLink>
          </div>
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
