import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { VehicleRegistry } from "@/screens/organization/vehicles/vehicle-registry";

/** `/business/vehicles` — SCR-ORG-16. */
export const Route = createFileRoute("/business/vehicles/")({
  loader: screenLoader("SCR-ORG-16"),
  component: VehicleRegistry,
});
