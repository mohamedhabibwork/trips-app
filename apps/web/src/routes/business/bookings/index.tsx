import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { BookingsAndTravelers } from "@/screens/organization/bookings/bookings-and-travelers";

/** `/business/bookings` — SCR-ORG-23. */
export const Route = createFileRoute("/business/bookings/")({
  loader: screenLoader("SCR-ORG-23"),
  head: pageHead("SCR-ORG-23"),
  component: BookingsAndTravelers,
});
