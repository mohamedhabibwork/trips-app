import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireSurface } from "@/auth/guard";
import { TravelerShell } from "@/components/shells/traveler-shell";

/** `/traveler` — signed-in travelers only (the shell draws the top nav and bottom tabs). */
export const Route = createFileRoute("/traveler")({
  beforeLoad: requireSurface("traveler"),
  component: () => (
    <TravelerShell>
      <Outlet />
    </TravelerShell>
  ),
});
