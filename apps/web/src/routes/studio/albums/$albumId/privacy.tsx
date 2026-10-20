import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { AlbumPrivacy } from "@/screens/studio/albums/album-privacy";

/** `/studio/albums/$albumId/privacy` — SCR-PHO-09 album privacy and watermark (with SCR-PHO-10). */
export const Route = createFileRoute("/studio/albums/$albumId/privacy")({
  loader: screenLoader("SCR-PHO-09"),
  head: pageHead("SCR-PHO-09"),
  component: AlbumPrivacy,
});
