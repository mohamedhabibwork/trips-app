import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { InvoiceDetail } from "@/screens/admin/finance/invoice-detail";

/** `/admin/invoices/$invoiceId` — SCR-ADM-44. */
export const Route = createFileRoute("/admin/invoices/$invoiceId")({
  loader: screenLoader("SCR-ADM-44"),
  head: pageHead("SCR-ADM-44"),
  component: InvoiceDetail,
});
