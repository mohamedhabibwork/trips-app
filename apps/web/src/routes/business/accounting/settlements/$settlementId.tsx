import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { SettlementStatement } from "@/screens/organization/accounting/settlement-statement";

/** `/business/accounting/settlements/$settlementId` — SCR-ORG-70. */
export const Route = createFileRoute("/business/accounting/settlements/$settlementId")({
  loader: screenLoader("SCR-ORG-70"),
  head: pageHead("SCR-ORG-70"),
  component: SettlementStatement,
});
