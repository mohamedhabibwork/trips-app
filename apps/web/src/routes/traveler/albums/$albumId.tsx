import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";

import { screenLoader } from "@/navigation/load-screen";
import { Trv16AlbumViewer } from "@/surfaces/traveler/screens/trv-16-album-viewer";

/** `/traveler/albums/$albumId` — SCR-TRV-16. */
export const Route = createFileRoute("/traveler/albums/$albumId")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-TRV-16"),
  component: Trv16AlbumViewer,
});
