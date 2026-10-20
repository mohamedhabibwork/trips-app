import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { IssueInvoiceB2bOrB2c } from "@/screens/organization/billing/issue-invoice-b2b-or-b2c";

/** `/business/invoices/new` — SCR-ORG-38. */
export const Route = createFileRoute("/business/invoices/new")({
  loader: screenLoader("SCR-ORG-38"),
  head: pageHead("SCR-ORG-38"),
  component: IssueInvoiceB2bOrB2c,
});
