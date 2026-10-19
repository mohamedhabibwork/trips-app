import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { screenLoader } from "@/navigation/load-screen";
import { Trv13TripDay } from "@/surfaces/traveler/screens/trv-13-trip-day";

/** `/traveler/bookings/$bookingId/trip-day` — SCR-TRV-13. */
export const Route = createFileRoute("/traveler/bookings/$bookingId/trip-day")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-13"),
  component: Trv13TripDay,
});
