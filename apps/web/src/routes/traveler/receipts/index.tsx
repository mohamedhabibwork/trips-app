import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { screenLoader } from "@/navigation/load-screen";
import { Trv14Receipts } from "@/surfaces/traveler/screens/trv-14-receipts";

/** `/traveler/receipts` — SCR-TRV-14. */
export const Route = createFileRoute("/traveler/receipts/")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-14"),
  component: Trv14Receipts,
});
