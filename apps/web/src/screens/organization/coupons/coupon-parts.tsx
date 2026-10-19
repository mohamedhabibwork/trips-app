// Pieces shared by the coupon screens (SCR-ORG-27 to 29): plan limit, value text, status badge.
import { t } from "@trips-app/i18n";

import { NO_VALUE, OrgBadge } from "../common/org-ui";

/** The editor's "create" address: its URL needs a coupon id, so a new coupon uses `new`. */
export const NEW_COUPON_ID = "new";

export type CouponStatus = "active" | "paused" | "expired";

interface CouponLike {
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  currencyCode: string;
  maxRedemptions: number | null;
  redemptionsCount: number;
}

/** Plan tier from the subscription's plan id ("plan:growth"); null while unknown. */
export function planTier(subscription: unknown): string | null {
  if (!subscription || typeof subscription !== "object") return null;
  const planId = (subscription as { planId?: unknown }).planId;
  return typeof planId === "string" ? (planId.split(":")[1] ?? planId) : null;
}

/**
 * "3 of 20", or "3 of Unlimited". `limit` is the plan's `activeCouponsMax` from the catalog:
 * null means no limit, undefined means the plan is not known yet.
 */
export function countedText(count: number | null, limit: number | null | undefined): string {
  return t("screen.organization.coupons.couponParts.nOfLimit", {
    n: count === null ? NO_VALUE : count,
    limit:
      limit === undefined
        ? NO_VALUE
        : limit === null
          ? t("screen.organization.coupons.couponParts.unlimited")
          : limit,
  });
}

export function couponValueText(coupon: CouponLike): string {
  return coupon.discountType === "percentage"
    ? `${coupon.discountValue}%`
    : `${(coupon.discountValue / 100).toFixed(2)} ${coupon.currencyCode}`;
}

export function couponTypeText(coupon: CouponLike): string {
  return coupon.discountType === "percentage"
    ? t("screen.organization.coupons.couponParts.percentage")
    : t("screen.organization.coupons.couponParts.fixedAmount");
}

/** Remaining uses as a number, or null when the coupon has no total limit. */
export function remainingUses(coupon: CouponLike): number | null {
  return coupon.maxRedemptions === null
    ? null
    : Math.max(0, coupon.maxRedemptions - coupon.redemptionsCount);
}

export function remainingText(coupon: CouponLike, status: CouponStatus): string {
  if (status === "expired") return "0";
  const remaining = remainingUses(coupon);
  return remaining === null
    ? t("screen.organization.coupons.couponParts.unlimited")
    : String(remaining);
}

/** The list calls an ended coupon "Revoked"; the analytics page calls it "Expired". */
export function CouponStatusBadge({
  status,
  endedLabel = "revoked",
}: {
  status: CouponStatus;
  endedLabel?: "revoked" | "expired";
}) {
  if (status === "active") {
    return <OrgBadge tone="ok">{t("screen.organization.coupons.couponParts.active")}</OrgBadge>;
  }
  if (status === "paused") {
    return <OrgBadge tone="warn">{t("screen.organization.coupons.couponParts.paused")}</OrgBadge>;
  }
  return endedLabel === "revoked" ? (
    <OrgBadge tone="err">{t("screen.organization.coupons.couponParts.revoked")}</OrgBadge>
  ) : (
    <OrgBadge tone="neu">{t("screen.organization.coupons.couponParts.expired")}</OrgBadge>
  );
}

/** CSV of a table, saved by the browser. */
export function downloadCsv(lines: readonly (readonly string[])[], fileName: string): void {
  const csv = lines
    .map((line) => line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
