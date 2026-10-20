import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { pageHead } from "@/navigation/seo";
import { screenLoader } from "@/navigation/load-screen";
import { Trv20Privacy } from "@/surfaces/traveler/screens/trv-20-privacy";

/** `/traveler/privacy` — SCR-TRV-20. */
export const Route = createFileRoute("/traveler/privacy/")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-20"),
  head: pageHead("SCR-TRV-20"),
  component: Trv20Privacy,
});
