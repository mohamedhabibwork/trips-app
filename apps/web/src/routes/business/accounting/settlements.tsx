import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { Settlements } from "@/screens/organization/accounting/settlements";

/** `/business/accounting/settlements` — SCR-ORG-32. */
export const Route = createFileRoute("/business/accounting/settlements")({
  loader: screenLoader("SCR-ORG-32"),
  component: Settlements,
});
