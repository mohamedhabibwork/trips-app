// SCR-TRV-06 Booking step 4: payment handoff. The platform never receives card data
// (NFR-SEC-12): the pay action opens the gateway's sandbox page in a new tab, then the traveler
// returns to the pending screen (TRV-07).
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, StatusPill } from "@/components/kit/controls";
import { useCountdown } from "@/components/kit/use-countdown";
import { formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { client, orpc } from "@/utils/orpc";
import { serverQueryOptions, serverRpc } from "@/utils/server-rpc";
import { formatHoldTime, holdSecondsLeft } from "@/surfaces/traveler/booking-wizard";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS } from "@/surfaces/traveler/util";

// The gateway is fixed when the payment intent is created (booking review, TRV-05); this screen
// only opens the handoff, so the method list is read-only and reflects the payment's gateway.
const GATEWAY_LABELS: Record<GatewayValue, string> = {
  stripe: "screen.traveler.pay.gateway.stripe",
  paymob: "screen.traveler.pay.gateway.paymob",
  tap: "screen.traveler.pay.gateway.tap",
  fawry: "screen.traveler.pay.gateway.fawry",
  stub: "screen.traveler.pay.gateway.stub",
};

type GatewayValue = "stripe" | "paymob" | "tap" | "fawry" | "stub";

export function Trv06PaymentHandoff({ bookingId: bookingIdProp }: { bookingId?: string } = {}) {
  const { t, locale } = useAuth();
  const routeParams = useParams({ strict: false });
  const bookingId = bookingIdProp ?? routeParams.bookingId ?? "";
  const search = useSearch({ from: "/traveler/bookings/$bookingId/pay" });
  const navigate = useNavigate();
  const [handoffError, setHandoffError] = useState<string | null>(null);

  const holdExpiry =
    search.holdUntil !== undefined && search.holdUntil !== ""
      ? new Date(Number(search.holdUntil))
      : null;
  const [secondsLeft] = useCountdown(holdSecondsLeft(holdExpiry));

  const bookingQuery = useQuery(
    serverQueryOptions(orpc.booking.getBooking, "booking/getBooking", { input: { bookingId } }),
  );
  const paymentQuery = useQuery({
    ...serverQueryOptions(orpc.payments.listPayments, "payments/listPayments", {
      input: undefined,
    }),
    enabled: typeof window !== "undefined",
  });

  const handoff = useMutation({
    mutationFn: async (paymentId: string) =>
      serverRpc<Awaited<ReturnType<typeof client.payments.getGatewayHandoff>>>(
        "payments/getGatewayHandoff",
        { paymentId },
      ),
    onSuccess: (result) => {
      window.open(result.redirectUrl, "_blank", "noopener");
      void navigate({
        to: pathFor("SCR-TRV-07", { bookingId }),
        search: { paymentId: search.paymentId },
      });
    },
    onError: () => setHandoffError(t("screen.traveler.pay.handoffFailed")),
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
  const booking = bookingQuery.data.booking;
  if (!booking) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenNotFound />
      </div>
    );
  }

  const holdRunning = holdExpiry !== null && secondsLeft > 0;
  const holdExpired = holdExpiry !== null && secondsLeft <= 0;
  const payment = (paymentQuery.data ?? []).find((item) => item.id === search.paymentId);
  const gateway = (payment?.gateway as GatewayValue | undefined) ?? "paymob";

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <p className="m-0 text-sm font-semibold text-[var(--te-ink-muted)]">
        {t("screen.traveler.wizard.step", { step: 4, of: 4 })}
      </p>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.pay.title")}</h1>
      <p className="m-0 text-[15px] text-[var(--te-ink-muted)]">{booking.bookingReference}</p>

      <p className="m-0 text-2xl font-bold">
        {formatMinorAmount(booking.totalAmountMinor, booking.currencyCode, locale)}
      </p>

      {holdRunning ? (
        <StatusPill tone="warning" icon="clock">
          {t("screen.traveler.wizard.holdRemaining", { time: formatHoldTime(secondsLeft) })}
        </StatusPill>
      ) : null}
      {holdExpired ? (
        <Notice tone="danger" strong>
          {t("screen.traveler.wizard.holdExpired")}
        </Notice>
      ) : null}

      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 text-[15px] font-semibold">
          {t("screen.traveler.pay.methodLabel")}
        </legend>
        {(Object.keys(GATEWAY_LABELS) as GatewayValue[]).map((value) => (
          <label key={value} className="flex items-center gap-3 text-[15px] opacity-80">
            <input
              type="radio"
              name="gateway"
              disabled
              checked={gateway === value}
              onChange={() => undefined}
              className="size-5"
            />
            {t(GATEWAY_LABELS[value])}
          </label>
        ))}
      </fieldset>

      <Notice tone="info">{t("screen.traveler.pay.noCardFields")}</Notice>
      {handoffError ? <Notice tone="danger">{handoffError}</Notice> : null}

      <Button
        block
        disabled={holdExpired || handoff.isPending || booking.status !== "pending_payment"}
        onClick={() => {
          if (payment) {
            handoff.mutate(payment.id);
          } else {
            setHandoffError(t("screen.traveler.pay.paymentMissing"));
          }
        }}
      >
        {handoff.isPending ? t("auth.common.submitting") : t("screen.traveler.pay.payNow")}
      </Button>
    </div>
  );
}
