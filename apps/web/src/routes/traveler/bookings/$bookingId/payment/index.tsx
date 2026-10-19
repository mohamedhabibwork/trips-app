import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { screenLoader } from "@/navigation/load-screen";
import { Trv07PaymentPending } from "@/surfaces/traveler/screens/trv-07-payment-pending";

/** `/traveler/bookings/$bookingId/payment` — SCR-TRV-07. */
export const Route = createFileRoute("/traveler/bookings/$bookingId/payment/")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-07"),
  component: Trv07PaymentPending,
  validateSearch: (search: Record<string, unknown>) => ({
    paymentId: typeof search.paymentId === "string" ? search.paymentId : undefined,
  }),
});
