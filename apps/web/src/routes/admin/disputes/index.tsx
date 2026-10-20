import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { DisputesQueue } from "@/screens/admin/deals-and-disputes/disputes-queue";

/** `/admin/disputes` — SCR-ADM-23. */
export const Route = createFileRoute("/admin/disputes/")({
  loader: screenLoader("SCR-ADM-23"),
  head: pageHead("SCR-ADM-23"),
  component: DisputesQueue,
});
