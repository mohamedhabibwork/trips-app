// SCR-ADM-19 Platform coupons (docs/design/web/admin/SCR-ADM-19.dc.html): coupons from all
// creators with their status, redemptions and abuse flag; an admin can revoke any active coupon.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

import { AdminButton, AdminLink } from "../common/admin-actions";
import { setSelectedAdminCouponId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminPage,
  AdminTable,
  type AdminColumn,
  type AdminTone,
} from "../common/admin-ui";

/** The editor route needs an ID; "new" opens it for a coupon that does not exist yet. */
export const NEW_COUPON_ID = "new";

type CouponStatus = "active" | "paused" | "expired";

interface CouponRow {
  id: string;
  creator: string;
  code: string;
  status: CouponStatus;
  redemptions: number;
  usageLimitReached: boolean;
}

const STATUS_PRESENTATION: Record<CouponStatus, { key: string; tone: AdminTone }> = {
  active: { key: "screen.admin.coupons.platformCoupons.active", tone: "ok" },
  paused: { key: "screen.admin.coupons.platformCoupons.revoked", tone: "info" },
  expired: { key: "screen.admin.coupons.platformCoupons.expired", tone: "neutral" },
};

function creatorLabel(scope: string): string {
  if (scope === "organization") return t("screen.admin.coupons.platformCoupons.organization");
  return t("screen.admin.coupons.platformCoupons.platform");
}

function AbuseFlag({ row }: { row: CouponRow }) {
  if (!row.usageLimitReached) {
    return <span className="te-caption">{t("screen.admin.coupons.platformCoupons.none")}</span>;
  }
  return (
    <AdminBadge tone="warn">
      {t("screen.admin.coupons.platformCoupons.flaggedBy", {
        rule: t("screen.admin.coupons.platformCoupons.usageLimitRule"),
      })}
    </AdminBadge>
  );
}

export function PlatformCoupons() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const couponsQuery = useQuery({
    ...serverQueryOptions(orpc.coupons.listPlatformCoupons, "coupons/listPlatformCoupons", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });

  const revokeMutation = useMutation(
    serverMutationOptions(orpc.coupons.updateStatus, "coupons/updateStatus", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
      },
    }),
  );

  const rows: readonly CouponRow[] = (couponsQuery.data?.items ?? []).map((coupon) => ({
    id: coupon.id,
    creator: creatorLabel(coupon.scope),
    code: coupon.code,
    status: coupon.status,
    redemptions: coupon.redemptionsCount,
    usageLimitReached:
      coupon.maxRedemptions !== null && coupon.redemptionsCount >= coupon.maxRedemptions,
  }));

  const revoke = (row: CouponRow) => {
    revokeMutation.mutate({ couponId: row.id, status: "paused" });
  };

  const columns: readonly AdminColumn<CouponRow>[] = [
    {
      key: "creator",
      header: t("screen.admin.coupons.platformCoupons.creatorType"),
      render: (row) => row.creator,
    },
    {
      key: "code",
      header: t("screen.admin.coupons.platformCoupons.code"),
      render: (row) => row.code,
    },
    {
      key: "status",
      header: t("screen.admin.coupons.platformCoupons.status"),
      render: (row) => (
        <AdminBadge tone={STATUS_PRESENTATION[row.status].tone} icon={false}>
          {t(STATUS_PRESENTATION[row.status].key)}
        </AdminBadge>
      ),
    },
    {
      key: "redemptions",
      header: t("screen.admin.coupons.platformCoupons.redemptions"),
      render: (row) => row.redemptions,
      align: "end",
    },
    {
      key: "abuse",
      header: t("screen.admin.coupons.platformCoupons.abuseFlag"),
      render: (row) => <AbuseFlag row={row} />,
    },
    {
      key: "actions",
      header: (
        <span className="te-caption">{t("screen.admin.coupons.platformCoupons.actions")}</span>
      ),
      render: (row) => (
        <span className="flex flex-wrap items-center gap-4">
          {row.status === "active" ? (
            <AdminButton
              variant="link"
              disabled={revokeMutation.isPending}
              aria-label={t("screen.admin.coupons.platformCoupons.revokeCode", { code: row.code })}
              onClick={() => revoke(row)}
            >
              {t("screen.admin.coupons.platformCoupons.revoke")}
            </AdminButton>
          ) : null}
          {/* No coupon analytics screen exists yet, so the link renders dimmed. */}
          <span aria-disabled="true" className="te-caption cursor-not-allowed opacity-50">
            {t("screen.admin.coupons.platformCoupons.analytics")}
          </span>
        </span>
      ),
    },
  ];

  return (
    <AdminPage
      title={t("screen.admin.coupons.platformCoupons.title")}
      description={t("screen.admin.coupons.platformCoupons.description")}
      actions={
        <AdminLink
          screen="SCR-ADM-20"
          params={{ couponId: NEW_COUPON_ID }}
          variant="primary"
          onClick={() => setSelectedAdminCouponId(null)}
        >
          {t("screen.admin.coupons.platformCoupons.createCoupon")}
        </AdminLink>
      }
    >
      <AdminAlert
        tone="warning"
        title={t("screen.admin.coupons.platformCoupons.abuseThresholdsNotSet")}
      >
        {t("screen.admin.coupons.platformCoupons.abuseThresholdsBody")}
      </AdminAlert>
      {revokeMutation.isError ? (
        <AdminAlert tone="danger" title={t("screen.admin.coupons.platformCoupons.revokeFailed")}>
          {t("screen.admin.coupons.platformCoupons.revokeFailedBody")}
        </AdminAlert>
      ) : null}
      <AdminQueryState
        query={couponsQuery}
        loadingLabel={t("screen.admin.coupons.platformCoupons.loading")}
      >
        <AdminTable
          caption={t("screen.admin.coupons.platformCoupons.tableCaption")}
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          empty={
            <AdminEmpty
              title={t("screen.admin.coupons.platformCoupons.emptyTitle")}
              description={t("screen.admin.coupons.platformCoupons.emptyBody")}
            />
          }
        />
      </AdminQueryState>
    </AdminPage>
  );
}
