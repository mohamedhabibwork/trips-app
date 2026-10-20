// SCR-TRV-10 My bookings: upcoming and past tabs (proposed D-319), booking cards with the state
// and the next action. History depth follows the plan (Free sees the recent page only, FR-TRV-03).
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Segmented } from "@/components/kit/controls";
import { formatDateRange, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";
import { BookingCard, type BookingCardView } from "@/surfaces/traveler/components/cards";
import { ScreenEmpty, ScreenError, ScreenLoading } from "@/surfaces/traveler/components/states";
import { usePlanTier } from "@/surfaces/traveler/plan-tier";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";

const FREE_HISTORY_LIMIT = 5;
const UPCOMING = new Set(["pending_payment", "confirmed", "checked_in"]);

export function Trv10MyBookings() {
  const { t } = useAuth();
  const navigate = useNavigate();
  const planTier = usePlanTier();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const bookingsQuery = useQuery(
    serverQueryOptions(orpc.booking.listMyBookings, "booking/listMyBookings", { input: undefined }),
  );

  if (bookingsQuery.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (bookingsQuery.isError) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenError onRetry={() => void bookingsQuery.refetch()} />
      </div>
    );
  }

  // FR-TRV-03: Free sees a basic (recent) history; Explorer/VIP see the full list.
  const limit = planTier === undefined || planTier === "free" ? FREE_HISTORY_LIMIT : undefined;
  const all = bookingsQuery.data.slice(0, limit);
  const visible = all.filter((booking) =>
    tab === "upcoming" ? UPCOMING.has(booking.status) : !UPCOMING.has(booking.status),
  );

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.bookings.title")}</h1>
      <Segmented
        label={t("screen.traveler.bookings.tabs")}
        value={tab}
        onChange={setTab}
        options={[
          { value: "upcoming", label: t("screen.traveler.bookings.tabUpcoming") },
          { value: "past", label: t("screen.traveler.bookings.tabPast") },
        ]}
      />

      {visible.length === 0 ? (
        <ScreenEmpty
          title={t("screen.traveler.bookings.emptyTitle")}
          body={t("screen.traveler.bookings.emptyBody")}
          action={
            <button
              type="button"
              className="cursor-pointer underline"
              onClick={() => void navigate({ to: pathFor("SCR-TRV-01") })}
            >
              {t("screen.traveler.bookings.browseTrips")}
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((booking) => (
            <BookingCardItem key={booking.id} booking={booking} />
          ))}
        </div>
      )}

      {planTier === "free" ? (
        <p className="m-0 text-[13px] text-[var(--te-ink-muted)]">
          {t("screen.traveler.bookings.freeHistoryNote")}
        </p>
      ) : null}
    </div>
  );
}

function BookingCardItem({
  booking,
}: {
  booking: {
    id: string;
    tripId: string;
    bookingReference: string;
    status: string;
    totalAmountMinor: number;
    currencyCode: string;
    createdAt: string | Date;
  };
}) {
  const { locale } = useAuth();
  const navigate = useNavigate();
  const tripQuery = useQuery({
    ...serverQueryOptions(orpc.trips.getPublicTripDetail, "trips/getPublicTripDetail", {
      input: { tripId: booking.tripId },
    }),
    retry: false,
  });
  const trip = tripQuery.data?.trip ?? null;

  const view: BookingCardView = {
    id: booking.id,
    bookingReference: booking.bookingReference,
    tripTitle:
      tripQuery.isPending || tripQuery.isError
        ? booking.bookingReference
        : pick(locale, trip?.titleAr, trip?.titleEn) || booking.bookingReference,
    dates: formatDateRange(trip?.startsAt ?? null, trip?.endsAt ?? null, locale),
    status: booking.status,
    total: formatMinorAmount(booking.totalAmountMinor, booking.currencyCode, locale),
  };
  return (
    <BookingCard
      booking={view}
      onOpen={() => {
        if (booking.status === "pending_payment") {
          void navigate({ to: pathFor("SCR-TRV-07", { bookingId: booking.id }) });
        } else {
          void navigate({ to: pathFor("SCR-TRV-11", { bookingId: booking.id }) });
        }
      }}
    />
  );
}
