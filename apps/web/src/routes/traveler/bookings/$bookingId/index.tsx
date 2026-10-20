import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { pageHead } from "@/navigation/seo";
import { screenLoader } from "@/navigation/load-screen";
import { Trv11BookingDetail } from "@/surfaces/traveler/screens/trv-11-booking-detail";

/** `/traveler/bookings/$bookingId` — SCR-TRV-11. */
export const Route = createFileRoute("/traveler/bookings/$bookingId/")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-11"),
  head: pageHead("SCR-TRV-11"),
  component: Trv11BookingDetail,
});
