import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { pageHead } from "@/navigation/seo";
import { screenLoader } from "@/navigation/load-screen";
import { Trv09BookingConfirmed } from "@/surfaces/traveler/screens/trv-09-booking-confirmed";

/** `/traveler/bookings/$bookingId/confirmed` — SCR-TRV-09. */
export const Route = createFileRoute("/traveler/bookings/$bookingId/confirmed")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-09"),
  head: pageHead("SCR-TRV-09"),
  component: Trv09BookingConfirmed,
});
