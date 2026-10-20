import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { RatesAvailability } from "@/screens/studio/rates/rates-availability";

/** `/studio/rates` — SCR-PHO-04 rates and availability. */
export const Route = createFileRoute("/studio/rates")({
  loader: screenLoader("SCR-PHO-04"),
  head: pageHead("SCR-PHO-04"),
  component: RatesAvailability,
});
