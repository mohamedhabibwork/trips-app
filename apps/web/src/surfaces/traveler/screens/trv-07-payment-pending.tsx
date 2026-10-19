// SCR-TRV-07 Payment pending: the gateway has not confirmed yet. "Confirming payment" is shown
// while the check runs (D-30); a check finds confirmed (→ TRV-09) or failed (→ TRV-08).
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, StatusPill } from "@/components/kit/controls";
import { pathFor } from "@/navigation/web-routes";
import { client, orpc } from "@/utils/orpc";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS } from "@/surfaces/traveler/util";

export function Trv07PaymentPending({ bookingId: bookingIdProp }: { bookingId?: string } = {}) {
  const { t } = useAuth();
  const routeParams = useParams({ strict: false });
  const bookingId = bookingIdProp ?? routeParams.bookingId ?? "";
  const search = useSearch({ from: "/traveler/bookings/$bookingId/payment" });
  const navigate = useNavigate();

  const bookingQuery = useQuery(orpc.booking.getBooking.queryOptions({ input: { bookingId } }));

  // "Check status": asks the gateway adapter to settle the mock payment once (idempotent, FR-PAY-02)
  // and re-reads the booking.
  const checkStatus = useMutation({
    mutationFn: async () => {
      if (search.paymentId) {
        await client.payments
          .confirmPayment({ paymentId: search.paymentId })
          .catch(() => undefined);
      }
      return client.booking.getBooking({ bookingId });
    },
    onSuccess: (detail) => {
      const status = detail.booking?.status;
      if (status === "confirmed") {
        void navigate({ to: pathFor("SCR-TRV-09", { bookingId }) });
      } else if (status === "pending_payment" && detail.pricing === undefined) {
        // stays pending
      } else if (status !== "confirmed") {
        void navigate({ to: pathFor("SCR-TRV-08", { bookingId }) });
      }
    },
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

  if (booking.status === "confirmed") {
    void navigate({ to: pathFor("SCR-TRV-09", { bookingId }) });
  } else if (booking.status !== "pending_payment") {
    void navigate({ to: pathFor("SCR-TRV-08", { bookingId }) });
  }

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <StatusPill tone="warning" icon="clock">
        {checkStatus.isPending
          ? t("screen.traveler.pending.confirming")
          : t("screen.traveler.pending.badge")}
      </StatusPill>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.pending.title")}</h1>
      <p className="m-0 text-[15px] text-[var(--te-ink-muted)]">{booking.bookingReference}</p>
      <Notice tone="info">{t("screen.traveler.pending.whatHappensNext")}</Notice>
      <Notice tone="warning">{t("screen.traveler.pending.unresolvedNote")}</Notice>
      <Button block onClick={() => checkStatus.mutate()} disabled={checkStatus.isPending}>
        {checkStatus.isPending
          ? t("screen.traveler.pending.checking")
          : t("screen.traveler.pending.checkStatus")}
      </Button>
    </div>
  );
}
