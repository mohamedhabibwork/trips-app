import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { Trv17SharedAlbum } from "@/surfaces/traveler/screens/trv-17-shared-album";
import { pageHead } from "@/navigation/seo";

/** `/album/s/$token` — SCR-TRV-17: public shared album; a revoked token reads as not found. */
export const Route = createFileRoute("/album/s/$token")({
  loader: screenLoader("SCR-TRV-17"),
  head: pageHead("SCR-TRV-17"),
  component: Trv17SharedAlbum,
});
