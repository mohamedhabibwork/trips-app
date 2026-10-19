import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { PlatformCoupons } from "@/screens/admin/coupons/platform-coupons";

/** `/admin/coupons` — SCR-ADM-19. */
export const Route = createFileRoute("/admin/coupons/")({
  loader: screenLoader("SCR-ADM-19"),
  component: PlatformCoupons,
});
