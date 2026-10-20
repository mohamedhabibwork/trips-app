import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { BookingDetail } from "@/screens/organization/bookings/booking-detail";

/** `/business/bookings/$bookingId` — SCR-ORG-24. */
export const Route = createFileRoute("/business/bookings/$bookingId")({
  loader: screenLoader("SCR-ORG-24"),
  head: pageHead("SCR-ORG-24"),
  component: BookingDetail,
});
