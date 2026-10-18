import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, OrgLink, WorkspaceBackLink } from "../common/org-link";
import { StateBadge, setSelectedCouponId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

type CouponStatus = "Active" | "Paused";

interface CouponRow {
  id: string;
  code: string;
  type: string;
  value: string;
  status: CouponStatus;
  redemptions: string;
  remainingUses: string;
}

function buildColumns(
  onToggleStatus: (row: CouponRow) => void,
  onRevoke: (row: CouponRow) => void,
): readonly TeDataTableColumn<CouponRow>[] {
  return [
    {
      key: "code",
      header: t("screen.organization.coupons.couponsList.code"),
      render: (row) => (
        <span onClick={() => setSelectedCouponId(row.id)}>
          <OrgLink slug="coupon-editor">{row.code}</OrgLink>
        </span>
      ),
    },
    { key: "type", header: t("screen.organization.coupons.couponsList.type") },
    { key: "value", header: t("screen.organization.coupons.couponsList.value"), align: "end" },
    {
      key: "status",
      header: t("screen.organization.coupons.couponsList.status"),
      render: (row) =>
        row.status === "Active" ? (
          <StateBadge
            tone="success"
            icon="check"
            label={t("screen.organization.coupons.couponsList.active")}
          />
        ) : (
          <StateBadge
            tone="warning"
            icon="clock"
            label={t("screen.organization.coupons.couponsList.paused")}
          />
        ),
    },
    {
      key: "redemptions",
      header: t("screen.organization.coupons.couponsList.redemptions"),
      align: "end",
    },
    {
      key: "remainingUses",
      header: t("screen.organization.coupons.couponsList.remainingUses"),
      align: "end",
    },
    {
      key: "actions",
      header: t("screen.organization.coupons.couponsList.actions"),
      align: "end",
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <TeButton variant="ghost" onClick={() => onToggleStatus(row)}>
            {row.status === "Active"
              ? t("screen.organization.coupons.couponsList.pause")
              : t("screen.organization.coupons.couponsList.resume")}
          </TeButton>
          <TeButton variant="ghost" onClick={() => onRevoke(row)}>
            {t("screen.organization.coupons.couponsList.revoke")}
          </TeButton>
        </div>
      ),
    },
  ];
}

export function CouponsList() {
  const queryClient = useQueryClient();
  const { status: authStatus } = useAuth();
  const [query, setQuery] = useState("");
  const [revokeTarget, setRevokeTarget] = useState<CouponRow | null>(null);

  const couponsQuery = useQuery(
    orpc.coupons.listOrganizationCoupons.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const subscriptionQuery = useQuery(
    orpc.plans.getOrganizationSubscription.queryOptions({
      input: undefined,
      enabled: authStatus === "authenticated",
    }),
  );

  const updateStatusMutation = useMutation(
    orpc.coupons.updateStatus.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
      },
    }),
  );

  const planLimitLabel = useMemo(() => {
    const sub = subscriptionQuery.data;
    if (!sub) return "25";
    const tier = sub.planId.split(":")[1] ?? "growth";
    return tier === "enterprise" ? "Unlimited" : tier === "starter" ? "5" : "25";
  }, [subscriptionQuery.data]);

  const rows = useMemo<readonly CouponRow[]>(() => {
    if (!couponsQuery.data?.items) return [];
    return couponsQuery.data.items.map((c) => ({
      id: c.id,
      code: c.code,
      type: c.discountType,
      value:
        c.discountType === "percentage"
          ? `${c.discountValue}%`
          : `${(c.discountValue / 100).toFixed(2)} ${c.currencyCode}`,
      status: c.status === "active" ? "Active" : "Paused",
      redemptions: String(c.redemptionsCount),
      remainingUses:
        c.maxRedemptions !== null
          ? String(Math.max(0, c.maxRedemptions - c.redemptionsCount))
          : "Unlimited",
    }));
  }, [couponsQuery.data?.items]);

  const handleToggleStatus = (row: CouponRow) => {
    if (authStatus !== "authenticated") return;
    const nextStatus = row.status === "Active" ? "paused" : "active";
    updateStatusMutation.mutate({ couponId: row.id, status: nextStatus });
  };

  const columns = buildColumns(handleToggleStatus, (row) => setRevokeTarget(row));

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter((row) => row.code.toLowerCase().includes(normalizedQuery));

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title={t("screen.organization.coupons.couponsList.couponsList")}
          actions={
            <div className="flex flex-wrap gap-3">
              <OrgButtonLink slug="coupon-analytics" variant="secondary">
                {t("screen.organization.coupons.couponsList.analytics")}
              </OrgButtonLink>
              <span onClick={() => setSelectedCouponId(null)}>
                <OrgButtonLink slug="coupon-editor">
                  {t("screen.organization.coupons.couponsList.createCoupon")}
                </OrgButtonLink>
              </span>
            </div>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile
            label={t("screen.organization.coupons.couponsList.coupons")}
            value={`${rows.length} of ${planLimitLabel}`}
            hint={t("screen.organization.coupons.couponsList.countedTowardYourPlanLimit")}
          />
        </div>
        <TeSearchField
          label={t("screen.organization.coupons.couponsList.searchCoupons")}
          value={query}
          onValueChange={setQuery}
          clearLabel={t("screen.organization.coupons.couponsList.clearSearch")}
        />
        <TeDataTable
          columns={columns}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption={t("screen.organization.coupons.couponsList.couponsCaption")}
          emptyTitle={t("screen.organization.coupons.couponsList.noCouponsYet")}
          emptyDescription={t("screen.organization.coupons.couponsList.createACouponToOffer")}
        />
        <TeDialog
          open={revokeTarget !== null}
          onOpenChange={(open) => {
            if (!open) setRevokeTarget(null);
          }}
          title={t("screen.organization.coupons.couponsList.revokeThisCoupon")}
          description={t("screen.organization.coupons.couponsList.travelersCanNoLongerUse")}
          primaryLabel={t("screen.organization.coupons.couponsList.revokePrimaryLabel")}
          onPrimary={() => {
            if (authStatus === "authenticated" && revokeTarget) {
              updateStatusMutation.mutate({ couponId: revokeTarget.id, status: "expired" });
            }
            setRevokeTarget(null);
          }}
          secondaryLabel={t("screen.organization.coupons.couponsList.keepCoupon")}
          onSecondary={() => setRevokeTarget(null)}
          tone="danger"
        />
      </div>
    </StatePreview>
  );
}
