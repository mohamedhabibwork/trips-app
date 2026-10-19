// SCR-TRV-08 Payment failed (retry): a generic failure reason, the remaining hold time, and the
// retry that keeps the cart within the 15-minute window (FR-BKG-03, BRL-08).
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, StatusPill } from "@/components/kit/controls";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS } from "@/surfaces/traveler/util";

export function Trv08PaymentFailed({ bookingId: bookingIdProp }: { bookingId?: string } = {}) {
  const { t } = useAuth();
  const routeParams = useParams({ strict: false });
  const bookingId = bookingIdProp ?? routeParams.bookingId ?? "";
  const navigate = useNavigate();

  const bookingQuery = useQuery(orpc.booking.getBooking.queryOptions({ input: { bookingId } }));

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

  const holdActive = booking.status === "pending_payment";

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <StatusPill tone="danger" icon="alert">
        {t("screen.traveler.failed.badge")}
      </StatusPill>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.failed.title")}</h1>
      <p className="m-0 text-[15px] text-[var(--te-ink-muted)]">{booking.bookingReference}</p>
      <Notice tone="danger" strong>
        {t("screen.traveler.failed.reason")}
      </Notice>
      {holdActive ? (
        <>
          <Notice tone="info">{t("screen.traveler.failed.cartKept")}</Notice>
          <Button block onClick={() => void navigate({ to: pathFor("SCR-TRV-06", { bookingId }) })}>
            {t("screen.traveler.failed.retry")}
          </Button>
          <Button
            tone="outline"
            block
            onClick={() =>
              void navigate({
                to: pathFor("SCR-TRV-06", { bookingId }),
                search: {},
              })
            }
          >
            {t("screen.traveler.failed.changeMethod")}
          </Button>
        </>
      ) : (
        <>
          <Notice tone="warning" strong>
            {t("screen.traveler.failed.holdExpired")}
          </Notice>
          <Button
            block
            onClick={() => void navigate({ to: pathFor("SCR-TRV-02", { tripId: booking.tripId }) })}
          >
            {t("screen.traveler.failed.bookAgain")}
          </Button>
        </>
      )}
    </div>
  );
}
