import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripBrief } from "@/screens/studio/briefs/trip-brief";

/** `/studio/briefs/$tripId` — SCR-PHO-06 trip brief. */
export const Route = createFileRoute("/studio/briefs/$tripId")({
  loader: screenLoader("SCR-PHO-06"),
  head: pageHead("SCR-PHO-06"),
  component: TripBrief,
});
