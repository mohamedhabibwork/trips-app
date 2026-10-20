import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { DealRequests } from "@/screens/studio/deals/deal-requests";

/** `/studio/deals` — SCR-PHO-05 deal requests. */
export const Route = createFileRoute("/studio/deals")({
  loader: screenLoader("SCR-PHO-05"),
  head: pageHead("SCR-PHO-05"),
  component: DealRequests,
});
