import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { VehicleTypesAndSeatLayout } from "@/screens/organization/vehicles/vehicle-types-and-seat-layout";

/** `/business/vehicles/types` — SCR-ORG-18. */
export const Route = createFileRoute("/business/vehicles/types")({
  loader: screenLoader("SCR-ORG-18"),
  head: pageHead("SCR-ORG-18"),
  component: VehicleTypesAndSeatLayout,
});
