import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { OrganizerPage } from "@/screens/public/organizer-page/organizer-page";

/** `/organizers/$orgSlug` — SCR-PUB-21: an organizer's published trips (public data only). */
export const Route = createFileRoute("/organizers/$orgSlug")({
  loader: screenLoader("SCR-PUB-21"),
  head: pageHead("SCR-PUB-21"),
  component: OrganizerPage,
});
