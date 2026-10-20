import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { B2bInvoice } from "@/screens/organization/billing/b2b-invoice";

/** `/business/invoices/$invoiceId` — SCR-ORG-69. */
export const Route = createFileRoute("/business/invoices/$invoiceId")({
  loader: screenLoader("SCR-ORG-69"),
  head: pageHead("SCR-ORG-69"),
  component: B2bInvoice,
});
