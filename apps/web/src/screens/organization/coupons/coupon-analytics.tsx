import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TePlanGate } from "@trips-app/ui/components/te-plan-gate";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface CouponMetricRow {
  id: string;
  code: string;
  redemptions: string;
  discountTotal: string;
  remainingUses: string;
  createdAtIso: string;
}

const COLUMNS = (): readonly TeDataTableColumn<CouponMetricRow>[] => [
  { key: "code", header: t("screen.organization.coupons.couponAnalytics.coupon") },
  {
    key: "redemptions",
    header: t("screen.organization.coupons.couponAnalytics.redemptions"),
    align: "end",
  },
  {
    key: "discountTotal",
    header: t("screen.organization.coupons.couponAnalytics.discountTotal"),
    align: "end",
  },
  {
    key: "remainingUses",
    header: t("screen.organization.coupons.couponAnalytics.remainingUses"),
    align: "end",
  },
];

export function CouponAnalytics() {
  const { status: authStatus } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const couponsQuery = useQuery(
    orpc.coupons.listOrganizationCoupons.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const rows = useMemo<readonly CouponMetricRow[]>(() => {
    if (!couponsQuery.data?.items) return [];
    return couponsQuery.data.items.map((c) => {
      const estimatedDiscountMinor =
        c.discountType === "fixed_amount"
          ? c.discountValue * c.redemptionsCount
          : c.discountValue * 100 * c.redemptionsCount;
      return {
        id: c.id,
        code: c.code,
        redemptions: String(c.redemptionsCount),
        discountTotal: `${(estimatedDiscountMinor / 100).toFixed(2)} ${c.currencyCode}`,
        remainingUses:
          c.maxRedemptions !== null
            ? String(Math.max(0, c.maxRedemptions - c.redemptionsCount))
            : "Unlimited",
        createdAtIso: new Date(c.createdAt).toISOString().slice(0, 10),
      };
    });
  }, [couponsQuery.data?.items]);

  const visibleRows = rows.filter((row) => {
    if (fromDate.trim() && row.createdAtIso < fromDate.trim()) return false;
    if (toDate.trim() && row.createdAtIso > toDate.trim()) return false;
    return true;
  });

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "coupons-list",
            label: t("screen.organization.coupons.couponAnalytics.backToCoupons"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.coupons.couponAnalytics.couponAnalytics")}
          actions={
            <TeButton variant="secondary">
              {t("screen.organization.coupons.couponAnalytics.export")}
            </TeButton>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeInput
            label={t("screen.organization.coupons.couponAnalytics.from")}
            placeholder={t("screen.organization.coupons.couponAnalytics.yyyyMmDd")}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <TeInput
            label={t("screen.organization.coupons.couponAnalytics.to")}
            placeholder={t("screen.organization.coupons.couponAnalytics.yyyyMmDdPlaceholder")}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <OrgSection title={t("screen.organization.coupons.couponAnalytics.coupons")}>
          <TeDataTable
            columns={COLUMNS()}
            rows={visibleRows}
            getRowKey={(row) => row.id}
            caption={t(
              "screen.organization.coupons.couponAnalytics.redemptionsAndDiscountsPerCoupon",
            )}
            emptyTitle={t("screen.organization.coupons.couponAnalytics.noRedemptions")}
            emptyDescription={t(
              "screen.organization.coupons.couponAnalytics.redemptionsAppearHereOnceTravelers",
            )}
          />
        </OrgSection>
        <OrgSection title={t("screen.organization.coupons.couponAnalytics.fullBreakdown")}>
          <TePlanGate
            plan="Enterprise"
            lockedLabel={t("screen.organization.coupons.couponAnalytics.theFullCouponBreakdownIs")}
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
