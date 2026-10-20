import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { AlbumUpload } from "@/screens/studio/albums/album-upload";

/** `/studio/albums/$albumId` — SCR-PHO-08 album upload. */
export const Route = createFileRoute("/studio/albums/$albumId")({
  loader: screenLoader("SCR-PHO-08"),
  head: pageHead("SCR-PHO-08"),
  component: AlbumUpload,
});
