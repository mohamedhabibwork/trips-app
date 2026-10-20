// SCR-PHO-08 Album upload: one album's photos and settings (docs/design/web/PhoWebStudio.dc.html).
// The album resolves from `photographer.listTripAlbums`; photos are added through
// `photographer.uploadPhotosToAlbum` and published with `photographer.publishTripAlbum`. The
// design's file dropzone needs the media upload pipeline, so the honest affordance today is a
// photo-URL entry backed by the real mutation.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";
import { usePathname } from "@/components/shells/shell-content";
import { formatDateTime } from "@/components/kit/format";
import { matchWebRoute, pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import {
  STUDIO_TABLE_CELL,
  STUDIO_TABLE_HEAD,
  StudioBadge,
  StudioButton,
  StudioCard,
  StudioLink,
  StudioLoading,
  StudioNotice,
  StudioPage,
  StudioPageHeader,
  StudioRow,
} from "../studio-ui";
import { albumStatusLabel, pick } from "../studio-vocab";

const URL_PATTERN = /^https?:\/\/\S{1,480}$/i;

export function AlbumUpload() {
  const { t, locale } = useAuth();
  const enabled = typeof window !== "undefined";
  const queryClient = useQueryClient();
  const albumId = matchWebRoute("studio", usePathname())?.params.albumId;

  const albumsQuery = useQuery({
    ...serverQueryOptions(orpc.photographer.listTripAlbums, "photographer/listTripAlbums", {
      input: {},
      enabled,
      retry: false,
    }),
  });

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState<string | undefined>(undefined);
  const [actionError, setActionError] = useState(false);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.photographer.key() });
  };

  const uploadMutation = useMutation(
    serverMutationOptions(
      orpc.photographer.uploadPhotosToAlbum,
      "photographer/uploadPhotosToAlbum",
      {
        onSuccess: () => {
          setPhotoUrl("");
          setPhotoError(undefined);
          invalidate();
        },
        onError: () => setPhotoError(t("screen.studio.upload.photoFailed")),
      },
    ),
  );
  const publishMutation = useMutation(
    serverMutationOptions(orpc.photographer.publishTripAlbum, "photographer/publishTripAlbum", {
      onSuccess: () => {
        setActionError(false);
        invalidate();
      },
      onError: () => setActionError(true),
    }),
  );

  if (albumsQuery.isPending) {
    return (
      <StudioPage>
        <StudioLoading rows={4} />
      </StudioPage>
    );
  }

  const found = albumsQuery.data?.find((row) => row.id === albumId);
  if (albumsQuery.isError || !found) {
    return (
      <StudioPage>
        <StudioNotice tone="warn" title={t("screen.studio.common.notFoundTitle")}>
          <p className="m-0 text-sm leading-5">{t("screen.studio.upload.notFoundBody")}</p>
        </StudioNotice>
        <StudioLink to={pathFor("SCR-PHO-07")} className="w-fit">
          {t("screen.studio.upload.backToAlbums")}
        </StudioLink>
      </StudioPage>
    );
  }
  const album = found;
  const photos: string[] = album.photoUrls.filter((url): url is string => typeof url === "string");
  const isDraft = album.status === "draft";

  function handleAddPhoto() {
    const value = photoUrl.trim();
    if (!URL_PATTERN.test(value)) {
      setPhotoError(t("screen.studio.upload.photoInvalid"));
      return;
    }
    uploadMutation.mutate({ albumId: album.id, photoUrls: [value] });
  }

  return (
    <StudioPage>
      <nav
        aria-label={t("screen.studio.common.breadcrumb")}
        className="text-sm text-[var(--te-ink-muted)]"
      >
        <StudioLink to={pathFor("SCR-PHO-07")}>{t("component.shell.studio.nav.albums")}</StudioLink>
        {" / "}
        {pick(locale, album.titleAr, album.titleEn)}
      </nav>

      <StudioPageHeader
        title={t("screen.studio.upload.title", {
          album: pick(locale, album.titleAr, album.titleEn),
        })}
        caption={t("screen.studio.common.tripIdLabel", { id: album.tripId.slice(0, 8) })}
        badge={
          <StudioBadge tone={album.status === "published" ? "ok" : "warn"} icon={false}>
            {albumStatusLabel(album.status)}
          </StudioBadge>
        }
        actions={
          <span className="flex items-center gap-3">
            <span className="text-[13px] text-[var(--te-ink-muted)]">
              {t("screen.studio.upload.photoCount", { count: photos.length })}
            </span>
            <span className="text-[13px] font-semibold text-[var(--te-ink-muted)]">
              {t("screen.studio.upload.updated", { when: formatDateTime(album.updatedAt, locale) })}
            </span>
          </span>
        }
      />

      <StudioRow align="start">
        <div className="flex min-w-0 basis-[560px] flex-[3] flex-col gap-4">
          <StudioCard title={t("screen.studio.upload.addTitle")}>
            <label className="flex flex-col gap-1 text-sm leading-5">
              <span className="font-semibold">{t("screen.studio.upload.addLabel")}</span>
              <input
                value={photoUrl}
                onChange={(event) => setPhotoUrl(event.target.value)}
                placeholder="https://…"
                className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3.5 text-base"
              />
              <span className="text-[13px] text-[var(--te-ink-muted)]">
                {t("screen.studio.upload.addHint")}
              </span>
            </label>
            {photoError ? (
              <span role="alert" className="text-[13px] font-semibold text-[var(--te-danger)]">
                {photoError}
              </span>
            ) : null}
            <StudioButton
              variant="secondary"
              onClick={handleAddPhoto}
              disabled={!isDraft || uploadMutation.isPending}
              className="w-fit"
            >
              {uploadMutation.isPending
                ? t("screen.studio.common.saving")
                : t("screen.studio.upload.addSubmit")}
            </StudioButton>
            {!isDraft ? (
              <span className="text-[13px] text-[var(--te-ink-muted)]">
                {t("screen.studio.upload.lockedNote")}
              </span>
            ) : null}
          </StudioCard>

          <StudioCard
            title={t("screen.studio.upload.listTitle", { count: photos.length })}
            actions={
              <span className="text-[13px] text-[var(--te-ink-muted)]">
                {t("screen.studio.upload.listCaption")}
              </span>
            }
          >
            {photos.length === 0 ? (
              <StudioNotice tone="info" title={t("screen.studio.upload.listEmptyTitle")}>
                <p className="m-0 text-sm leading-5">{t("screen.studio.upload.listEmptyBody")}</p>
              </StudioNotice>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="text-[13px] text-[var(--te-ink-muted)]">
                      <th scope="col" className={`${STUDIO_TABLE_HEAD} ps-0`}>
                        {t("screen.studio.upload.colPhoto")}
                      </th>
                      <th scope="col" className={STUDIO_TABLE_HEAD}>
                        {t("screen.studio.common.status")}
                      </th>
                      <th scope="col" className={`${STUDIO_TABLE_HEAD} pe-0 text-end`}>
                        <span className="sr-only">{t("screen.studio.common.actions")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {photos.map((url, index) => (
                      <tr key={`${url}-${index}`} className="border-t border-[var(--te-hairline)]">
                        <td
                          className={`${STUDIO_TABLE_CELL} max-w-[380px] truncate ps-0 font-mono text-[13px]`}
                        >
                          {url}
                        </td>
                        <td className={STUDIO_TABLE_CELL}>
                          <StudioBadge tone="ok" icon={false}>
                            {t("screen.studio.upload.photoState")}
                          </StudioBadge>
                        </td>
                        <td className={`${STUDIO_TABLE_CELL} pe-0 text-end`}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-[var(--te-primary-text)] underline-offset-4 hover:underline"
                          >
                            {t("screen.studio.upload.photoOpen")}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </StudioCard>
        </div>

        <StudioCard
          title={t("screen.studio.upload.settings")}
          className="basis-[320px] lg:flex-[2]"
        >
          <ReadOnlyLine label={t("screen.studio.upload.titleField")}>
            {pick(locale, album.titleAr, album.titleEn)}
          </ReadOnlyLine>
          <ReadOnlyLine label={t("screen.studio.upload.audience")}>
            {t(
              album.audience === "selected_travelers"
                ? "screen.studio.albums.audienceSelected"
                : "screen.studio.albums.audiencePublic",
            )}
          </ReadOnlyLine>
          <span className="flex items-center justify-between border-t border-[var(--te-hairline)] pt-3 text-sm">
            <span className="flex flex-col">
              <b>{t("screen.studio.upload.watermark")}</b>
              <span className="text-[13px] text-[var(--te-ink-muted)]">
                {t(
                  album.watermarked
                    ? "screen.studio.upload.watermarkOn"
                    : "screen.studio.upload.watermarkOff",
                )}
              </span>
            </span>
            <StudioLink to={pathFor("SCR-PHO-09", { albumId: album.id })}>
              {t("screen.studio.upload.watermarkLink")}
            </StudioLink>
          </span>

          {actionError ? (
            <StudioNotice tone="err" title={t("screen.studio.upload.publishFailed")}>
              <p className="m-0 text-sm leading-5">{t("screen.studio.upload.publishFailedBody")}</p>
            </StudioNotice>
          ) : null}
          <div className="flex flex-col gap-2 border-t border-[var(--te-hairline)] pt-4">
            {album.status === "published" ? (
              <StudioNotice tone="ok" title={t("screen.studio.upload.publishedTitle")}>
                <p className="m-0 text-sm leading-5">{t("screen.studio.upload.publishedBody")}</p>
              </StudioNotice>
            ) : (
              <StudioButton
                onClick={() => publishMutation.mutate({ albumId: album.id })}
                disabled={publishMutation.isPending}
              >
                {publishMutation.isPending
                  ? t("screen.studio.common.saving")
                  : t("screen.studio.upload.publish")}
              </StudioButton>
            )}
          </div>
        </StudioCard>
      </StudioRow>
    </StudioPage>
  );
}

function ReadOnlyLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="flex flex-col gap-1 text-sm leading-5">
      <span className="font-semibold">{label}</span>
      <output className="flex h-12 items-center rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface)] px-3.5 text-base">
        {children}
      </output>
    </span>
  );
}
