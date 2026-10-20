// SCR-TRV-13 Trip day: the traveler's own vehicle, seat and boarding state (BRL-01 — no other
// travelers are ever shown), plus the trip notice board.
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Notice, StatusPill } from "@/components/kit/controls";
import { formatDateTime } from "@/components/kit/format";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";

export function Trv13TripDay({ bookingId: bookingIdProp }: { bookingId?: string } = {}) {
  const { t, locale } = useAuth();
  const routeParams = useParams({ strict: false });
  const bookingId = bookingIdProp ?? routeParams.bookingId ?? "";

  const tripDayQuery = useQuery(
    serverQueryOptions(orpc.traveler.tripDay.getMyTripDay, "traveler/tripDay/getMyTripDay", {
      input: { bookingId },
    }),
  );

  if (tripDayQuery.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (tripDayQuery.isError) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenError onRetry={() => void tripDayQuery.refetch()} />
      </div>
    );
  }
  const day = tripDayQuery.data.tripDay;
  if (!day) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenNotFound />
      </div>
    );
  }

  const boarding = day.boardingPasses[0]?.status ?? "not_boarded";
  const tripStateLabel = t(`screen.traveler.tripState.${day.trip.state}`);

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.tripDay.title")}</h1>
      <p className="m-0 text-[15px] text-[var(--te-ink-muted)]">{day.booking.bookingReference}</p>

      <section className="flex flex-col gap-2 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-4 shadow-[var(--te-card-shadow)]">
        <p className="m-0 text-[15px] font-semibold">
          {pick(locale, day.trip.titleAr, day.trip.titleEn)}
        </p>
        <p className="m-0 text-[15px]">
          {t("screen.traveler.tripDay.tripStatus")}: {tripStateLabel}
        </p>
        {day.vehicle ? (
          <p className="m-0 text-[15px]">
            {t("screen.traveler.tripDay.vehicle", {
              model: day.vehicle.model,
              plate: day.vehicle.plateNumber,
            })}
          </p>
        ) : (
          <p className="m-0 text-[15px] text-[var(--te-ink-muted)]">
            {t("screen.traveler.tripDay.vehiclePending")}
          </p>
        )}
        <p className="m-0 text-[15px]">
          {day.booking.seatLabels.length > 0
            ? t("screen.traveler.confirmed.seats", { seats: day.booking.seatLabels.join(", ") })
            : t("screen.traveler.confirmed.seatsAssignedLater")}
        </p>
        <StatusPill tone={boarding === "checked_in" ? "success" : "info"} icon="check">
          {t(
            boarding === "checked_in"
              ? "screen.traveler.tripDay.checkedIn"
              : "screen.traveler.tripDay.notBoarded",
          )}
        </StatusPill>
      </section>

      <section aria-labelledby="trv13-notices" className="flex flex-col gap-2">
        <h2 id="trv13-notices" className="m-0 text-lg font-semibold">
          {t("screen.traveler.tripDay.notices")}
        </h2>
        {day.notices.length === 0 ? (
          <p className="m-0 text-sm text-[var(--te-ink-muted)]">
            {t("screen.traveler.tripDay.noNotices")}
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {day.notices.map((notice) => (
              <li key={notice.id}>
                <Notice tone="info">
                  <span className="block font-semibold">
                    {pick(locale, notice.titleAr, notice.titleEn)}
                  </span>
                  <span className="block">{pick(locale, notice.bodyAr, notice.bodyEn)}</span>
                  <span className="mt-1 block text-[12px] opacity-70">
                    {formatDateTime(notice.createdAt, locale)}
                  </span>
                </Notice>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Notice tone="info">{t("screen.traveler.tripDay.privacyNote")}</Notice>
    </div>
  );
}
