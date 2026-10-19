import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { screenLoader } from "@/navigation/load-screen";
import { Trv21BecomeSupplier } from "@/surfaces/traveler/screens/trv-21-become-supplier";

/** `/traveler/become-supplier` — SCR-TRV-21. */
export const Route = createFileRoute("/traveler/become-supplier/")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-21"),
  component: Trv21BecomeSupplier,
});
