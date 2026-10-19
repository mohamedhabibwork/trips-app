import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { PayoutRuns } from "@/screens/admin/finance/payout-runs";

/** `/admin/money/payouts` — SCR-ADM-26. */
export const Route = createFileRoute("/admin/money/payouts")({
  loader: screenLoader("SCR-ADM-26"),
  component: PayoutRuns,
});
