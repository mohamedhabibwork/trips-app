import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { screenLoader } from "@/navigation/load-screen";
import { Trv19Profile } from "@/surfaces/traveler/screens/trv-19-profile";

/** `/traveler/profile` — SCR-TRV-19. */
export const Route = createFileRoute("/traveler/profile/")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-19"),
  component: Trv19Profile,
});
