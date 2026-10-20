import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripAlbums } from "@/screens/studio/albums/trip-albums";

/** `/studio/albums` — SCR-PHO-07 trip albums. */
export const Route = createFileRoute("/studio/albums/")({
  loader: screenLoader("SCR-PHO-07"),
  head: pageHead("SCR-PHO-07"),
  component: TripAlbums,
});
