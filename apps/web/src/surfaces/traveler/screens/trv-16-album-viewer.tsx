// SCR-TRV-16 Album viewer: photo grid with a full-size viewer, download and share where allowed,
// the watermark notice, and shared-link create/revoke. Swipe/arrow direction follows the locale
// (SCR-SHR-10): in Arabic the "next" arrow points left.
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, StatusPill } from "@/components/kit/controls";
import { client, orpc } from "@/utils/orpc";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";
import { TeIcon } from "@trips-app/ui/components/te-icon";

export function Trv16AlbumViewer({ albumId: albumIdProp }: { albumId?: string } = {}) {
  const params = useParams({ strict: false });
  const albumId = albumIdProp ?? params.albumId ?? "";
  const { t, locale, direction } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);

  const albumQuery = useQuery(orpc.traveler.albums.getAlbum.queryOptions({ input: { albumId } }));

  const createLink = useMutation({
    mutationFn: () => client.traveler.albums.createSharedLink({ albumId }),
    onSuccess: (result) => setShareToken(result.link.token),
  });
  const revokeLink = useMutation({
    mutationFn: () => client.traveler.albums.revokeSharedLink({ token: shareToken ?? "" }),
    onSuccess: () => setShareToken(null),
  });

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
        <ScreenError onRetry={() => void albumQuery.refetch()} />
      </div>
    );
  }
  const { album, access } = albumQuery.data;
  if (!album || !access) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenNotFound />
      </div>
    );
  }

  const photos = album.photoUrls;
  const step = direction === "rtl" ? -1 : 1;

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <h1 className="m-0 text-[26px] leading-9 font-bold">
        {pick(locale, album.titleAr, album.titleEn)}
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone="info">
          {t("screen.traveler.albumViewer.access", {
            hours: Math.round(access.signedUrlExpiresInSeconds / 3600),
          })}
        </StatusPill>
        {album.watermarked ? (
          <StatusPill tone="warning">{t("screen.traveler.albumViewer.watermarkBadge")}</StatusPill>
        ) : null}
      </div>
      {album.watermarked ? (
        <Notice tone="info">{t("screen.traveler.albumViewer.watermarkNote")}</Notice>
      ) : null}

      {photos.length === 0 ? (
        <p className="m-0 text-sm text-[var(--te-ink-muted)]">
          {t("screen.traveler.albumViewer.empty")}
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3">
          {photos.map((url, index) => (
            <li key={`${url}-${index}`}>
              <button
                type="button"
                className="block aspect-square w-full cursor-pointer overflow-hidden rounded-[var(--te-radius-sm)] bg-[var(--te-hairline)]"
                onClick={() => setOpenIndex(index)}
              >
                <img src={url} alt="" className="size-full object-cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {openIndex !== null && photos[openIndex] ? (
        <div
          role="dialog"
          aria-label={t("screen.traveler.albumViewer.viewerTitle")}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/80 p-4"
        >
          <img
            src={photos[openIndex]}
            alt=""
            className="max-h-[70vh] max-w-full rounded object-contain"
          />
          <div className="flex items-center gap-4 text-white">
            <button
              type="button"
              aria-label={t("screen.traveler.albumViewer.previous")}
              className="cursor-pointer p-2"
              onClick={() =>
                setOpenIndex((current) =>
                  Math.max(
                    0,
                    (current ?? 0) - step < 0 ? photos.length - 1 : (current ?? 0) - step,
                  ),
                )
              }
            >
              <TeIcon name={direction === "rtl" ? "arrow" : "back"} className="size-6" />
            </button>
            <span className="text-sm">
              {openIndex + 1} / {photos.length}
            </span>
            <button
              type="button"
              aria-label={t("screen.traveler.albumViewer.next")}
              className="cursor-pointer p-2"
              onClick={() => setOpenIndex((current) => ((current ?? 0) + step) % photos.length)}
            >
              <TeIcon name={direction === "rtl" ? "back" : "arrow"} className="size-6" />
            </button>
            <a
              href={photos[openIndex]}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer p-2 underline"
            >
              {t("screen.traveler.albumViewer.download")}
            </a>
            <button
              type="button"
              className="cursor-pointer p-2 underline"
              onClick={() => setOpenIndex(null)}
            >
              {t("screen.traveler.common.close")}
            </button>
          </div>
        </div>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-lg font-semibold">{t("screen.traveler.albumViewer.shareTitle")}</h2>
        {shareToken ? (
          <>
            <code className="overflow-x-auto rounded bg-[var(--te-hairline)] px-3 py-2 text-[13px]">
              {`${window.location.origin}/album/s/${shareToken}`}
            </code>
            <Button
              tone="outline"
              onClick={() => void revokeLink.mutate()}
              disabled={revokeLink.isPending}
            >
              {t("screen.traveler.albumViewer.revokeLink")}
            </Button>
          </>
        ) : (
          <Button onClick={() => createLink.mutate()} disabled={createLink.isPending}>
            {createLink.isPending
              ? t("auth.common.submitting")
              : t("screen.traveler.albumViewer.createLink")}
          </Button>
        )}
      </section>
    </div>
  );
}
