import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { EmployeesList } from "@/screens/organization/people/employees-list";

/** `/business/employees` — SCR-ORG-34. */
export const Route = createFileRoute("/business/employees/")({
  loader: screenLoader("SCR-ORG-34"),
  head: pageHead("SCR-ORG-34"),
  component: EmployeesList,
});
