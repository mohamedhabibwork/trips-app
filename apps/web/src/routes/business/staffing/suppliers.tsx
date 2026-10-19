import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { PlatformSupplierSearchAndDealStart } from "@/screens/organization/staffing/platform-supplier-search-and-deal-start";

/** `/business/staffing/suppliers` — SCR-ORG-21. */
export const Route = createFileRoute("/business/staffing/suppliers")({
  loader: screenLoader("SCR-ORG-21"),
  component: PlatformSupplierSearchAndDealStart,
});
