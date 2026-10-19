import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { screenLoader } from "@/navigation/load-screen";
import { Trv15HistoryAlbums } from "@/surfaces/traveler/screens/trv-15-history-albums";

/** `/traveler/albums` — SCR-TRV-15. */
export const Route = createFileRoute("/traveler/albums/")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-15"),
  component: Trv15HistoryAlbums,
});
