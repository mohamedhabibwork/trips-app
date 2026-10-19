import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { SettlementsTracker } from "@/screens/admin/finance/settlements-tracker";

/** `/admin/money/settlements` — SCR-ADM-28. */
export const Route = createFileRoute("/admin/money/settlements")({
  loader: screenLoader("SCR-ADM-28"),
  component: SettlementsTracker,
});
