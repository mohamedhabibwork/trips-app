import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { ScrShr04Unauthorized } from "@/screens/shared/scr-shr-04-unauthorized";

/** `/unauthorized` — SCR-SHR-04. */
export const Route = createFileRoute("/unauthorized")({
  loader: screenLoader("SCR-SHR-04"),
  head: pageHead("SCR-SHR-04"),
  component: ScrShr04Unauthorized,
});
