// SCR-ADM-40 Content moderation (docs/design/web/AdmModeration.dc.html): flagged reviews, albums,
// profiles and messages with a review decision per item. The safety-alert queue is real —
// tracking.listSafetyAlerts serves admins — so the Safety tab and its detail panel read it; the
// other flagged-content types have no store yet and their tabs say so. Applying a decision has no
// procedure yet, so the panel states that honestly.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { AdminButton, AdminLink } from "../common/admin-actions";
import { AdminTextarea } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminGrid,
  AdminKpi,
  AdminPage,
  AdminRow,
  AdminSplit,
  type AdminTone,
} from "../common/admin-ui";

const K = "screen.admin.platform.contentModeration";

const QUEUE_TABS = [
  { id: "safety", labelKey: `${K}.tabSafety` },
  { id: "reviews", labelKey: `${K}.tabReviews` },
  { id: "albums", labelKey: `${K}.tabAlbums` },
  { id: "messages", labelKey: `${K}.tabMessages` },
] as const;

type QueueTab = (typeof QUEUE_TABS)[number]["id"];

const SEVERITY_TONE: Record<string, AdminTone> = {
  info: "info",
  warning: "warn",
  critical: "bad",
};

export function ContentModeration() {
  const { status: authStatus, locale } = useAuth();
  const [tab, setTab] = useState<QueueTab>("safety");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const alertsQuery = useQuery({
    ...serverQueryOptions(orpc.tracking.listSafetyAlerts, "tracking/listSafetyAlerts", {
      input: undefined,
    }),
    enabled: authStatus === "authenticated",
  });
  const alerts = alertsQuery.data ?? [];
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;
  const warningCount = alerts.filter((alert) => alert.severity === "warning").length;
  const selected = alerts.find((alert) => alert.id === selectedId) ?? null;

  return (
    <AdminPage title={t(`${K}.title`)} description={t(`${K}.description`)}>
      <div className="flex flex-wrap gap-4">
        <AdminButton variant="link" disabled>
          {t(`${K}.guidelines`)}
        </AdminButton>
        <AdminButton variant="link" disabled>
          {t(`${K}.childSafetyPolicy`)}
        </AdminButton>
        <AdminButton variant="link" disabled>
          {t(`${K}.offPlatformPolicy`)}
        </AdminButton>
      </div>

      <AdminGrid columns={3}>
        <AdminKpi
          label={t(`${K}.kpiOpenSafety`)}
          value={alertsQuery.isSuccess ? alerts.length : "—"}
          caption={t(`${K}.kpiOpenSafetyCaption`)}
        />
        <AdminKpi
          label={t(`${K}.kpiCritical`)}
          value={alertsQuery.isSuccess ? criticalCount : "—"}
          caption={t(`${K}.kpiCriticalCaption`)}
        />
        <AdminKpi
          label={t(`${K}.kpiFlaggedContent`)}
          value="—"
          caption={t(`${K}.kpiFlaggedContentCaption`)}
        />
      </AdminGrid>

      <div
        role="tablist"
        aria-label={t(`${K}.queueTabsLabel`)}
        className="flex gap-2 overflow-x-auto border-b border-[var(--te-hairline)]"
      >
        {QUEUE_TABS.map((queueTab) => {
          const isActive = queueTab.id === tab;
          return (
            <button
              key={queueTab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(queueTab.id)}
              className={`border-b-[3px] px-3.5 py-2.5 text-sm leading-5 font-semibold whitespace-nowrap ${
                isActive
                  ? "border-[var(--te-accent)] text-[var(--te-ink)]"
                  : "border-transparent text-[var(--te-ink-muted)] hover:text-[var(--te-ink)]"
              }`}
            >
              {t(queueTab.labelKey)}
            </button>
          );
        })}
      </div>

      {tab !== "safety" ? (
        <AdminCard title={t(`${K}.queueTitle`, { type: t(`${K}.tab.${tab}`) })}>
          <AdminEmpty title={t(`${K}.noStoreTitle`)} description={t(`${K}.noStoreBody`)} />
        </AdminCard>
      ) : (
        <AdminQueryState query={alertsQuery} loadingLabel={t(`${K}.loading`)}>
          <AdminSplit
            main={
              <AdminCard title={t(`${K}.safetyQueueTitle`)} caption={t(`${K}.safetyQueueCaption`)}>
                {alerts.length === 0 ? (
                  <AdminEmpty
                    title={t(`${K}.queueEmptyTitle`)}
                    description={t(`${K}.queueEmptyBody`)}
                  />
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-1 p-0">
                    {alerts.map((alert) => {
                      const isSelected = alert.id === selected?.id;
                      return (
                        <li key={alert.id}>
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedId(alert.id)}
                            className={`w-full rounded-[var(--te-radius-md)] p-3 text-start ${
                              isSelected
                                ? "bg-[var(--te-info-soft)]"
                                : "hover:bg-[var(--te-surface)]"
                            }`}
                          >
                            <span className="flex flex-wrap items-center gap-2">
                              <AdminBadge
                                tone={SEVERITY_TONE[alert.severity] ?? "info"}
                                icon={false}
                              >
                                {t(`${K}.severity.${alert.severity}`)}
                              </AdminBadge>
                              <b className="te-body">{alert.eventType}</b>
                              {warningCount > 0 && alert.severity === "critical" ? (
                                <span className="te-caption">{t(`${K}.reviewFirst`)}</span>
                              ) : null}
                            </span>
                            <span className="te-caption mt-1 block">
                              {locale === "ar" ? alert.messageAr : alert.messageEn}
                            </span>
                            <span className="te-caption mt-1 block">
                              {t(`${K}.tripRef`, { tripId: alert.tripId })} ·{" "}
                              {new Date(alert.occurredAt).toLocaleString(locale)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </AdminCard>
            }
            side={
              <AdminCard
                title={
                  selected
                    ? t(`${K}.detailTitle`, { type: selected.eventType })
                    : t(`${K}.detailPickTitle`)
                }
              >
                {!selected ? (
                  <AdminEmpty
                    title={t(`${K}.pickItemTitle`)}
                    description={t(`${K}.pickItemBody`)}
                  />
                ) : (
                  <>
                    <AdminRow label={t(`${K}.severityLabel`)}>
                      <AdminBadge tone={SEVERITY_TONE[selected.severity] ?? "info"} icon={false}>
                        {t(`${K}.severity.${selected.severity}`)}
                      </AdminBadge>
                    </AdminRow>
                    <AdminRow label={t(`${K}.tripLabel`)}>
                      <AdminLink screen="SCR-ADM-46" params={{ tripId: selected.tripId }}>
                        {t(`${K}.openTrip`)}
                      </AdminLink>
                    </AdminRow>
                    <AdminRow label={t(`${K}.vehicleLabel`)} last>
                      {selected.vehicleId ?? t(`${K}.notRecorded`)}
                    </AdminRow>
                    <p className="te-body">
                      {locale === "ar" ? selected.messageAr : selected.messageEn}
                    </p>
                    <AdminAlert tone="info" title={t(`${K}.noDecisionTitle`)}>
                      {t(`${K}.noDecisionBody`)}
                    </AdminAlert>
                    <AdminTextarea
                      label={t(`${K}.noteLabel`)}
                      placeholder={t(`${K}.notePlaceholder`)}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                    />
                    <AdminButton variant="primary" disabled title={t(`${K}.noDecisionBody`)}>
                      {t(`${K}.applyDecision`)}
                    </AdminButton>
                  </>
                )}
              </AdminCard>
            }
          />
        </AdminQueryState>
      )}
    </AdminPage>
  );
}
