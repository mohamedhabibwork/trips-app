import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { CouponAnalytics } from "@/screens/organization/coupons/coupon-analytics";

/** `/business/coupons/$couponId/analytics` — SCR-ORG-29. */
export const Route = createFileRoute("/business/coupons/$couponId/analytics")({
  loader: screenLoader("SCR-ORG-29"),
  head: pageHead("SCR-ORG-29"),
  component: CouponAnalytics,
});
