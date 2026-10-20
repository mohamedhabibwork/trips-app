import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { PlatformCouponEditor } from "@/screens/admin/coupons/platform-coupon-editor";

/** `/admin/coupons/$couponId` — SCR-ADM-20. */
export const Route = createFileRoute("/admin/coupons/$couponId")({
  loader: screenLoader("SCR-ADM-20"),
  head: pageHead("SCR-ADM-20"),
  component: PlatformCouponEditor,
});
