import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { pageHead } from "@/navigation/seo";
import { screenLoader } from "@/navigation/load-screen";
import { Trv03BookingPrograms } from "@/surfaces/traveler/screens/trv-03-booking-programs";

/** `/traveler/book/$tripId` — SCR-TRV-03 (booking wizard step 1). */
export const Route = createFileRoute("/traveler/book/$tripId/")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-03"),
  head: pageHead("SCR-TRV-03"),
  component: Trv03BookingPrograms,
  validateSearch: (search: Record<string, unknown>) => ({
    travelers: typeof search.travelers === "number" ? search.travelers : undefined,
    programs: typeof search.programs === "string" ? search.programs : undefined,
  }),
});
