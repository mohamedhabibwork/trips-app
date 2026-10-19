// SCR-TRV-17 Shared album (via link): public, revocable. A revoked, malformed or unknown token
// reads as not found (FR-MED-04) — never as a permission error.
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice } from "@/components/kit/controls";
import { orpc } from "@/utils/orpc";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";

export function Trv17SharedAlbum({ token: tokenProp }: { token?: string } = {}) {
  const params = useParams({ strict: false });
  const token = tokenProp ?? params.token ?? "";
  const { t, locale } = useAuth();
  const [downloadPrompted, setDownloadPrompted] = useState(false);

  const albumQuery = useQuery(
    orpc.traveler.albums.resolveSharedLink.queryOptions({ input: { token } }),
  );

  if (albumQuery.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (albumQuery.isError) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenError />
      </div>
    );
  }
  const album = albumQuery.data.album;
  if (!album) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenNotFound />
      </div>
    );
  }

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <h1 className="m-0 text-[26px] leading-9 font-bold">
        {pick(locale, album.titleAr, album.titleEn)}
      </h1>
      {album.watermarked ? (
        <Notice tone="info">{t("screen.traveler.albumViewer.watermarkNote")}</Notice>
      ) : null}

      {album.photoUrls.length === 0 ? (
        <p className="m-0 text-sm text-[var(--te-ink-muted)]">
          {t("screen.traveler.albumViewer.empty")}
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3">
          {album.photoUrls.map((url, index) => (
            <li key={`${url}-${index}`}>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block aspect-square overflow-hidden rounded-[var(--te-radius-sm)] bg-[var(--te-hairline)]"
              >
                <img src={url} alt="" className="size-full object-cover" loading="lazy" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {downloadPrompted ? (
        <Notice tone="success">{t("screen.traveler.sharedAlbum.downloadStarted")}</Notice>
      ) : (
        <Button
          block
          onClick={() => {
            setDownloadPrompted(true);
            if (album.photoUrls[0]) {
              window.open(album.photoUrls[0], "_blank", "noopener");
            }
          }}
        >
          {t("screen.traveler.sharedAlbum.downloadAll")}
        </Button>
      )}
      <Notice tone="info">{t("screen.traveler.sharedAlbum.linkNote")}</Notice>
    </div>
  );
}
