// Shared pieces of the analytics pages (SCR-ORG-43 to 47): the five report tabs, the plan-view
// badge and the empty state for a metric the backend does not record yet.
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgNavTabs } from "../common/org-form";
import { orgHref, type OrgSlug } from "../common/org-routes";
import { OrgBadge, OrgEmpty } from "../common/org-ui";

export const ANALYTICS_K = "screen.organization.operations.analyticsParts";

/** The five analytics reports, in the artboards' tab order. */
export const ANALYTICS_TABS = [
  { id: "company-analytics", labelKey: `${ANALYTICS_K}.tabCompany` },
  { id: "trip-analytics", labelKey: `${ANALYTICS_K}.tabTrip` },
  { id: "page-analytics", labelKey: `${ANALYTICS_K}.tabPages` },
  { id: "customer-analytics", labelKey: `${ANALYTICS_K}.tabCustomers` },
  { id: "provider-analytics", labelKey: `${ANALYTICS_K}.tabProviders` },
] as const satisfies readonly { id: string; labelKey: string }[];

/** Tab bar that links the analytics pages; the current one is `aria-current`. */
export function AnalyticsTabs({ activeSlug }: { activeSlug: string }) {
  return (
    <OrgNavTabs
      label={t(`${ANALYTICS_K}.tabsLabel`)}
      tabs={ANALYTICS_TABS.map((tab) => ({
        id: tab.id,
        label: t(tab.labelKey),
        href: orgHref(tab.id as OrgSlug),
      }))}
      activeId={activeSlug}
    />
  );
}

/** How much of the report the organization's plan shows; null while unknown. */
export function usePlanViewLabel(): string | null {
  const { status } = useAuth();
  const subscriptionQuery = useQuery({
    ...serverQueryOptions(
      orpc.plans.getOrganizationSubscription,
      "plans/getOrganizationSubscription",
      { input: undefined },
    ),
    enabled: status === "authenticated",
  });
  switch (subscriptionQuery.data?.tier) {
    case "starter":
      return t(`${ANALYTICS_K}.starterLockedPreview`);
    case "growth":
      return t(`${ANALYTICS_K}.growthBasicView`);
    case "enterprise":
      return t(`${ANALYTICS_K}.enterpriseFullView`);
    default:
      return null;
  }
}

/** The caption badge above an analytics title: "Analytics · Basic on Growth plan". */
export function PlanViewBadge({ label }: { label: string | null }): ReactNode {
  if (!label) return null;
  return <OrgBadge tone="info">{label}</OrgBadge>;
}

/** Structure of a metric with no data source yet, stated honestly instead of invented. */
export function NoSourceEmpty({ body }: { body?: string }): ReactNode {
  return (
    <OrgEmpty title={t(`${ANALYTICS_K}.noSourceTitle`)}>
      {body ?? t(`${ANALYTICS_K}.noSourceBody`)}
    </OrgEmpty>
  );
}

/** An upgrade prompt for the parts of a report an Enterprise plan unlocks. */
export function EnterpriseUpgradeCard({ what }: { what: string }): ReactNode {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[var(--te-info-soft)] p-5">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <b className="text-base leading-6 font-semibold">{t(`${ANALYTICS_K}.needsEnterprise`)}</b>
        <span className="text-sm leading-5 text-[var(--te-ink-muted)]">
          {t(`${ANALYTICS_K}.previewWithYourData`)} {what}
        </span>
      </div>
      <OrgBadge tone="acc">{t(`${ANALYTICS_K}.enterpriseBadge`)}</OrgBadge>
    </div>
  );
}

export interface LinePoint {
  /** Value on the y axis, already in display units. */
  value: number;
  /** Short x label, e.g. a month or day number. */
  label: string;
}

const CHART_W = 640;
const CHART_H = 200;
const CHART_PAD = 40;

/** A single-line area chart over the given points, drawn as an accessible `role="img"` SVG. */
export function LineChart({
  points,
  areaLabel,
  valueFormatter,
}: {
  points: readonly LinePoint[];
  areaLabel: string;
  valueFormatter: (value: number) => string;
}): ReactNode {
  if (points.length < 2) return null;
  const max = Math.max(...points.map((point) => point.value), 1);
  const stepX = (CHART_W - CHART_PAD * 2) / (points.length - 1);
  const y = (value: number) => CHART_H - 24 - (value / max) * (CHART_H - 60);
  const coords = points.map((point, index) => ({
    x: CHART_PAD + index * stepX,
    y: y(point.value),
    point,
  }));
  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const polygon = `${CHART_PAD},${CHART_H - 24} ${line} ${(CHART_W - CHART_PAD).toFixed(1)},${CHART_H - 24}`;
  const last = coords[coords.length - 1];
  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      role="img"
      aria-label={areaLabel}
      className="block h-auto w-full"
    >
      <polygon points={polygon} fill="var(--te-ink)" fillOpacity="0.07" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--te-ink)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={last?.x}
        cy={last?.y}
        r="5"
        fill="var(--te-accent)"
        stroke="var(--te-ink)"
        strokeWidth="2"
      />
      <text
        x={(last?.x ?? 0) - 6}
        y={(last?.y ?? 0) - 10}
        fontSize="11"
        fontWeight="700"
        fill="var(--te-ink)"
        textAnchor="end"
      >
        {valueFormatter(last?.point.value ?? 0)}
      </text>
      {coords.map((c, index) =>
        // Label every other tick so a crowded axis stays readable.
        index % Math.ceil(coords.length / 6) === 0 || index === coords.length - 1 ? (
          <text
            key={c.point.label + String(index)}
            x={c.x}
            y={CHART_H - 6}
            fontSize="11"
            fill="var(--te-ink-muted)"
            textAnchor="middle"
          >
            {c.point.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

/** A labelled progress bar (attach rate, occupancy), value shown beside it. */
export function BarRow({
  label,
  value,
  percent,
  tone = "ink",
}: {
  label: ReactNode;
  value: ReactNode;
  percent: number;
  tone?: "ink" | "accent";
}): ReactNode {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex flex-col gap-1 text-sm leading-5">
      <span className="flex flex-wrap justify-between gap-2">
        <span>{label}</span>
        <b>{value}</b>
      </span>
      <span className="block h-2 overflow-hidden rounded-full bg-[var(--te-surface)]">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${width}%`,
            background: tone === "accent" ? "var(--te-accent)" : "var(--te-ink)",
          }}
        />
      </span>
    </div>
  );
}
