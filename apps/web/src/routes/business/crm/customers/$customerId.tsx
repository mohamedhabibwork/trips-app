import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { CustomerDetail } from "@/screens/organization/crm/customer-detail";

/** `/business/crm/customers/$customerId` — SCR-ORG-51. */
export const Route = createFileRoute("/business/crm/customers/$customerId")({
  loader: screenLoader("SCR-ORG-51"),
  head: pageHead("SCR-ORG-51"),
  component: CustomerDetail,
});
