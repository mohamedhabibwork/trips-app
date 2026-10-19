import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { screenLoader } from "@/navigation/load-screen";
import { Trv05BookingReview } from "@/surfaces/traveler/screens/trv-05-booking-review";

/** `/traveler/book/$tripId/review` — SCR-TRV-05 (booking wizard step 3). */
export const Route = createFileRoute("/traveler/book/$tripId/review")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-05"),
  component: Trv05BookingReview,
  validateSearch: (search: Record<string, unknown>) => ({
    travelers: typeof search.travelers === "number" ? search.travelers : undefined,
    programs: typeof search.programs === "string" ? search.programs : undefined,
    vehicle: typeof search.vehicle === "string" ? search.vehicle : undefined,
    seats: typeof search.seats === "string" ? search.seats : undefined,
    holdUntil: typeof search.holdUntil === "string" ? search.holdUntil : undefined,
    coupon: typeof search.coupon === "string" ? search.coupon : undefined,
  }),
});
