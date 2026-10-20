import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { InvoicesList } from "@/screens/admin/finance/invoices-list";

/** `/admin/invoices` — SCR-ADM-43. */
export const Route = createFileRoute("/admin/invoices/")({
  loader: screenLoader("SCR-ADM-43"),
  head: pageHead("SCR-ADM-43"),
  component: InvoicesList,
});
