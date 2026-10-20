// SCR-PHO-09 Album privacy and watermark: who can open the album, plus the watermark panel that
// hosts SCR-PHO-10 (docs/design/web/PhoWebPrivacy.dc.html). The album's stored audience and
// watermark flag are real; changing them after creation needs a procedure that does not exist yet,
// so the form renders the stored state and says so instead of pretending to save.
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/auth/auth-context";
import { usePathname } from "@/components/shells/shell-content";
import { formatDate, formatDateTime } from "@/components/kit/format";
import { matchWebRoute, pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import {
  StudioBadge,
  StudioCard,
  StudioLink,
  StudioLoading,
  StudioNotice,
  StudioPage,
  StudioPageHeader,
  StudioRow,
} from "../studio-ui";
import { albumStatusLabel, pick } from "../studio-vocab";
import { WatermarkSettings } from "../privacy/watermark-settings";

/** The privacy modes of the artboard and the plan each one needs (basic = public only). */
const PRIVACY_MODES: ReadonlyArray<{ id: "public" | "selected"; needsPlan: boolean }> = [
  { id: "public", needsPlan: false },
  { id: "selected", needsPlan: true },
];

export function AlbumPrivacy() {
  const { t, locale } = useAuth();
  const albumId = matchWebRoute("studio", usePathname())?.params.albumId;
  const enabled = typeof window !== "undefined";

  const albumsQuery = useQuery({
    ...serverQueryOptions(orpc.photographer.listTripAlbums, "photographer/listTripAlbums", {
      input: {},
      enabled,
      retry: false,
    }),
  });

  if (albumsQuery.isPending) {
    return (
      <StudioPage>
        <StudioLoading rows={4} />
      </StudioPage>
    );
  }

  const album = albumsQuery.data?.find((row) => row.id === albumId) ?? null;
  if (albumsQuery.isError || !album) {
    return (
      <StudioPage>
        <StudioNotice tone="warn" title={t("screen.studio.common.notFoundTitle")}>
          <p className="m-0 text-sm leading-5">{t("screen.studio.privacy.notFoundBody")}</p>
        </StudioNotice>
        <StudioLink to={pathFor("SCR-PHO-07")} className="w-fit">
          {t("screen.studio.upload.backToAlbums")}
        </StudioLink>
      </StudioPage>
    );
  }

  const currentAudience = album.audience === "selected_travelers" ? "selected" : "public";

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
        title={t("screen.studio.privacy.title")}
        caption={[
          t("screen.studio.common.tripIdLabel", { id: album.tripId.slice(0, 8) }),
          t("screen.studio.privacy.photoCount", { count: album.photoUrls.length }),
        ].join(" · ")}
        badge={
          <StudioBadge tone={album.status === "published" ? "ok" : "warn"} icon={false}>
            {albumStatusLabel(album.status)}
          </StudioBadge>
        }
        actions={
          <>
            {album.publishedAt ? (
              <span className="text-[13px] text-[var(--te-ink-muted)]">
                {t("screen.studio.privacy.publishedAt", {
                  when: formatDate(album.publishedAt, locale),
                })}
              </span>
            ) : null}
            <StudioLinkButtonSecondary albumId={album.id} />
          </>
        }
      />

      <StudioRow align="start">
        <StudioCard
          title={t("screen.studio.privacy.audienceTitle")}
          className="basis-[560px] lg:flex-[3]"
        >
          <div className="flex flex-col gap-2.5">
            {PRIVACY_MODES.map((mode) => {
              const selected = currentAudience === mode.id;
              return (
                <label
                  key={mode.id}
                  className={`flex items-start gap-3 rounded-[var(--te-radius-md)] border p-4 ${
                    selected
                      ? "border-2 border-[var(--te-accent)] bg-[var(--te-surface-raised)]"
                      : "border-[var(--te-hairline)] bg-[var(--te-surface-raised)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="privacy-mode"
                    checked={selected}
                    readOnly
                    className="mt-1 size-5 shrink-0 accent-[var(--te-ink)]"
                    aria-label={t(`screen.studio.privacy.mode.${mode.id}`)}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold">
                        {t(`screen.studio.privacy.mode.${mode.id}`)}
                      </span>
                      <StudioBadge tone={mode.needsPlan ? "info" : "neu"} icon={false}>
                        {mode.needsPlan
                          ? t("screen.studio.privacy.modePlan")
                          : t("screen.studio.privacy.modeAllPlans")}
                      </StudioBadge>
                    </span>
                    <span className="text-sm leading-5 text-[var(--te-ink-muted)]">
                      {t(`screen.studio.privacy.modeHint.${mode.id}`, {
                        count: album.photoUrls.length,
                      })}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <StudioNotice tone="info" title={t("screen.studio.privacy.readOnlyTitle")}>
            <p className="m-0 text-sm leading-5">{t("screen.studio.privacy.readOnlyBody")}</p>
          </StudioNotice>
          <StudioNotice tone="warn" title={t("screen.studio.privacy.downgradeTitle")}>
            <p className="m-0 text-sm leading-5">{t("screen.studio.privacy.downgradeBody")}</p>
          </StudioNotice>
        </StudioCard>

        <div className="flex min-w-0 basis-[360px] flex-[2] flex-col gap-4">
          <WatermarkSettings watermarked={album.watermarked} loading={false} />
          <StudioCard>
            <span className="text-sm text-[var(--te-ink-muted)]">
              {t("screen.studio.privacy.updated", {
                when: formatDateTime(album.updatedAt, locale),
              })}
            </span>
          </StudioCard>
        </div>
      </StudioRow>
    </StudioPage>
  );
}

function StudioLinkButtonSecondary({ albumId }: { albumId: string }) {
  const { t } = useAuth();
  return (
    <StudioLink to={pathFor("SCR-PHO-08", { albumId })} className="self-center font-semibold">
      {t("screen.studio.privacy.backToAlbum")}
    </StudioLink>
  );
}
