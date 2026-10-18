// SCR-ORG-29 Coupon analytics: redemptions, discount total and remaining uses for each coupon.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgSelect } from "../common/org-form";
import { OrgLink, useOrgParams } from "../common/org-link";
import { getSelectedCouponId } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgButton,
  OrgEmpty,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";
import {
  CouponStatusBadge,
  downloadCsv,
  planTier,
  remainingUses,
  type CouponStatus,
} from "./coupon-parts";

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<string, number | null> = { all: null, "30": 30, "90": 90, "365": 365 };

interface CouponUse {
  couponId: string | null;
  discountMinor: number;
  createdAt: string | Date;
  status: string;
}

interface MetricRow {
  id: string;
  code: string;
  redemptions: number;
  discountMinor: number;
  currency: string;
  remaining: number | null;
  status: CouponStatus;
}

function toCouponUses(data: unknown): readonly CouponUse[] {
  return Array.isArray(data) ? (data as CouponUse[]).filter((use) => use.couponId) : [];
}

function moneyText(minor: number, currency: string): string {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

function remainingLabel(remaining: number | null): string {
  return remaining === null
    ? t("screen.organization.coupons.couponAnalytics.unlimited")
    : String(remaining);
}

function columns(): readonly OrgColumn<MetricRow>[] {
  return [
    {
      key: "code",
      header: t("screen.organization.coupons.couponAnalytics.coupon"),
      render: (row) => (
        <OrgLink
          slug="coupon-editor"
          params={{ couponId: row.id }}
          className="text-[var(--te-ink)]"
        >
          {row.code}
        </OrgLink>
      ),
    },
    {
      key: "redemptions",
      header: t("screen.organization.coupons.couponAnalytics.redemptions"),
      render: (row) => String(row.redemptions),
    },
    {
      key: "discount",
      header: t("screen.organization.coupons.couponAnalytics.discountTotal"),
      render: (row) => moneyText(row.discountMinor, row.currency),
    },
    {
      key: "remaining",
      header: t("screen.organization.coupons.couponAnalytics.remainingUses"),
      render: (row) => remainingLabel(row.remaining),
    },
    {
      key: "status",
      header: t("screen.organization.coupons.couponAnalytics.status"),
      render: (row) => <CouponStatusBadge status={row.status} endedLabel="expired" />,
    },
  ];
}

export function CouponAnalytics() {
  const { status: authStatus } = useAuth();
  const enabled = authStatus === "authenticated";
  const { couponId: routeCouponId } = useOrgParams();
  const focusId = routeCouponId ?? getSelectedCouponId();
  const [range, setRange] = useState("all");

  const couponsQuery = useQuery({
    ...orpc.coupons.listOrganizationCoupons.queryOptions({ input: {} }),
    enabled,
  });
  const bookingsQuery = useQuery({
    ...orpc.booking.listOrganizationBookings.queryOptions({ input: {} }),
    enabled,
  });
  const subscriptionQuery = useQuery({
    ...orpc.plans.getOrganizationSubscription.queryOptions({ input: undefined }),
    enabled,
  });

  const days = RANGE_DAYS[range] ?? null;
  const since = days === null ? null : Date.now() - days * DAY_MS;
  const uses = toCouponUses(bookingsQuery.data).filter(
    (use) =>
      use.status !== "cancelled" && (since === null || new Date(use.createdAt).getTime() >= since),
  );

  const rows: readonly MetricRow[] =
    couponsQuery.data?.items.map((coupon) => {
      const couponUses = uses.filter((use) => use.couponId === coupon.id);
      return {
        id: coupon.id,
        code: coupon.code,
        redemptions: since === null ? coupon.redemptionsCount : couponUses.length,
        discountMinor: couponUses.reduce((sum, use) => sum + use.discountMinor, 0),
        currency: coupon.currencyCode,
        remaining: remainingUses(coupon),
        status: coupon.status,
      };
    }) ?? [];

  const loaded = couponsQuery.isSuccess && bookingsQuery.isSuccess;
  const currencies = [...new Set(rows.map((row) => row.currency))];
  const totalRedemptions = rows.reduce((sum, row) => sum + row.redemptions, 0);
  const totalDiscount = rows.reduce((sum, row) => sum + row.discountMinor, 0);
  const openRows = rows.filter((row) => row.status !== "expired");
  const totalRemaining = openRows.some((row) => row.remaining === null)
    ? null
    : openRows.reduce((sum, row) => sum + (row.remaining ?? 0), 0);
  const isEnterprise = planTier(subscriptionQuery.data) === "enterprise";

  const rangeOptions = [
    { value: "all", label: t("screen.organization.coupons.couponAnalytics.allTime") },
    { value: "30", label: t("screen.organization.coupons.couponAnalytics.last30Days") },
    { value: "90", label: t("screen.organization.coupons.couponAnalytics.last90Days") },
    { value: "365", label: t("screen.organization.coupons.couponAnalytics.last12Months") },
  ];

  const handleExport = () => {
    downloadCsv(
      [
        [
          t("screen.organization.coupons.couponAnalytics.coupon"),
          t("screen.organization.coupons.couponAnalytics.redemptions"),
          t("screen.organization.coupons.couponAnalytics.discountTotal"),
          t("screen.organization.coupons.couponAnalytics.remainingUses"),
        ],
        ...rows.map((row) => [
          row.code,
          String(row.redemptions),
          moneyText(row.discountMinor, row.currency),
          remainingLabel(row.remaining),
        ]),
      ],
      "coupon-analytics.csv",
    );
  };

  return (
    <OrgPage className="gap-5">
      <OrgPageHeader
        title={t("screen.organization.coupons.couponAnalytics.title")}
        caption={t("screen.organization.coupons.couponAnalytics.caption")}
        actions={
          <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
            <OrgSelect
              label={t("screen.organization.coupons.couponAnalytics.dateRange")}
              options={rangeOptions}
              value={range}
              onValueChange={setRange}
              fieldClassName="w-full sm:min-w-[220px]"
            />
            <OrgButton variant="secondary" disabled={rows.length === 0} onClick={handleExport}>
              {t("screen.organization.coupons.couponAnalytics.export")}
            </OrgButton>
          </div>
        }
      />
      {isEnterprise ? null : (
        <OrgAlert
          tone="info"
          title={t("screen.organization.coupons.couponAnalytics.growthBasicView")}
        >
          {t("screen.organization.coupons.couponAnalytics.enterpriseFullSet")}
        </OrgAlert>
      )}
      <OrgKpiRow>
        <OrgKpi
          label={t("screen.organization.coupons.couponAnalytics.totalRedemptions")}
          value={loaded ? String(totalRedemptions) : NO_VALUE}
        />
        <OrgKpi
          label={t("screen.organization.coupons.couponAnalytics.discountTotal")}
          value={
            loaded && currencies.length === 1
              ? moneyText(totalDiscount, currencies[0] ?? "")
              : NO_VALUE
          }
        />
        <OrgKpi
          label={t("screen.organization.coupons.couponAnalytics.remainingUses")}
          value={loaded ? remainingLabel(totalRemaining) : NO_VALUE}
        />
      </OrgKpiRow>
      {couponsQuery.isError || bookingsQuery.isError ? (
        <OrgError
          onRetry={() => {
            void couponsQuery.refetch();
            void bookingsQuery.refetch();
          }}
        />
      ) : null}
      <OrgTable
        columns={columns()}
        rows={rows}
        rowKey={(row) => row.id}
        caption={t("screen.organization.coupons.couponAnalytics.title")}
        loading={couponsQuery.isLoading}
        rowClassName={(row) => (row.id === focusId ? "bg-[var(--te-info-soft)]" : undefined)}
        empty={
          couponsQuery.isError ? undefined : (
            <OrgEmpty title={t("screen.organization.coupons.couponAnalytics.emptyTitle")}>
              {t("screen.organization.coupons.couponAnalytics.emptyBody")}
            </OrgEmpty>
          )
        }
      />
    </OrgPage>
  );
}
