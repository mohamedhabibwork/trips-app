import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { pageHead } from "@/navigation/seo";
import { screenLoader } from "@/navigation/load-screen";
import { Trv08PaymentFailed } from "@/surfaces/traveler/screens/trv-08-payment-failed";

/** `/traveler/bookings/$bookingId/payment/failed` — SCR-TRV-08. */
export const Route = createFileRoute("/traveler/bookings/$bookingId/payment/failed")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-08"),
  head: pageHead("SCR-TRV-08"),
  component: Trv08PaymentFailed,
  validateSearch: (search: Record<string, unknown>) => ({
    paymentId: typeof search.paymentId === "string" ? search.paymentId : undefined,
  }),
});
