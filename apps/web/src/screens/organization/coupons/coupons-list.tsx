// SCR-ORG-27 Coupons: the organization's coupons, plan usage, and pause, resume or revoke.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgChips } from "../common/org-form";
import { OrgButtonLink, OrgLink } from "../common/org-link";
import { setSelectedCouponId } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
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
  NEW_COUPON_ID,
  countedText,
  couponPlanLimit,
  couponTypeText,
  couponValueText,
  remainingText,
  type CouponStatus,
} from "./coupon-parts";

interface CouponRow {
  id: string;
  code: string;
  type: string;
  value: string;
  status: CouponStatus;
  redemptions: number;
  remaining: string;
}

interface BookingCouponUse {
  couponId: string | null;
  createdAt: string | Date;
  status: string;
}

function redemptionsThisMonth(data: unknown): number {
  const bookings = Array.isArray(data) ? (data as BookingCouponUse[]) : [];
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  return bookings.filter(
    (booking) =>
      booking.couponId &&
      booking.status !== "cancelled" &&
      new Date(booking.createdAt).getTime() >= monthStart.getTime(),
  ).length;
}

interface ColumnActions {
  onToggle: (row: CouponRow) => void;
  onRevoke: (row: CouponRow) => void;
  busy: boolean;
}

function buildColumns({
  onToggle,
  onRevoke,
  busy,
}: ColumnActions): readonly OrgColumn<CouponRow>[] {
  return [
    {
      key: "code",
      header: t("screen.organization.coupons.couponsList.code"),
      render: (row) => (
        <OrgLink
          slug="coupon-editor"
          params={{ couponId: row.id }}
          className="text-[var(--te-ink)]"
          onClick={() => setSelectedCouponId(row.id)}
        >
          {row.code}
        </OrgLink>
      ),
    },
    { key: "type", header: t("screen.organization.coupons.couponsList.type") },
    { key: "value", header: t("screen.organization.coupons.couponsList.value") },
    {
      key: "status",
      header: t("screen.organization.coupons.couponsList.status"),
      render: (row) => <CouponStatusBadge status={row.status} />,
    },
    {
      key: "redemptions",
      header: t("screen.organization.coupons.couponsList.redemptions"),
      render: (row) => String(row.redemptions),
    },
    { key: "remaining", header: t("screen.organization.coupons.couponsList.remainingUses") },
    {
      key: "action",
      header: t("screen.organization.coupons.couponsList.action"),
      render: (row) =>
        row.status === "expired" ? (
          t("screen.organization.coupons.couponsList.none")
        ) : (
          <div className="flex flex-wrap gap-1">
            <OrgButton variant="text" disabled={busy} onClick={() => onToggle(row)}>
              {row.status === "active"
                ? t("screen.organization.coupons.couponsList.pause")
                : t("screen.organization.coupons.couponsList.resume")}
            </OrgButton>
            <OrgButton variant="text" disabled={busy} onClick={() => onRevoke(row)}>
              {t("screen.organization.coupons.couponsList.revoke")}
            </OrgButton>
          </div>
        ),
    },
  ];
}

export function CouponsList() {
  const queryClient = useQueryClient();
  const { status: authStatus } = useAuth();
  const enabled = authStatus === "authenticated";
  const [filter, setFilter] = useState<string>("all");
  const [revokeTarget, setRevokeTarget] = useState<CouponRow | null>(null);

  const couponsQuery = useQuery({
    ...orpc.coupons.listOrganizationCoupons.queryOptions({ input: {} }),
    enabled,
  });
  const subscriptionQuery = useQuery({
    ...orpc.plans.getOrganizationSubscription.queryOptions({ input: undefined }),
    enabled,
  });
  const bookingsQuery = useQuery({
    ...orpc.booking.listOrganizationBookings.queryOptions({ input: {} }),
    enabled,
  });

  const updateStatusMutation = useMutation(
    orpc.coupons.updateStatus.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
      },
    }),
  );

  const rows: readonly CouponRow[] =
    couponsQuery.data?.items.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      type: couponTypeText(coupon),
      value: couponValueText(coupon),
      status: coupon.status,
      redemptions: coupon.redemptionsCount,
      remaining: remainingText(coupon, coupon.status),
    })) ?? [];
  const loaded = couponsQuery.isSuccess;
  const counted = loaded ? rows.filter((row) => row.status !== "expired").length : null;
  const limit = couponPlanLimit(subscriptionQuery.data);
  const visible = rows.filter((row) => filter === "all" || row.status === filter);

  const filterOptions = [
    { value: "all", label: t("screen.organization.coupons.couponsList.all") },
    { value: "active", label: t("screen.organization.coupons.couponsList.active") },
    { value: "paused", label: t("screen.organization.coupons.couponsList.paused") },
    { value: "expired", label: t("screen.organization.coupons.couponsList.revoked") },
  ];

  const createLink = (variant: "primary" | "secondary") => (
    <OrgButtonLink
      slug="coupon-editor"
      params={{ couponId: NEW_COUPON_ID }}
      variant={variant}
      onClick={() => setSelectedCouponId(null)}
    >
      {t("screen.organization.coupons.couponsList.createCoupon")}
    </OrgButtonLink>
  );

  return (
    <OrgPage className="gap-5">
      <OrgPageHeader
        title={t("screen.organization.coupons.couponsList.title")}
        caption={t("screen.organization.coupons.couponsList.caption", {
          counted: countedText(counted, limit),
        })}
        actions={createLink("primary")}
      />
      <OrgKpiRow>
        <OrgKpi
          label={t("screen.organization.coupons.couponsList.couponsCountedAgainstPlan")}
          value={countedText(counted, limit)}
        />
        <OrgKpi
          label={t("screen.organization.coupons.couponsList.redemptionsThisMonth")}
          value={
            bookingsQuery.isSuccess ? String(redemptionsThisMonth(bookingsQuery.data)) : NO_VALUE
          }
        />
      </OrgKpiRow>
      <OrgChips
        label={t("screen.organization.coupons.couponsList.filterByStatus")}
        options={filterOptions}
        value={filter}
        onValueChange={setFilter}
      />
      {couponsQuery.isError ? <OrgError onRetry={() => void couponsQuery.refetch()} /> : null}
      <OrgTable
        columns={buildColumns({
          onToggle: (row) =>
            updateStatusMutation.mutate({
              couponId: row.id,
              status: row.status === "active" ? "paused" : "active",
            }),
          onRevoke: setRevokeTarget,
          busy: updateStatusMutation.isPending,
        })}
        rows={visible}
        rowKey={(row) => row.id}
        caption={t("screen.organization.coupons.couponsList.title")}
        loading={couponsQuery.isLoading}
        empty={
          couponsQuery.isError ? undefined : (
            <OrgEmpty
              title={
                rows.length === 0
                  ? t("screen.organization.coupons.couponsList.emptyTitle")
                  : t("screen.organization.coupons.couponsList.noMatchTitle")
              }
              action={rows.length === 0 ? createLink("secondary") : undefined}
            >
              {rows.length === 0
                ? t("screen.organization.coupons.couponsList.emptyBody")
                : t("screen.organization.coupons.couponsList.noMatchBody")}
            </OrgEmpty>
          )
        }
      />
      <TeDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
        title={t("screen.organization.coupons.couponsList.revokeThisCoupon")}
        description={t("screen.organization.coupons.couponsList.revokeBody")}
        primaryLabel={t("screen.organization.coupons.couponsList.revoke")}
        onPrimary={() => {
          if (revokeTarget) {
            updateStatusMutation.mutate({ couponId: revokeTarget.id, status: "expired" });
          }
          setRevokeTarget(null);
        }}
        secondaryLabel={t("screen.organization.coupons.couponsList.keepCoupon")}
        onSecondary={() => setRevokeTarget(null)}
        tone="danger"
      />
    </OrgPage>
  );
}
