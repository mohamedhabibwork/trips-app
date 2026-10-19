import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { ReconciliationExceptions } from "@/screens/admin/finance/reconciliation-exceptions";

/** `/admin/money/reconciliation` — SCR-ADM-27. */
export const Route = createFileRoute("/admin/money/reconciliation")({
  loader: screenLoader("SCR-ADM-27"),
  component: ReconciliationExceptions,
});
