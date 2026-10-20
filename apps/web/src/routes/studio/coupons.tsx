import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { StudioCoupons } from "@/screens/studio/coupons/studio-coupons";

/** `/studio/coupons` — SCR-PHO-12 studio coupons. */
export const Route = createFileRoute("/studio/coupons")({
  loader: screenLoader("SCR-PHO-12"),
  head: pageHead("SCR-PHO-12"),
  component: StudioCoupons,
});
