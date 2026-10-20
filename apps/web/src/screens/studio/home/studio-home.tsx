// SCR-PHO-01 Studio home: the day's KPIs, the assignment board and what needs attention
// (docs/design/web/PhoWebHome.dc.html). Every number comes from a procedure or stays "—".
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuth } from "@/auth/auth-context";
import { formatDateRange, formatDateTime, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import {
  NO_VALUE,
  StudioBadge,
  StudioCard,
  StudioEmpty,
  StudioError,
  StudioKpi,
  StudioKpiRow,
  StudioLink,
  StudioLinkButton,
  StudioLoading,
  StudioPage,
  StudioPageHeader,
  StudioRow,
} from "../studio-ui";
import { useStudioPlan } from "../studio-plan";
import {
  OPEN_DEAL_STATUSES,
  PHOTOGRAPHER_TURN_STATUSES,
  dealStatusMeta,
  dealStatusLabel,
} from "../studio-vocab";

export function StudioHome() {
  const { t, locale } = useAuth();
  const enabled = typeof window !== "undefined";
  const plan = useStudioPlan();

  const offersQuery = useQuery({
    ...serverQueryOptions(orpc.negotiation.listSupplierOffers, "negotiation/listSupplierOffers", {
      input: {},
      enabled,
      retry: false,
    }),
  });
  const blocksQuery = useQuery({
    ...serverQueryOptions(orpc.availability.listMyBlocks, "availability/listMyBlocks", {
      input: undefined,
      enabled,
      retry: false,
    }),
  });
  const albumsQuery = useQuery({
    ...serverQueryOptions(orpc.photographer.listTripAlbums, "photographer/listTripAlbums", {
      input: {},
      enabled,
      retry: false,
    }),
  });

  const offers = offersQuery.data?.items ?? [];
  const albums = albumsQuery.data ?? [];
  const openOffers = offers.filter((offer) => OPEN_DEAL_STATUSES.includes(offer.status));
  const yourTurnOffers = offers.filter((offer) =>
    PHOTOGRAPHER_TURN_STATUSES.includes(offer.status),
  );
  const acceptedOffers = offers.filter((offer) => offer.status === "accepted");
  const albumsInFlight = albums.filter((album) => album.status === "draft");

  const unavailableBlocks = (blocksQuery.data?.items ?? [])
    .filter((block) => block.blockType === "unavailable")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const nextBlock = unavailableBlocks.find(
    (block) => new Date(block.endsAt).getTime() >= Date.now(),
  );

  const loading =
    plan.loading || offersQuery.isPending || blocksQuery.isPending || albumsQuery.isPending;
  const failed = offersQuery.isError && blocksQuery.isError && albumsQuery.isError;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t("screen.studio.home.greetingMorning");
    if (hour < 18) return t("screen.studio.home.greetingAfternoon");
    return t("screen.studio.home.greetingEvening");
  }, [t]);

  const portfolioCount = plan.profile?.portfolioPhotoCount ?? null;
  const portfolioMax = plan.portfolioPhotosMax;

  if (loading) {
    return (
      <StudioPage>
        <StudioLoading rows={4} />
      </StudioPage>
    );
  }
  if (failed) {
    return (
      <StudioPage>
        <StudioError onRetry={() => void offersQuery.refetch()} />
      </StudioPage>
    );
  }

  return (
    <StudioPage>
      <StudioPageHeader
        title={greeting}
        caption={
          plan.profile
            ? plan.profile.scope === "organization"
              ? t("screen.studio.home.subtitleOrg")
              : t("screen.studio.home.subtitlePlatform", {
                  regions:
                    plan.profile.serviceRegions.join(" · ") || t("screen.studio.common.noRegions"),
                })
            : t("screen.studio.home.subtitleUnsigned")
        }
        badge={
          plan.profile?.status === "active" ? (
            <StudioBadge tone="ok">{t("screen.studio.common.profileActive")}</StudioBadge>
          ) : null
        }
        actions={
          <>
            <StudioLinkButton to={pathFor("SCR-PHO-04")} variant="secondary">
              {t("screen.studio.home.ctaAvailability")}
            </StudioLinkButton>
            <StudioLinkButton to={pathFor("SCR-PHO-05")}>
              {yourTurnOffers.length > 0
                ? t("screen.studio.home.ctaDeals", { count: yourTurnOffers.length })
                : t("screen.studio.home.ctaDealsNone")}
            </StudioLinkButton>
          </>
        }
      />

      <StudioKpiRow>
        <StudioKpi
          label={t("screen.studio.home.kpi.deals")}
          value={openOffers.length}
          unit={t("screen.studio.home.kpi.waiting")}
          href={pathFor("SCR-PHO-05")}
        />
        <StudioKpi
          label={t("screen.studio.home.kpi.agreed")}
          value={acceptedOffers.length}
          unit={t("screen.studio.home.kpi.dealsUnit")}
          hint={t("screen.studio.home.kpi.agreedHint")}
          href={pathFor("SCR-PHO-05")}
        />
        <StudioKpi
          label={t("screen.studio.home.kpi.albums")}
          value={albumsInFlight.length}
          hint={t("screen.studio.home.kpi.albumsHint")}
          href={pathFor("SCR-PHO-07")}
        />
        <StudioKpi
          label={t("screen.studio.home.kpi.portfolio")}
          value={portfolioCount ?? NO_VALUE}
          unit={
            portfolioMax ? t("screen.studio.home.kpi.ofCount", { count: portfolioMax }) : undefined
          }
          progressPercent={
            portfolioCount !== null && portfolioMax
              ? (portfolioCount / portfolioMax) * 100
              : undefined
          }
          hint={t("screen.studio.home.kpi.portfolioHint")}
          href={pathFor("SCR-PHO-02")}
        />
        <StudioKpi
          label={t("screen.studio.home.kpi.availability")}
          value={
            nextBlock ? formatDateRange(nextBlock.startsAt, nextBlock.endsAt, locale) : NO_VALUE
          }
          hint={
            nextBlock
              ? t("screen.studio.home.kpi.availabilityHint")
              : t("screen.studio.home.kpi.availabilityClear")
          }
          href={pathFor("SCR-PHO-04")}
        />
      </StudioKpiRow>

      <StudioRow align="start">
        <StudioCard
          title={t("screen.studio.home.assignments")}
          className="basis-[560px] lg:flex-[3]"
          actions={
            <StudioLink to={pathFor("SCR-PHO-07")}>{t("screen.studio.home.albumsLink")}</StudioLink>
          }
        >
          {offers.length === 0 ? (
            <StudioEmpty title={t("screen.studio.home.assignmentsEmptyTitle")}>
              {t("screen.studio.home.assignmentsEmptyBody")}
            </StudioEmpty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-[15px]">
                <thead>
                  <tr className="text-[13px] text-[var(--te-ink-muted)]">
                    <th scope="col" className="px-0 pb-2 text-start font-semibold">
                      {t("screen.studio.common.trip")}
                    </th>
                    <th scope="col" className="px-3 pb-2 text-start font-semibold">
                      {t("screen.studio.common.fee")}
                    </th>
                    <th scope="col" className="px-3 pb-2 text-start font-semibold">
                      {t("screen.studio.common.status")}
                    </th>
                    <th scope="col" className="px-0 pb-2 text-end font-semibold">
                      {t("screen.studio.home.nextStep")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {offers.slice(0, 6).map((offer) => (
                    <tr key={offer.id} className="border-t border-[var(--te-hairline)]">
                      <td className="py-3 pe-3">
                        <StudioLink
                          to={pathFor("SCR-PHO-06", { tripId: offer.tripId })}
                          className="block"
                        >
                          {t("screen.studio.common.tripIdLabel", { id: offer.tripId.slice(0, 8) })}
                        </StudioLink>
                        <span className="text-[13px] text-[var(--te-ink-muted)]">
                          {t("screen.studio.common.expires", {
                            when: formatDateTime(offer.expiresAt, locale),
                          })}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        {formatMinorAmount(offer.currentOfferMinor, offer.currencyCode, locale)}
                      </td>
                      <td className="px-3 py-3">
                        <StudioBadge tone={dealStatusMeta(offer.status).tone}>
                          {dealStatusLabel(offer.status)}
                        </StudioBadge>
                      </td>
                      <td className="py-3 text-end text-sm font-semibold">
                        <StudioLink
                          to={
                            offer.status === "accepted"
                              ? pathFor("SCR-PHO-06", { tripId: offer.tripId })
                              : pathFor("SCR-PHO-05")
                          }
                        >
                          {offer.status === "accepted"
                            ? t("screen.studio.home.stepBrief")
                            : t("screen.studio.home.stepDeals")}
                        </StudioLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </StudioCard>

        <StudioCard title={t("screen.studio.home.attention")} className="basis-[320px] lg:flex-[2]">
          <AttentionList yourTurn={yourTurnOffers.length} albumsInFlight={albumsInFlight.length} />
        </StudioCard>
      </StudioRow>
    </StudioPage>
  );
}

function AttentionList({ yourTurn, albumsInFlight }: { yourTurn: number; albumsInFlight: number }) {
  const { t } = useAuth();
  const items: Array<{ title: string; body: string; href: string }> = [];
  if (albumsInFlight > 0) {
    items.push({
      title: t("screen.studio.home.attention.albumsTitle", { count: albumsInFlight }),
      body: t("screen.studio.home.attention.albumsBody"),
      href: pathFor("SCR-PHO-07"),
    });
  }
  if (yourTurn > 0) {
    items.push({
      title: t("screen.studio.home.attention.dealsTitle", { count: yourTurn }),
      body: t("screen.studio.home.attention.dealsBody"),
      href: pathFor("SCR-PHO-05"),
    });
  }
  items.push({
    title: t("screen.studio.home.attention.ratesTitle"),
    body: t("screen.studio.home.attention.ratesBody"),
    href: pathFor("SCR-PHO-04"),
  });
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <StudioLink
          key={item.title}
          to={item.href}
          className="block rounded-[var(--te-radius-md)] bg-[var(--te-surface)] p-3 no-underline"
        >
          <span className="block text-[15px] font-semibold text-[var(--te-ink)]">{item.title}</span>
          <span className="mt-0.5 block text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
            {item.body}
          </span>
        </StudioLink>
      ))}
    </div>
  );
}
