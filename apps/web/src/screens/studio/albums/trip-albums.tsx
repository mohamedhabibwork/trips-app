// SCR-PHO-07 Trip albums: every album the photographer owns, its state and its next action, plus
// the create-album form (docs/design/web/PhoWebAlbums.dc.html). Albums come from
// `photographer.listTripAlbums`; creating and opening use the photographer procedures.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { formatDate } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import {
  STUDIO_TABLE_CELL,
  STUDIO_TABLE_HEAD,
  StudioBadge,
  StudioButton,
  StudioCard,
  StudioError,
  StudioLink,
  StudioLoading,
  StudioNotice,
  StudioPage,
  StudioPageHeader,
} from "../studio-ui";
import { albumStatusLabel, pick } from "../studio-vocab";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function TripAlbums() {
  const { t, locale } = useAuth();
  const enabled = typeof window !== "undefined";
  const queryClient = useQueryClient();

  const albumsQuery = useQuery({
    ...serverQueryOptions(orpc.photographer.listTripAlbums, "photographer/listTripAlbums", {
      input: {},
      enabled,
      retry: false,
    }),
  });

  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [tripIdInput, setTripIdInput] = useState("");
  const [watermarked, setWatermarked] = useState(false);
  const [createError, setCreateError] = useState<string | undefined>(undefined);
  const [createdPath, setCreatedPath] = useState<string | null>(null);

  const createMutation = useMutation(
    serverMutationOptions(orpc.photographer.createTripAlbum, "photographer/createTripAlbum", {
      onSuccess: (album) => {
        setCreatedPath(pathFor("SCR-PHO-08", { albumId: album.id }));
        setTitleEn("");
        setTitleAr("");
        setTripIdInput("");
        setWatermarked(false);
        setCreateError(undefined);
        void queryClient.invalidateQueries({ queryKey: orpc.photographer.key() });
      },
      onError: () => setCreateError(t("screen.studio.albums.createFailed")),
    }),
  );

  if (albumsQuery.isPending) {
    return (
      <StudioPage>
        <StudioLoading rows={4} />
      </StudioPage>
    );
  }
  if (albumsQuery.isError) {
    return (
      <StudioPage>
        <StudioError onRetry={() => void albumsQuery.refetch()} />
      </StudioPage>
    );
  }

  const albums = albumsQuery.data;

  function handleCreate() {
    setCreateError(undefined);
    if (
      !titleEn.trim() ||
      titleEn.trim().length < 2 ||
      !titleAr.trim() ||
      titleAr.trim().length < 2
    ) {
      setCreateError(t("screen.studio.albums.createTitleRequired"));
      return;
    }
    if (!UUID_PATTERN.test(tripIdInput.trim())) {
      setCreateError(t("screen.studio.albums.createTripInvalid"));
      return;
    }
    createMutation.mutate({
      tripId: tripIdInput.trim(),
      titleEn: titleEn.trim(),
      titleAr: titleAr.trim(),
      watermarked,
    });
  }

  return (
    <StudioPage>
      <StudioPageHeader
        title={t("screen.studio.albums.title")}
        caption={t("screen.studio.albums.caption")}
      />

      {albums.length === 0 ? (
        <StudioCard>
          <StudioNotice tone="info" title={t("screen.studio.albums.emptyTitle")}>
            <p className="m-0 text-sm leading-5">{t("screen.studio.albums.emptyBody")}</p>
          </StudioNotice>
        </StudioCard>
      ) : (
        <StudioCard
          title={t("screen.studio.albums.listTitle", { count: albums.length })}
          actions={
            <span className="text-[13px] text-[var(--te-ink-muted)]">
              {t("screen.studio.albums.listCaption")}
            </span>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="text-[13px] text-[var(--te-ink-muted)]">
                  <th scope="col" className={`${STUDIO_TABLE_HEAD} ps-0`}>
                    {t("screen.studio.albums.colAlbum")}
                  </th>
                  <th scope="col" className={STUDIO_TABLE_HEAD}>
                    {t("screen.studio.common.status")}
                  </th>
                  <th scope="col" className={STUDIO_TABLE_HEAD}>
                    {t("screen.studio.albums.colPrivacy")}
                  </th>
                  <th scope="col" className={`${STUDIO_TABLE_HEAD} text-end`}>
                    {t("screen.studio.albums.colPhotos")}
                  </th>
                  <th scope="col" className={`${STUDIO_TABLE_HEAD} text-end`}>
                    {t("screen.studio.albums.colPublished")}
                  </th>
                  <th scope="col" className={`${STUDIO_TABLE_HEAD} pe-0 text-end`}>
                    <span className="sr-only">{t("screen.studio.common.actions")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {albums.map((album) => (
                  <tr key={album.id} className="border-t border-[var(--te-hairline)]">
                    <td className={`${STUDIO_TABLE_CELL} ps-0 font-semibold`}>
                      <StudioLink
                        to={pathFor("SCR-PHO-08", { albumId: album.id })}
                        className="block"
                      >
                        {pick(locale, album.titleAr, album.titleEn)}
                      </StudioLink>
                      <span className="text-[13px] font-normal text-[var(--te-ink-muted)]">
                        {t("screen.studio.common.tripIdLabel", { id: album.tripId.slice(0, 8) })}
                      </span>
                    </td>
                    <td className={STUDIO_TABLE_CELL}>
                      <StudioBadge
                        tone={
                          album.status === "published"
                            ? "ok"
                            : album.status === "draft"
                              ? "warn"
                              : "neu"
                        }
                        icon={false}
                      >
                        {albumStatusLabel(album.status)}
                      </StudioBadge>
                    </td>
                    <td className={STUDIO_TABLE_CELL}>
                      {t(
                        album.audience === "selected_travelers"
                          ? "screen.studio.albums.audienceSelected"
                          : "screen.studio.albums.audiencePublic",
                      )}
                    </td>
                    <td className={`${STUDIO_TABLE_CELL} text-end`}>{album.photoUrls.length}</td>
                    <td className={`${STUDIO_TABLE_CELL} text-end`}>
                      {album.publishedAt ? formatDate(album.publishedAt, locale) : "—"}
                    </td>
                    <td className={`${STUDIO_TABLE_CELL} pe-0 text-end font-semibold`}>
                      <StudioLink to={pathFor("SCR-PHO-09", { albumId: album.id })}>
                        {album.status === "draft"
                          ? t("screen.studio.albums.actionContinue")
                          : t("screen.studio.albums.actionPrivacy")}
                      </StudioLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StudioCard>
      )}

      <StudioCard title={t("screen.studio.albums.createTitle")}>
        <p className="m-0 text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
          {t("screen.studio.albums.createCaption")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm leading-5">
            <span className="font-semibold">{t("screen.studio.albums.createTitleEn")}</span>
            <input
              value={titleEn}
              onChange={(event) => setTitleEn(event.target.value)}
              maxLength={200}
              className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3.5 text-base"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm leading-5">
            <span className="font-semibold">{t("screen.studio.albums.createTitleAr")}</span>
            <input
              dir="rtl"
              lang="ar"
              value={titleAr}
              onChange={(event) => setTitleAr(event.target.value)}
              maxLength={200}
              className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3.5 text-base"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm leading-5">
          <span className="font-semibold">{t("screen.studio.albums.createTrip")}</span>
          <input
            value={tripIdInput}
            onChange={(event) => setTripIdInput(event.target.value)}
            placeholder="00000000-0000-0000-0000-000000000000"
            className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3.5 font-mono text-sm"
          />
          <span className="text-[13px] text-[var(--te-ink-muted)]">
            {t("screen.studio.albums.createTripHint")}
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={watermarked}
            onChange={(event) => setWatermarked(event.target.checked)}
            className="size-[18px] accent-[var(--te-ink)]"
          />
          {t("screen.studio.albums.createWatermark")}
        </label>
        {createError ? (
          <span role="alert" className="text-[13px] font-semibold text-[var(--te-danger)]">
            {createError}
          </span>
        ) : null}
        {createdPath ? (
          <span role="status" className="text-sm text-[var(--te-success)]">
            {t("screen.studio.albums.createSuccess")}{" "}
            <StudioLink to={createdPath}>{t("screen.studio.albums.createOpen")}</StudioLink>
          </span>
        ) : null}
        <StudioButton onClick={handleCreate} disabled={createMutation.isPending} className="w-fit">
          {createMutation.isPending
            ? t("screen.studio.common.saving")
            : t("screen.studio.albums.createSubmit")}
        </StudioButton>
      </StudioCard>
    </StudioPage>
  );
}
