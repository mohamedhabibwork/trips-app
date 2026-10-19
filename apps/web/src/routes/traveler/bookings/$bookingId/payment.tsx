import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

/** `/traveler/bookings/$bookingId/payment` — payment status pages layout. */
export const Route = createFileRoute("/traveler/bookings/$bookingId/payment")({
  beforeLoad: requireSignedIn(),
  component: () => <Outlet />,
  validateSearch: (search: Record<string, unknown>) => ({
    paymentId: typeof search.paymentId === "string" ? search.paymentId : undefined,
  }),
});
