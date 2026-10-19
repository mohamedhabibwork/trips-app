import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { CouponsList } from "@/screens/organization/coupons/coupons-list";

/** `/business/coupons` — SCR-ORG-27. */
export const Route = createFileRoute("/business/coupons/")({
  loader: screenLoader("SCR-ORG-27"),
  component: CouponsList,
});
