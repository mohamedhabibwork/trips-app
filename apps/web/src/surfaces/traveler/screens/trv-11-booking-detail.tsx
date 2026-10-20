// SCR-TRV-11 Booking detail: travelers, programs, seats, coupon and discount, totals, payment
// status, cancellation policy summary (D-07 placeholder tiers) and the actions allowed in the
// booking's current state (cancel, trip day, receipts, retry payment).
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice } from "@/components/kit/controls";
import { formatDateRange, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";
import { BookingStatusPill } from "@/surfaces/traveler/components/cards";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";

const POLICY_ROWS = [
  { minHours: 48, percent: 80 },
  { minHours: 24, percent: 50 },
  { minHours: 0, percent: 0 },
] as const;

export function Trv11BookingDetail({ bookingId: bookingIdProp }: { bookingId?: string } = {}) {
  const { t, locale } = useAuth();
  const routeParams = useParams({ strict: false });
  const bookingId = bookingIdProp ?? routeParams.bookingId ?? "";
  const navigate = useNavigate();

  const bookingQuery = useQuery(
    serverQueryOptions(orpc.booking.getBooking, "booking/getBooking", { input: { bookingId } }),
  );
  const tripQuery = useQuery({
    ...serverQueryOptions(orpc.trips.getPublicTripDetail, "trips/getPublicTripDetail", {
      input: { tripId: bookingQuery.data?.booking?.tripId ?? "" },
    }),
    enabled: Boolean(bookingQuery.data?.booking?.tripId),
    retry: false,
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
  const cancellable = booking.status === "confirmed";
  const money = (minor: number) => formatMinorAmount(minor, booking.currencyCode, locale);

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-[var(--te-ink-muted)]">
          {booking.bookingReference}
        </span>
        <BookingStatusPill status={booking.status} />
      </div>
      <h1 className="m-0 text-[26px] leading-9 font-bold">
        {trip ? pick(locale, trip.titleAr, trip.titleEn) : booking.bookingReference}
      </h1>
      {trip ? (
        <p className="m-0 text-[15px] text-[var(--te-ink-muted)]">
          {formatDateRange(trip.startsAt, trip.endsAt, locale)}
        </p>
      ) : null}

      {booking.status === "pending_payment" ? (
        <Notice tone="warning" strong>
          {t("screen.traveler.detail.paymentFailedNotice")}
        </Notice>
      ) : null}
      {booking.status === "cancelled" ? (
        <Notice tone="info" strong>
          {booking.refundAmountMinor > 0
            ? t("screen.traveler.detail.refundInProgress")
            : t("screen.traveler.detail.cancelledNotice")}
        </Notice>
      ) : null}
      {booking.status === "refunded" ? (
        <Notice tone="success">
          {t("screen.traveler.detail.refundedNotice", { amount: money(booking.refundAmountMinor) })}
        </Notice>
      ) : null}

      <section className="flex flex-col gap-1.5 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-4 shadow-[var(--te-card-shadow)] text-[15px]">
        <p className="m-0 font-semibold">{t("screen.traveler.detail.travelersSection")}</p>
        <p className="m-0">
          {t("screen.traveler.confirmed.travelers", { count: booking.passengersCount })}
        </p>
        {(booking.seatLabels ?? []).length > 0 ? (
          <p className="m-0">
            {t("screen.traveler.confirmed.seats", {
              seats: (booking.seatLabels ?? []).join(", "),
            })}
          </p>
        ) : (
          <p className="m-0">{t("screen.traveler.confirmed.seatsAssignedLater")}</p>
        )}
        {pricing ? (
          <>
            <p className="m-0 border-t border-[var(--te-hairline)] pt-2">
              {t("screen.traveler.wizard.subtotal")}: {money(pricing.subtotalMinor)}
            </p>
            {pricing.programsTotalMinor > 0 ? (
              <p className="m-0">
                {t("screen.traveler.wizard.programsTotal")}: {money(pricing.programsTotalMinor)}
              </p>
            ) : null}
            {pricing.planDiscountMinor > 0 ? (
              <p className="m-0 text-[var(--te-success)]">
                {t("screen.traveler.wizard.discountLine")}: −{money(pricing.planDiscountMinor)}
              </p>
            ) : null}
            {pricing.couponDiscountMinor > 0 ? (
              <p className="m-0 text-[var(--te-success)]">
                {t("screen.traveler.wizard.couponLine", {
                  code: pricing.couponCode ?? "",
                })}
                : −{money(pricing.couponDiscountMinor)}
              </p>
            ) : null}
            <p className="m-0 border-t border-[var(--te-hairline)] pt-2 text-base font-bold">
              {t("screen.traveler.wizard.total")}: {money(pricing.totalAmountMinor)}
            </p>
          </>
        ) : (
          <p className="m-0 border-t border-[var(--te-hairline)] pt-2 text-base font-bold">
            {t("screen.traveler.wizard.total")}: {money(booking.totalAmountMinor)}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-1.5">
        <h2 className="m-0 text-lg font-semibold">{t("screen.traveler.detail.policyTitle")}</h2>
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm text-[var(--te-ink-muted)]">
          {POLICY_ROWS.map((row) => (
            <li key={row.minHours}>
              {t("screen.traveler.detail.policyRow", {
                hours: row.minHours,
                percent: row.percent,
              })}
            </li>
          ))}
          <li>{t("screen.traveler.detail.policyPlaceholder")}</li>
        </ul>
      </section>

      <div className="flex flex-col gap-3">
        {booking.status === "pending_payment" ? (
          <Button block onClick={() => void navigate({ to: pathFor("SCR-TRV-06", { bookingId }) })}>
            {t("screen.traveler.failed.retry")}
          </Button>
        ) : null}
        {cancellable ? (
          <Button
            tone="outline"
            block
            onClick={() => void navigate({ to: pathFor("SCR-TRV-12", { bookingId }) })}
          >
            {t("screen.traveler.detail.cancel")}
          </Button>
        ) : (
          <Notice tone="info">{t("screen.traveler.detail.cancelNotAllowed")}</Notice>
        )}
        <div className="flex flex-wrap gap-3">
          <Button
            tone="outline"
            onClick={() => void navigate({ to: pathFor("SCR-TRV-13", { bookingId }) })}
          >
            {t("screen.traveler.detail.tripDay")}
          </Button>
          <Button tone="outline" onClick={() => void navigate({ to: pathFor("SCR-TRV-14") })}>
            {t("screen.traveler.detail.receipts")}
          </Button>
        </div>
      </div>
    </div>
  );
}
