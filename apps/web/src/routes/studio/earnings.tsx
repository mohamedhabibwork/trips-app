import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { StudioEarnings } from "@/screens/studio/earnings/studio-earnings";

/** `/studio/earnings` — SCR-PHO-11 earnings and payouts. */
export const Route = createFileRoute("/studio/earnings")({
  loader: screenLoader("SCR-PHO-11"),
  head: pageHead("SCR-PHO-11"),
  component: StudioEarnings,
});
