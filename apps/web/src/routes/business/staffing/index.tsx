import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { StaffingBoard } from "@/screens/organization/staffing/staffing-board";

/** `/business/staffing` — SCR-ORG-19. */
export const Route = createFileRoute("/business/staffing/")({
  loader: screenLoader("SCR-ORG-19"),
  component: StaffingBoard,
});
