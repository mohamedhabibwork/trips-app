import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { CouponEditor } from "@/screens/organization/coupons/coupon-editor";

/** `/business/coupons/$couponId` — SCR-ORG-28. */
export const Route = createFileRoute("/business/coupons/$couponId/")({
  loader: screenLoader("SCR-ORG-28"),
  component: CouponEditor,
});
