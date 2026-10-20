import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { AdminHome } from "@/screens/admin/home/admin-home";

/** `/admin` — SCR-ADM-01. */
export const Route = createFileRoute("/admin/")({
  loader: screenLoader("SCR-ADM-01"),
  head: pageHead("SCR-ADM-01"),
  component: AdminHome,
});
