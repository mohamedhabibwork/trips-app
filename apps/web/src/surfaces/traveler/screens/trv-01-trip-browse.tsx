// SCR-TRV-01 Trip browse (home): the trips this viewer may see, with search and state badges.
// Rendered fully on the server for anonymous visitors (browsePublicTrips is public).
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Notice, TextField } from "@/components/kit/controls";
import { formatDateRange, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";
import { TripCard, type TripCardView } from "@/surfaces/traveler/components/cards";
import { ScreenEmpty, ScreenError, ScreenLoading } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS } from "@/surfaces/traveler/util";
import { pick } from "@/surfaces/traveler/util";
import { useState } from "react";

export function Trv01TripBrowse() {
  const { t, locale } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const tripsQuery = useQuery(
    serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", { input: {} }),
  );

  // The server already hides VIP early-access trips from non-VIP viewers, so a trip listed here is
  // bookable by this viewer; the badge is only cosmetic and not derivable from the public DTO.
  const trips: TripCardView[] = (tripsQuery.data?.items ?? []).map((trip) => ({
    id: trip.id,
    title: pick(locale, trip.titleAr, trip.titleEn) || trip.id,
    organization: pick(locale, trip.organizerNameAr, trip.organizerNameEn),
    dates: formatDateRange(trip.startsAt, trip.endsAt, locale),
    route: [
      pick(locale, trip.origin?.nameAr, trip.origin?.nameEn),
      ...trip.destinations.map((point) => pick(locale, point.nameAr, point.nameEn)),
    ]
      .filter(Boolean)
      .join(" → "),
    seatModeLabel:
      trip.seatAssignmentMode === "traveler_choice"
        ? t("screen.traveler.common.seatMode.selfSelect")
        : t("screen.traveler.common.seatMode.orgAssigned"),
    price: formatMinorAmount(trip.basePriceMinor, trip.currencyCode, locale),
    seatsLeft: trip.remainingSeatsCount,
    totalCapacity: trip.totalCapacity,
    vipEarlyAccess: false,
    soldOut: trip.totalCapacity > 0 && trip.remainingSeatsCount <= 0,
  }));

  const visible = trips.filter((trip) =>
    search.trim() ? trip.title.toLowerCase().includes(search.trim().toLowerCase()) : true,
  );

  function open(id: string) {
    void navigate({ to: pathFor("SCR-TRV-02", { tripId: id }) });
  }

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <header className="flex flex-col gap-3">
        <h1 className="m-0 text-[28px] leading-9 font-bold">{t("screen.traveler.browse.title")}</h1>
        <p className="m-0 text-[15px] text-[var(--te-ink-muted)]">
          {t("screen.traveler.browse.lead")}
        </p>
        <TextField
          label={t("screen.traveler.browse.searchLabel")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("screen.traveler.browse.searchPlaceholder")}
          type="search"
        />
      </header>

      {tripsQuery.isPending ? (
        <ScreenLoading />
      ) : tripsQuery.isError ? (
        <ScreenError onRetry={() => void tripsQuery.refetch()} />
      ) : visible.length === 0 ? (
        <ScreenEmpty
          title={t("screen.traveler.browse.emptyTitle")}
          body={t("screen.traveler.browse.emptyBody")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onOpen={() => open(trip.id)}
              actionLabel={t("screen.traveler.browse.openTrip")}
            />
          ))}
        </div>
      )}

      <Notice tone="info">{t("screen.traveler.browse.vipEarlyAccessNote")}</Notice>
    </div>
  );
}
