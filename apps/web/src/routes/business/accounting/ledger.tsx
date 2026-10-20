import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { LedgerAndExports } from "@/screens/organization/accounting/ledger-and-exports";

/** `/business/accounting/ledger` — SCR-ORG-31. */
export const Route = createFileRoute("/business/accounting/ledger")({
  loader: screenLoader("SCR-ORG-31"),
  head: pageHead("SCR-ORG-31"),
  component: LedgerAndExports,
});
