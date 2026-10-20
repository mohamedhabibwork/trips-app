import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { pageHead } from "@/navigation/seo";
import { screenLoader } from "@/navigation/load-screen";
import { Trv18Plans } from "@/surfaces/traveler/screens/trv-18-plans";

/** `/traveler/plans` — SCR-TRV-18. */
export const Route = createFileRoute("/traveler/plans/")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-18"),
  head: pageHead("SCR-TRV-18"),
  component: Trv18Plans,
});
