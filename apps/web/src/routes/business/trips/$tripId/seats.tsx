import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { SeatMapAndSeatAssignment } from "@/screens/organization/bookings/seat-map-and-seat-assignment";

/** `/business/trips/$tripId/seats` — SCR-ORG-25. */
export const Route = createFileRoute("/business/trips/$tripId/seats")({
  loader: screenLoader("SCR-ORG-25"),
  head: pageHead("SCR-ORG-25"),
  component: SeatMapAndSeatAssignment,
});
