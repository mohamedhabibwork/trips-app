import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

/** `/traveler/bookings/$bookingId` — one booking's pages (detail and its actions). */
export const Route = createFileRoute("/traveler/bookings/$bookingId")({
  beforeLoad: requireSignedIn(),
  component: () => <Outlet />,
});
