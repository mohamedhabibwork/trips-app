import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";
import { screenLoader } from "@/navigation/load-screen";
import { ScrShr12ReceiptAndInvoiceView } from "@/screens/shared/scr-shr-12-receipt-and-invoice-view";

/** `/receipts/$receiptId` — SCR-SHR-12. */
export const Route = createFileRoute("/receipts/$receiptId")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-SHR-12"),
  component: ScrShr12ReceiptAndInvoiceView,
});
