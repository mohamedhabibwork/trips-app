import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { screenLoader } from "@/navigation/load-screen";
import { Trv10MyBookings } from "@/surfaces/traveler/screens/trv-10-my-bookings";

/** `/traveler/bookings` — SCR-TRV-10. */
export const Route = createFileRoute("/traveler/bookings/")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-10"),
  component: Trv10MyBookings,
});
