import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { Trv02TripDetail } from "@/surfaces/traveler/screens/trv-02-trip-detail";
import { pageHead } from "@/navigation/seo";

/** `/trips/$tripId` — SCR-TRV-02: public trip detail, prefetched on the server. */
export const Route = createFileRoute("/trips/$tripId")({
  loader: screenLoader("SCR-TRV-02"),
  head: pageHead("SCR-TRV-02"),
  component: Trv02TripDetail,
});
