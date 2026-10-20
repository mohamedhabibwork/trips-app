// SCR-PHO-06 Trip brief: the schedule and scope an assigned photographer shoots against
// (docs/design/web/PhoWebBrief.dc.html). The trip comes from the URL; published trips resolve
// through `trips.getPublicTripDetail` + `programs.listPublicTripPrograms`. An assignment service
// does not exist yet, so an unpublished trip shows the honest not-available state.
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/auth/auth-context";
import { usePathname } from "@/components/shells/shell-content";
import { formatDateRange, formatMinorAmount } from "@/components/kit/format";
import { matchWebRoute, pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import {
  NO_VALUE,
  StudioBadge,
  StudioCard,
  StudioEmpty,
  StudioLink,
  StudioLinkButton,
  StudioLoading,
  StudioNotice,
  StudioPage,
  StudioPageHeader,
  StudioRow,
} from "../studio-ui";
import { pick } from "../studio-vocab";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function TripBrief() {
  const { t, locale } = useAuth();
  const { tripId } = useTripIdParam();

  const valid = typeof tripId === "string" && UUID_PATTERN.test(tripId);
  const enabled = typeof window !== "undefined" && valid;

  const tripQuery = useQuery({
    ...serverQueryOptions(orpc.trips.getPublicTripDetail, "trips/getPublicTripDetail", {
      input: { tripId: tripId ?? "" },
      enabled,
      retry: false,
    }),
  });
  const programsQuery = useQuery({
    ...serverQueryOptions(orpc.programs.listPublicTripPrograms, "programs/listPublicTripPrograms", {
      input: { tripId: tripId ?? "" },
      enabled,
      retry: false,
    }),
  });
  const albumsQuery = useQuery({
    ...serverQueryOptions(orpc.photographer.listTripAlbums, "photographer/listTripAlbums", {
      input: valid ? { tripId } : undefined,
      enabled,
      retry: false,
    }),
  });

  if (!valid) {
    return (
      <StudioPage>
        <StudioEmpty title={t("screen.studio.common.notFoundTitle")}>
          {t("screen.studio.common.notFoundBody")}
        </StudioEmpty>
      </StudioPage>
    );
  }
  if (tripQuery.isPending || programsQuery.isPending) {
    return (
      <StudioPage>
        <StudioLoading rows={4} />
      </StudioPage>
    );
  }

  const trip = tripQuery.data?.trip ?? null;
  if (tripQuery.isError || !trip) {
    return (
      <StudioPage>
        <StudioNotice tone="warn" title={t("screen.studio.brief.unavailableTitle")}>
          <p className="m-0 text-sm leading-5">{t("screen.studio.brief.unavailableBody")}</p>
        </StudioNotice>
        <StudioLink to={pathFor("SCR-PHO-05")} className="w-fit">
          {t("screen.studio.common.backToDeals")}
        </StudioLink>
      </StudioPage>
    );
  }

  const title = pick(locale, trip.titleAr, trip.titleEn);
  const organizer = pick(locale, trip.organizerNameAr, trip.organizerNameEn);
  const programs = programsQuery.data?.items ?? [];
  const tripAlbums = (albumsQuery.data ?? []).filter((album) => album.tripId === tripId);

  return (
    <StudioPage>
      <nav
        aria-label={t("screen.studio.common.breadcrumb")}
        className="text-sm text-[var(--te-ink-muted)]"
      >
        <StudioLink to={pathFor("SCR-PHO-01")}>{t("component.shell.studio.nav.home")}</StudioLink>
        {" / "}
        <StudioLink to={pathFor("SCR-PHO-05")}>{t("component.shell.studio.nav.deals")}</StudioLink>
        {" / "}
        {title}
      </nav>

      <StudioPageHeader
        title={t("screen.studio.brief.title", { trip: title })}
        caption={[
          organizer,
          formatDateRange(trip.startsAt, trip.endsAt, locale),
          t("screen.studio.brief.capacity", { count: trip.totalCapacity }),
        ]
          .filter(Boolean)
          .join(" · ")}
        badge={
          <StudioBadge tone={trip.state === "completed" ? "ok" : "info"} icon={false}>
            {trip.state}
          </StudioBadge>
        }
        actions={
          <StudioLinkButton to={pathFor("SCR-PHO-07")}>
            {t("screen.studio.brief.albumsCta")}
          </StudioLinkButton>
        }
      />

      {trip.state !== "completed" ? (
        <StudioNotice tone="info" title={t("screen.studio.brief.notCompletedTitle")}>
          <p className="m-0 text-sm leading-5">{t("screen.studio.brief.notCompletedBody")}</p>
        </StudioNotice>
      ) : (
        <StudioNotice tone="ok" title={t("screen.studio.brief.completedTitle")}>
          <p className="m-0 text-sm leading-5">{t("screen.studio.brief.completedBody")}</p>
        </StudioNotice>
      )}

      <StudioRow align="start">
        <StudioCard
          title={t("screen.studio.brief.schedule")}
          className="basis-[560px] lg:flex-[3]"
          actions={
            <span className="text-[13px] text-[var(--te-ink-muted)]">
              {t("screen.studio.brief.scheduleHint", { zone: trip.timezone })}
            </span>
          }
        >
          {programs.length === 0 ? (
            <StudioEmpty title={t("screen.studio.brief.scheduleEmptyTitle")}>
              {t("screen.studio.brief.scheduleEmptyBody")}
            </StudioEmpty>
          ) : (
            <ol className="m-0 flex list-none flex-col gap-2 p-0">
              {programs.map((program) => {
                const day = new Intl.DateTimeFormat(locale, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  timeZone: trip.timezone,
                });
                const time = new Intl.DateTimeFormat(locale, {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: trip.timezone,
                });
                return (
                  <li
                    key={program.id}
                    className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-t border-[var(--te-hairline)] py-2 text-[15px] first:border-t-0"
                  >
                    <span className="font-bold">
                      {program.startsAt ? time.format(new Date(program.startsAt)) : NO_VALUE}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="font-medium">
                        {pick(locale, program.titleAr, program.titleEn)}
                      </span>
                      <span className="text-[13px] text-[var(--te-ink-muted)]">
                        {program.startsAt ? day.format(new Date(program.startsAt)) : ""} ·{" "}
                        {pick(locale, program.locationNameAr, program.locationNameEn) ??
                          t("screen.studio.brief.noLocation")}
                      </span>
                    </span>
                    <StudioBadge tone={program.isIncludedInBase ? "live" : "neu"} icon={false}>
                      {program.isIncludedInBase
                        ? t("screen.studio.brief.inScope")
                        : t("screen.studio.brief.optional")}
                    </StudioBadge>
                  </li>
                );
              })}
            </ol>
          )}
        </StudioCard>

        <div className="flex min-w-0 basis-[340px] flex-[2] flex-col gap-4">
          <section className="flex flex-col gap-2.5 rounded-[var(--te-radius-lg)] bg-[var(--te-ink)] p-5 text-[var(--te-ink-inverse)]">
            <h2 className="m-0 text-lg font-semibold">{t("screen.studio.brief.albumWindow")}</h2>
            <span className="text-[28px] leading-[34px] font-bold">
              {t("screen.studio.brief.albumCount", { count: tripAlbums.length })}
            </span>
            <span className="text-sm leading-5 text-[#b8bad6]">
              {t("screen.studio.brief.albumWindowCaption")}
            </span>
          </section>

          <StudioCard title={t("screen.studio.brief.group")}>
            <FactLine
              label={t("screen.studio.brief.groupCapacity")}
              value={t("screen.studio.brief.capacity", { count: trip.totalCapacity })}
            />
            <FactLine
              label={t("screen.studio.brief.groupConfirmed")}
              value={t("screen.studio.brief.capacity", { count: trip.confirmedSeatsCount })}
            />
            <FactLine
              label={t("screen.studio.brief.groupPrice")}
              value={formatMinorAmount(trip.basePriceMinor, trip.currencyCode, locale)}
            />
            <p className="m-0 text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
              {t("screen.studio.brief.privacyNote")}
            </p>
          </StudioCard>
        </div>
      </StudioRow>
    </StudioPage>
  );
}

function FactLine({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center justify-between border-t border-[var(--te-hairline)] py-2 text-sm first:border-t-0">
      <span className="text-[var(--te-ink-muted)]">{label}</span>
      <b>{value}</b>
    </span>
  );
}

function useTripIdParam(): { tripId: string | undefined } {
  // Route params read from the URL, the same way the other screens do it — this keeps the screen
  // independent of the generated route tree.
  const pathname = usePathname();
  return { tripId: matchWebRoute("studio", pathname)?.params.tripId };
}
