// SCR-TRV-09 Booking confirmed: reference, trip summary, travelers, seat (or the
// organization-assignment notice, D-62) and the receipt links (FR-BKG-05).
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, StatusPill } from "@/components/kit/controls";
import { formatDateRange, formatDateTime, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";

export function Trv09BookingConfirmed({ bookingId: bookingIdProp }: { bookingId?: string } = {}) {
  const { t, locale } = useAuth();
  const routeParams = useParams({ strict: false });
  const bookingId = bookingIdProp ?? routeParams.bookingId ?? "";
  const navigate = useNavigate();

  const bookingQuery = useQuery(orpc.booking.getBooking.queryOptions({ input: { bookingId } }));
  const tripQuery = useQuery({
    ...orpc.trips.getPublicTripDetail.queryOptions({
      input: { tripId: bookingQuery.data?.booking?.tripId ?? "" },
    }),
    enabled: Boolean(bookingQuery.data?.booking?.tripId),
  });

  if (bookingQuery.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (bookingQuery.isError) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenError onRetry={() => void bookingQuery.refetch()} />
      </div>
    );
  }
  const detail = bookingQuery.data;
  const booking = detail.booking;
  if (!booking) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenNotFound />
      </div>
    );
  }

  const trip = tripQuery.data?.trip ?? null;
  const pricing = detail.pricing;
  const syncing = booking.status !== "confirmed" && booking.status !== "checked_in";
  const hasSeats = (booking.seatLabels ?? []).length > 0;

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <StatusPill tone={syncing ? "warning" : "success"} icon={syncing ? "clock" : "check"}>
        {syncing ? t("screen.traveler.confirmed.syncing") : t("screen.traveler.confirmed.badge")}
      </StatusPill>
      <h1 className="m-0 text-[26px] leading-9 font-bold">
        {t("screen.traveler.confirmed.title")}
      </h1>
      <p className="m-0 text-lg font-bold">{booking.bookingReference}</p>

      {syncing ? <Notice tone="info">{t("screen.traveler.confirmed.syncNote")}</Notice> : null}

      <section className="flex flex-col gap-1.5 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-4 shadow-[var(--te-card-shadow)] text-[15px]">
        {trip ? (
          <p className="m-0 font-semibold">{pick(locale, trip.titleAr, trip.titleEn)}</p>
        ) : null}
        {trip ? (
          <p className="m-0 text-[var(--te-ink-muted)]">
            {formatDateRange(trip.startsAt, trip.endsAt, locale)}
          </p>
        ) : null}
        <p className="m-0">
          {t("screen.traveler.confirmed.travelers", { count: booking.passengersCount })}
        </p>
        <p className="m-0">
          {hasSeats
            ? t("screen.traveler.confirmed.seats", { seats: (booking.seatLabels ?? []).join(", ") })
            : t("screen.traveler.confirmed.seatsAssignedLater")}
        </p>
        {pricing ? (
          <p className="m-0 border-t border-[var(--te-hairline)] pt-2 text-base font-bold">
            {t("screen.traveler.wizard.total")}:{" "}
            {formatMinorAmount(pricing.totalAmountMinor, booking.currencyCode, locale)}
          </p>
        ) : (
          <p className="m-0 border-t border-[var(--te-hairline)] pt-2 text-base font-bold">
            {formatMinorAmount(booking.totalAmountMinor, booking.currencyCode, locale)}
          </p>
        )}
        {detail.boardingPasses?.[0]?.qrCodeToken ? (
          <p className="m-0 text-[13px] text-[var(--te-ink-muted)]">
            {t("screen.traveler.confirmed.qrNote", {
              seat: detail.boardingPasses[0]?.seatLabel ?? "—",
              issued: formatDateTime(booking.createdAt, locale),
            })}
          </p>
        ) : null}
      </section>

      <Button block onClick={() => void navigate({ to: pathFor("SCR-TRV-11", { bookingId }) })}>
        {t("screen.traveler.confirmed.viewBooking")}
      </Button>
      <Notice tone="info">{t("screen.traveler.confirmed.channelsNote")}</Notice>
    </div>
  );
}
