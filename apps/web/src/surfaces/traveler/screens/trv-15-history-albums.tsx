// SCR-TRV-15 Trip history and albums: completed trips with the albums the traveler may see
// (audience privacy already applied by the API). Album hidden states come back as absent rows.
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Notice } from "@/components/kit/controls";
import { pathFor } from "@/navigation/web-routes";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";
import { ScreenEmpty, ScreenError, ScreenLoading } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";

export function Trv15HistoryAlbums() {
  const { t, locale } = useAuth();
  const navigate = useNavigate();
  const albumsQuery = useQuery(
    serverQueryOptions(orpc.traveler.albums.listMyAlbums, "traveler/albums/listMyAlbums", {
      input: undefined,
    }),
  );

  if (albumsQuery.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (albumsQuery.isError) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenError onRetry={() => void albumsQuery.refetch()} />
      </div>
    );
  }

  const albums = albumsQuery.data.albums;

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.albums.title")}</h1>

      {albums.length === 0 ? (
        <ScreenEmpty
          title={t("screen.traveler.albums.emptyTitle")}
          body={t("screen.traveler.albums.emptyBody")}
        />
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
          {albums.map((album) => (
            <li
              key={album.id}
              className="flex flex-col gap-2 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-4 shadow-[var(--te-card-shadow)]"
            >
              <p className="m-0 text-[15px] font-semibold">
                {pick(locale, album.titleAr, album.titleEn)}
              </p>
              <p className="m-0 text-[13px] text-[var(--te-ink-muted)]">
                {t("screen.traveler.albums.photoCount", { count: album.photoCount })}
                {album.watermarked ? ` · ${t("screen.traveler.albums.watermarked")}` : ""}
              </p>
              <button
                type="button"
                className="mt-auto cursor-pointer self-start underline"
                onClick={() => void navigate({ to: pathFor("SCR-TRV-16", { albumId: album.id }) })}
              >
                {t("screen.traveler.albums.openAlbum")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Notice tone="info">{t("screen.traveler.albums.privacyNote")}</Notice>
    </div>
  );
}
