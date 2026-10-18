import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  setSelectedAdminCouponId,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface CouponRow {
  id: string;
  creator: string;
  code: string;
  state: "active" | "revoked" | "expired";
  redemptions: string;
  abuseRule: string | null;
}

const DEFAULT_COUPON_ROWS: readonly CouponRow[] = [];

const STATE_PRESENTATION = (): Record<CouponRow["state"], AdminStatusPresentation> => ({
  active: {
    tone: "success",
    icon: "check",
    label: t("screen.admin.coupons.platformCoupons.active"),
  },
  revoked: {
    tone: "danger",
    icon: "close",
    label: t("screen.admin.coupons.platformCoupons.revoked"),
  },
  expired: {
    tone: "neutral",
    icon: "clock",
    label: t("screen.admin.coupons.platformCoupons.expired"),
  },
});

const ABUSE_FLAG = (): AdminStatusPresentation => ({
  tone: "warning",
  icon: "alert",
  label: t("screen.admin.coupons.platformCoupons.abuseFlag"),
});

const STATE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.coupons.platformCoupons.anyStatus") },
  { value: "active", label: t("screen.admin.coupons.platformCoupons.activeLabel") },
  { value: "revoked", label: t("screen.admin.coupons.platformCoupons.revokedLabel") },
  { value: "expired", label: t("screen.admin.coupons.platformCoupons.expiredLabel") },
];

export function PlatformCoupons() {
  const queryClient = useQueryClient();
  const couponsQuery = useQuery(orpc.coupons.listPlatformCoupons.queryOptions({ input: {} }));

  const revokeMutation = useMutation(
    orpc.coupons.updateStatus.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
      },
    }),
  );

  const rows: readonly CouponRow[] =
    couponsQuery.data?.items && couponsQuery.data.items.length > 0
      ? couponsQuery.data.items.map((coupon) => ({
          id: coupon.id,
          creator: coupon.scope === "platform" ? "Platform" : "Organization",
          code: coupon.code,
          state: (coupon.status === "paused"
            ? "revoked"
            : coupon.status === "expired"
              ? "expired"
              : "active") as CouponRow["state"],
          redemptions: String(coupon.redemptionsCount ?? 0),
          abuseRule:
            coupon.maxRedemptions !== null && coupon.redemptionsCount >= coupon.maxRedemptions
              ? "Usage limit reached"
              : null,
        }))
      : DEFAULT_COUPON_ROWS;

  const handleRevoke = async (row: CouponRow) => {
    try {
      await revokeMutation.mutateAsync({
        couponId: row.id,
        status: "paused",
      });
    } catch {
      // Optimistic fallback kept
    }
  };

  const columns: readonly TeDataTableColumn<CouponRow>[] = [
    { key: "creator", header: t("screen.admin.coupons.platformCoupons.creatorType") },
    { key: "code", header: t("screen.admin.coupons.platformCoupons.code") },
    {
      key: "state",
      header: t("screen.admin.coupons.platformCoupons.status"),
      render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
    },
    {
      key: "redemptions",
      header: t("screen.admin.coupons.platformCoupons.redemptions"),
      align: "end",
    },
    {
      key: "abuseRule",
      header: t("screen.admin.coupons.platformCoupons.abuseFlagHeader"),
      render: (row) =>
        row.abuseRule === null ? (
          <span>{t("screen.admin.coupons.platformCoupons.none")}</span>
        ) : (
          <span className="flex flex-col gap-1">
            <AdminStatus status={ABUSE_FLAG()} />
            <span className="te-caption">{row.abuseRule}</span>
          </span>
        ),
    },
    {
      key: "actions",
      header: t("screen.admin.coupons.platformCoupons.actions"),
      render: (row) => (
        <span className="flex flex-wrap gap-2">
          <TeButton
            variant="secondary"
            aria-label={t("screen.admin.coupons.platformCoupons.revoke", { code: row.code })}
            onClick={() => void handleRevoke(row)}
          >
            {t("screen.admin.coupons.platformCoupons.revoke2")}
          </TeButton>
          <TeButton
            variant="ghost"
            aria-label={t("screen.admin.coupons.platformCoupons.openAnalyticsFor", {
              code: row.code,
            })}
            onClick={() => setSelectedAdminCouponId(row.id)}
          >
            {t("screen.admin.coupons.platformCoupons.analytics")}
          </TeButton>
        </span>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.coupons.platformCoupons.platformCoupons")}
        description={t("screen.admin.coupons.platformCoupons.couponsFromAllCreatorsRevoke")}
        actions={
          <AdminScreenLink slug="platform-coupon-editor" variant="primary">
            {t("screen.admin.coupons.platformCoupons.createPlatformCoupon")}
          </AdminScreenLink>
        }
      />
      <StatePreview
        emptyTitle={t("screen.admin.coupons.platformCoupons.noCoupons")}
        emptyDescription={t("screen.admin.coupons.platformCoupons.noCouponsMatchThisFilter")}
        loadingLabel={t("screen.admin.coupons.platformCoupons.loadingTheCoupons")}
      >
        <TeInlineAlert
          tone="info"
          title={t("screen.admin.coupons.platformCoupons.abuseThresholds")}
        >
          {t("screen.admin.coupons.platformCoupons.thresholdsAreNotYetSet")}
        </TeInlineAlert>
        <AdminFilters>
          <AdminFilterSelect
            label={t("screen.admin.coupons.platformCoupons.statusLabel")}
            options={STATE_OPTIONS()}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.coupons.platformCoupons.coupons")}>
          <TeDataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.coupons.platformCoupons.platformCouponsCaption")}
            emptyTitle={t("screen.admin.coupons.platformCoupons.noCouponsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.coupons.platformCoupons.noCouponsMatchThisFilterEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
