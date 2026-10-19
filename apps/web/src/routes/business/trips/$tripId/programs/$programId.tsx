import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { ProgramEditor } from "@/screens/organization/trips/program-editor";

/** `/business/trips/$tripId/programs/$programId` — SCR-ORG-13. */
export const Route = createFileRoute("/business/trips/$tripId/programs/$programId")({
  loader: screenLoader("SCR-ORG-13"),
  component: ProgramEditor,
});
