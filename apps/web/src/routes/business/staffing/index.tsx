import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { StaffingBoard } from "@/screens/organization/staffing/staffing-board";

/** `/business/staffing` — SCR-ORG-19. */
export const Route = createFileRoute("/business/staffing/")({
  loader: screenLoader("SCR-ORG-19"),
  head: pageHead("SCR-ORG-19"),
  component: StaffingBoard,
});
