// SCR-TRV-05 Booking step 3: coupon and order summary. One coupon (FR-BKG-01); a rejection shows
// the first failing reason, and another creator's coupon reads as the generic "not applicable"
// message (FR-CPN-02, D-23). The hold timer keeps running; expiry sends the traveler back.
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, StatusPill, TextField } from "@/components/kit/controls";
import { formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { client, orpc } from "@/utils/orpc";
import {
  formatHoldTime,
  holdSecondsLeft,
  parseProgramIds,
  wizardTier,
} from "@/surfaces/traveler/booking-wizard";
import { useCountdown } from "@/components/kit/use-countdown";
import { useTravelerProfile } from "@/surfaces/traveler/plan-tier";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";

export function Trv05BookingReview({ tripId: tripIdProp }: { tripId?: string } = {}) {
  const { t, locale } = useAuth();
  const routeParams = useParams({ strict: false });
  const tripId = tripIdProp ?? routeParams.tripId ?? "";
  const search = useSearch({ from: "/traveler/book/$tripId/review" });
  const navigate = useNavigate();
  const profile = useTravelerProfile();

  const travelers = search.travelers ?? 1;
  const selectedProgramIds = parseProgramIds(search.programs);
  const seatLabels = (search.seats ?? "").split(",").filter(Boolean);
  const [couponInput, setCouponInput] = useState(search.coupon ?? "");
  const [coupon, setCoupon] = useState<string | null>(search.coupon || null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponAccepted, setCouponAccepted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [secondsLeft] = useCountdown(
    holdSecondsLeft(search.holdUntil ? new Date(Number(search.holdUntil)) : null),
  );
  const holdExpired = Boolean(search.holdUntil) && secondsLeft <= 0;

  const tripQuery = useQuery(orpc.trips.getPublicTripDetail.queryOptions({ input: { tripId } }));
  const programsQuery = useQuery(
    orpc.programs.listPublicTripPrograms.queryOptions({ input: { tripId } }),
  );

  const createBooking = useMutation({
    mutationFn: async () => {
      const trip = tripQuery.data?.trip;
      if (!trip) throw new Error("missing trip");
      const booking = await client.booking.createBooking({
        tripId,
        vehicleId: search.vehicle ?? null,
        passengers: Array.from({ length: travelers }, (_, index) => ({
          id: `p-${index + 1}`,
          fullName:
            index === 0
              ? (profile.data?.fullName ?? t("screen.traveler.wizard.leadTraveler"))
              : t("screen.traveler.wizard.additionalTraveler", { index: index + 1 }),
          isChild: false,
        })),
        selectedProgramIds,
        seatLabels,
        couponCode: coupon,
        paymentGateway: "paymob",
        planTier: wizardTier(profile.data?.travelerPlanTier),
      });
      const payment = await client.payments.createPaymentIntent({
        bookingId: booking.booking.id,
        purpose: "trip_booking",
        gateway: "paymob",
        currencyCode: "EGP",
      });
      return { bookingId: booking.booking.id, paymentId: payment.id };
    },
    onSuccess: ({ bookingId, paymentId }) => {
      void navigate({
        to: pathFor("SCR-TRV-06", { bookingId }),
        search: { paymentId },
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error);
      setSubmitError(
        message.includes("not applicable")
          ? t("screen.traveler.wizard.couponNotApplicable")
          : message.includes("Coupon rejected")
            ? message
            : t("screen.traveler.wizard.createBookingFailed"),
      );
    },
  });

  if (tripQuery.isPending || programsQuery.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (tripQuery.isError || programsQuery.isError) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenError onRetry={() => void tripQuery.refetch()} />
      </div>
    );
  }
  const trip = tripQuery.data.trip;
  if (!trip) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenNotFound />
      </div>
    );
  }

  const programs = (programsQuery.data?.items ?? []).filter((program) =>
    selectedProgramIds.includes(program.id),
  );
  const programsTotalMinor = programs.reduce(
    (sum, program) => sum + (program.isIncludedInBase ? 0 : program.priceMinor * travelers),
    0,
  );
  const subtotalMinor = trip.basePriceMinor * travelers;
  const tier = wizardTier(profile.data?.travelerPlanTier);
  const planPercent = tier === "vip" ? 10 : tier === "explorer" ? 5 : 0;
  const planDiscountMinor = Math.floor((programsTotalMinor * planPercent) / 100);

  function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponError(null);
    setCouponAccepted(false);
    client.coupons
      .validateCoupon({ code, tripId, subtotalMinor: subtotalMinor + programsTotalMinor })
      .then(() => {
        setCoupon(code);
        setCouponAccepted(true);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        setCouponError(
          message.includes("not applicable")
            ? t("screen.traveler.wizard.couponNotApplicable")
            : message,
        );
      });
  }

  function continueToPayment() {
    setSubmitError(null);
    createBooking.mutate();
  }

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <p className="m-0 text-sm font-semibold text-[var(--te-ink-muted)]">
        {t("screen.traveler.wizard.step", { step: 3, of: 4 })}
      </p>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.wizard.title3")}</h1>

      {search.holdUntil ? (
        holdExpired ? (
          <Notice tone="danger" strong>
            {t("screen.traveler.wizard.holdExpired")}
          </Notice>
        ) : (
          <StatusPill tone="warning" icon="clock">
            {t("screen.traveler.wizard.holdRemaining", {
              time: formatHoldTime(secondsLeft),
            })}
          </StatusPill>
        )
      ) : null}

      <section aria-labelledby="trv05-lines" className="flex flex-col gap-2">
        <h2 id="trv05-lines" className="m-0 text-lg font-semibold">
          {t("screen.traveler.wizard.orderLines")}
        </h2>
        <dl className="m-0 flex flex-col gap-1.5 text-[15px]">
          <div className="flex justify-between gap-4">
            <dt>
              {t("screen.traveler.wizard.lineTrip", {
                trip: pick(locale, trip.titleAr, trip.titleEn),
                count: travelers,
              })}
            </dt>
            <dd className="m-0">{formatMinorAmount(subtotalMinor, trip.currencyCode, locale)}</dd>
          </div>
          {programs.map((program) => (
            <div key={program.id} className="flex justify-between gap-4">
              <dt>{pick(locale, program.titleAr, program.titleEn)}</dt>
              <dd className="m-0">
                {program.isIncludedInBase
                  ? t("screen.traveler.detail.programIncluded")
                  : formatMinorAmount(program.priceMinor * travelers, program.currencyCode, locale)}
              </dd>
            </div>
          ))}
          {seatLabels.length > 0 ? (
            <div className="flex justify-between gap-4 text-[var(--te-ink-muted)]">
              <dt>{t("screen.traveler.wizard.lineSeats")}</dt>
              <dd className="m-0">{seatLabels.join(", ")}</dd>
            </div>
          ) : null}
          {planDiscountMinor > 0 ? (
            <div className="flex justify-between gap-4 text-[var(--te-success)]">
              <dt>
                {t(
                  tier === "vip"
                    ? "screen.traveler.wizard.discountVip"
                    : "screen.traveler.wizard.discountExplorer",
                )}
              </dt>
              <dd className="m-0">
                −{formatMinorAmount(planDiscountMinor, trip.currencyCode, locale)}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 border-t border-[var(--te-hairline)] pt-2 text-base font-bold">
            <dt>{t("screen.traveler.wizard.total")}</dt>
            <dd className="m-0">
              {formatMinorAmount(
                Math.max(0, subtotalMinor + programsTotalMinor - planDiscountMinor),
                trip.currencyCode,
                locale,
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="trv05-coupon" className="flex flex-col gap-2">
        <h2 id="trv05-coupon" className="m-0 text-lg font-semibold">
          {t("screen.traveler.wizard.couponTitle")}
        </h2>
        {couponAccepted && coupon ? (
          <Notice tone="success">
            {t("screen.traveler.wizard.couponAccepted", { code: coupon })}
          </Notice>
        ) : null}
        {couponError ? <Notice tone="danger">{couponError}</Notice> : null}
        <div className="flex flex-wrap items-end gap-3">
          <TextField
            label={t("screen.traveler.wizard.couponField")}
            value={couponInput}
            onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
            fieldClassName="w-56"
          />
          <Button tone="outline" onClick={applyCoupon} disabled={!couponInput.trim()}>
            {t("screen.traveler.wizard.applyCoupon")}
          </Button>
        </div>
        <p className="m-0 text-[13px] text-[var(--te-ink-muted)]">
          {t("screen.traveler.wizard.couponOneOnly")}
        </p>
      </section>

      {submitError ? (
        <Notice tone="danger" strong>
          {submitError}
        </Notice>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button block onClick={continueToPayment} disabled={createBooking.isPending || holdExpired}>
          {createBooking.isPending
            ? t("auth.common.submitting")
            : t("screen.traveler.wizard.continueToPayment")}
        </Button>
        <Button
          tone="outline"
          onClick={() =>
            void navigate({
              to: pathFor("SCR-TRV-03", { tripId }),
              search: { travelers, programs: search.programs },
            })
          }
        >
          {t("screen.traveler.common.back")}
        </Button>
      </div>
    </div>
  );
}
