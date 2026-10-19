import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

/** `/traveler/book/$tripId` — booking wizard layout (each step is a child route). */
export const Route = createFileRoute("/traveler/book/$tripId")({
  beforeLoad: requireSignedIn(),
  component: () => <Outlet />,
});
