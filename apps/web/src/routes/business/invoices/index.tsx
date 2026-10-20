import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { InvoicesList } from "@/screens/organization/billing/invoices-list";

/** `/business/invoices` — SCR-ORG-37. */
export const Route = createFileRoute("/business/invoices/")({
  loader: screenLoader("SCR-ORG-37"),
  head: pageHead("SCR-ORG-37"),
  component: InvoicesList,
});
