import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { pageHead } from "@/navigation/seo";
import { screenLoader } from "@/navigation/load-screen";
import { Trv06PaymentHandoff } from "@/surfaces/traveler/screens/trv-06-pay";

/** `/traveler/bookings/$bookingId/pay` — SCR-TRV-06 (booking wizard step 4). */
export const Route = createFileRoute("/traveler/bookings/$bookingId/pay")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-06"),
  head: pageHead("SCR-TRV-06"),
  component: Trv06PaymentHandoff,
  validateSearch: (search: Record<string, unknown>) => ({
    paymentId: typeof search.paymentId === "string" ? search.paymentId : undefined,
    holdUntil: typeof search.holdUntil === "string" ? search.holdUntil : undefined,
  }),
});
