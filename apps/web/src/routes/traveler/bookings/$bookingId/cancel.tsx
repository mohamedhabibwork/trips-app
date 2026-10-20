import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { pageHead } from "@/navigation/seo";
import { screenLoader } from "@/navigation/load-screen";
import { Trv12CancelBooking } from "@/surfaces/traveler/screens/trv-12-cancel";

/** `/traveler/bookings/$bookingId/cancel` — SCR-TRV-12. */
export const Route = createFileRoute("/traveler/bookings/$bookingId/cancel")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-12"),
  head: pageHead("SCR-TRV-12"),
  component: Trv12CancelBooking,
});
