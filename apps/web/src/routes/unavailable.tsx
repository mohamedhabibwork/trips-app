import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { ScrShr06ServiceUnavailable } from "@/screens/shared/scr-shr-06-service-unavailable";

/** `/unavailable` — SCR-SHR-06. */
export const Route = createFileRoute("/unavailable")({
  loader: screenLoader("SCR-SHR-06"),
  component: ScrShr06ServiceUnavailable,
});
