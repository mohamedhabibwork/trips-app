import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { VehicleEditor } from "@/screens/organization/vehicles/vehicle-editor";

/** `/business/vehicles/$vehicleId` — SCR-ORG-17. */
export const Route = createFileRoute("/business/vehicles/$vehicleId")({
  loader: screenLoader("SCR-ORG-17"),
  component: VehicleEditor,
});
