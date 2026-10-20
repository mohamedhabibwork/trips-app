import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripOversightDetail } from "@/screens/admin/trips/trip-oversight-detail";

/** `/admin/trips/$tripId` — SCR-ADM-46. */
export const Route = createFileRoute("/admin/trips/$tripId")({
  loader: screenLoader("SCR-ADM-46"),
  head: pageHead("SCR-ADM-46"),
  component: TripOversightDetail,
});
