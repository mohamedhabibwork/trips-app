import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { Trv01TripBrowse } from "@/surfaces/traveler/screens/trv-01-trip-browse";

/** `/trips` — SCR-TRV-01. */
export const Route = createFileRoute("/trips/")({
  // The landing search card (SCR-PUB-01) forwards its "Where to" query here.
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" && search.q.trim() ? search.q.trim() : undefined,
  }),
  loader: screenLoader("SCR-TRV-01"),
  component: Trv01TripBrowse,
});
