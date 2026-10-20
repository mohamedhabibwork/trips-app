// Shared pieces of the admin analytics pages (SCR-ADM-34..38, docs/design/web/Adm*Analytics.dc.html):
// the five report tabs under /admin/analytics, the date-range and export controls of every header,
// the market pills fed by the enabled markets in system settings, and the honest empty state for a
// metric the backend does not record yet.
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

import { adminPath } from "../common/admin-actions";
import { AdminButton } from "../common/admin-actions";
import { AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminEmpty } from "../common/admin-states";
import { AdminCard } from "../common/admin-ui";

export const ANALYTICS_PARTS_K = "screen.admin.analytics.analyticsParts";

/** The five analytics reports, in the artboards' tab order. */
export const ADMIN_ANALYTICS_TABS = [
  { id: "platform-analytics", labelKey: `${ANALYTICS_PARTS_K}.tabPlatform`, screen: "SCR-ADM-34" },
  {
    id: "companies-analytics",
    labelKey: `${ANALYTICS_PARTS_K}.tabCompanies`,
    screen: "SCR-ADM-35",
  },
  { id: "trips-analytics", labelKey: `${ANALYTICS_PARTS_K}.tabTrips`, screen: "SCR-ADM-37" },
  { id: "pages-analytics", labelKey: `${ANALYTICS_PARTS_K}.tabPages`, screen: "SCR-ADM-38" },
  {
    id: "providers-analytics",
    labelKey: `${ANALYTICS_PARTS_K}.tabProviders`,
    screen: "SCR-ADM-36",
  },
] as const satisfies readonly { id: string; labelKey: string; screen: string }[];

const TAB_CLASS =
  "flex items-center whitespace-nowrap border-b-[3px] px-3.5 py-2.5 text-sm leading-5 no-underline";

/** Tab bar that links the analytics pages; the current one carries `aria-current`. */
export function AnalyticsNavTabs({ activeSlug }: { activeSlug: string }): ReactNode {
  return (
    <nav
      aria-label={t(`${ANALYTICS_PARTS_K}.tabsLabel`)}
      className="flex gap-2 overflow-x-auto border-b border-[var(--te-hairline)]"
    >
      {ADMIN_ANALYTICS_TABS.map((tab) => {
        const isActive = tab.id === activeSlug;
        const className = `${TAB_CLASS} ${
          isActive
            ? "border-[var(--te-accent)] font-bold text-[var(--te-ink)]"
            : "border-transparent font-medium text-[var(--te-ink-muted)] hover:text-[var(--te-ink)]"
        }`;
        const href = adminPath(tab.screen as `SCR-ADM-${string}`);
        return href ? (
          <Link
            key={tab.id}
            to={href}
            aria-current={isActive ? "page" : undefined}
            className={className}
          >
            {t(tab.labelKey)}
          </Link>
        ) : (
          <span key={tab.id} aria-current={isActive ? "page" : undefined} className={className}>
            {t(tab.labelKey)}
          </span>
        );
      })}
    </nav>
  );
}

/** Header controls every analytics artboard repeats: the range select and the CSV export. */
export function AnalyticsHeaderActions({
  range,
  onRangeChange,
  rangeOptions,
  exportLabel,
}: {
  range: string;
  onRangeChange: (value: string) => void;
  rangeOptions: readonly AdminOption[];
  exportLabel: string;
}): ReactNode {
  return (
    <>
      <AdminSelect
        label={t(`${ANALYTICS_PARTS_K}.dateRange`)}
        options={rangeOptions}
        value={range}
        onValueChange={onRangeChange}
        className="w-full sm:w-[260px]"
      />
      {/* No export procedure exists yet, so the button stays unavailable. */}
      <AdminButton variant="primary" disabled title={t(`${ANALYTICS_PARTS_K}.exportUnavailable`)}>
        {exportLabel}
      </AdminButton>
    </>
  );
}

export interface MarketOption {
  code: string;
  name: string;
}

/** The enabled markets of system settings, as the pills' options ("All markets" first). */
export function useEnabledMarkets(): readonly MarketOption[] {
  const { status: authStatus, locale } = useAuth();
  const settingsQuery = useQuery({
    ...serverQueryOptions(orpc.admin.getSystemSettings, "admin/getSystemSettings", {
      input: undefined,
    }),
    enabled: authStatus === "authenticated",
  });
  return Object.values(settingsQuery.data?.markets ?? {})
    .filter((market) => market.enabled)
    .map((market) => ({
      code: market.countryCode,
      name: (locale === "ar" ? market.nameAr : market.nameEn) || market.countryCode,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The country pill group the analytics artboards draw under the tabs. */
export function MarketPills({
  markets,
  value,
  onChange,
}: {
  markets: readonly MarketOption[];
  value: string;
  onChange: (code: string) => void;
}): ReactNode {
  const pill = (code: string, label: string) => (
    <button
      key={code}
      type="button"
      aria-pressed={value === code}
      onClick={() => onChange(code)}
      className={`h-10 rounded-full px-3.5 text-sm leading-5 font-semibold ${
        value === code
          ? "bg-[var(--te-ink)] text-[var(--te-surface)]"
          : "bg-transparent text-[var(--te-ink)] hover:bg-[var(--te-hairline)]"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div
      role="group"
      aria-label={t(`${ANALYTICS_PARTS_K}.marketGroup`)}
      className="mb-2 flex flex-wrap gap-1 rounded-full bg-[var(--te-surface-raised)] p-1"
    >
      {pill("all", t(`${ANALYTICS_PARTS_K}.allMarkets`))}
      {markets.map((market) => pill(market.code, market.name))}
    </div>
  );
}

/** Structure of a metric with no data source yet, stated honestly instead of invented. */
export function AnalyticsNoSource({ body }: { body?: string }): ReactNode {
  return (
    <AdminEmpty
      title={t(`${ANALYTICS_PARTS_K}.noSourceTitle`)}
      description={body ?? t(`${ANALYTICS_PARTS_K}.noSourceBody`)}
    />
  );
}

/** A design section whose metric has no source, rendered as a card with the honest empty state. */
export function NoSourceCard({
  title,
  caption,
  body,
}: {
  title: string;
  caption?: string;
  body?: string;
}): ReactNode {
  return (
    <AdminCard title={title} caption={caption}>
      <AnalyticsNoSource body={body} />
    </AdminCard>
  );
}
