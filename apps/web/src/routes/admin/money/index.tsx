import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { PlatformFinancialView } from "@/screens/admin/finance/platform-financial-view";

/** `/admin/money` — SCR-ADM-25. */
export const Route = createFileRoute("/admin/money/")({
  loader: screenLoader("SCR-ADM-25"),
  head: pageHead("SCR-ADM-25"),
  component: PlatformFinancialView,
});
