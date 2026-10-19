import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { screenLoader } from "@/navigation/load-screen";
import { Trv04BookingSeats } from "@/surfaces/traveler/screens/trv-04-booking-seats";

/** `/traveler/book/$tripId/seats` — SCR-TRV-04 (booking wizard step 2). */
export const Route = createFileRoute("/traveler/book/$tripId/seats")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-04"),
  component: Trv04BookingSeats,
  validateSearch: (search: Record<string, unknown>) => ({
    travelers: typeof search.travelers === "number" ? search.travelers : undefined,
    programs: typeof search.programs === "string" ? search.programs : undefined,
    seats: typeof search.seats === "string" ? search.seats : undefined,
  }),
});
