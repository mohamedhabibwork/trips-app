// Trip card (SCR-TRV-01/02), booking card (SCR-TRV-10) and the plan badge, shared by the
// traveler screens. Callers translate the labels; money always carries its currency (UI-06).
import { useAuth } from "@/auth/auth-context";
import { StatusPill } from "@/components/kit/controls";
import type { PlanTier } from "@/surfaces/traveler/plan-tier";

export interface TripCardView {
  id: string;
  title: string;
  organization: string;
  dates: string;
  route: string;
  seatModeLabel: string;
  price: string;
  seatsLeft: number;
  totalCapacity: number;
  vipEarlyAccess: boolean;
  soldOut: boolean;
}

export function TripCard({
  trip,
  onOpen,
  actionLabel,
}: {
  trip: TripCardView;
  onOpen: () => void;
  actionLabel: string;
}) {
  const { t } = useAuth();
  return (
    <article className="flex flex-col gap-2 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-5 shadow-[var(--te-card-shadow)] transition-shadow hover:shadow-[var(--te-card-shadow-hover)]">
      <div className="flex flex-wrap items-center gap-2">
        {trip.vipEarlyAccess ? (
          <StatusPill tone="warning" icon="ticket">
            {t("screen.traveler.browse.vipEarlyAccessBadge")}
          </StatusPill>
        ) : null}
        {trip.soldOut ? (
          <StatusPill tone="danger" icon="lock">
            {t("screen.traveler.browse.soldOutBadge")}
          </StatusPill>
        ) : (
          <StatusPill tone="success" icon="check">
            {t("screen.traveler.browse.seatsLeft", { count: trip.seatsLeft })}
          </StatusPill>
        )}
      </div>
      <h3 className="m-0 text-lg leading-7 font-bold">{trip.title}</h3>
      <p className="m-0 text-sm text-[var(--te-ink-muted)]">{trip.organization}</p>
      <p className="m-0 text-sm">
        {trip.dates}
        {trip.route ? ` · ${trip.route}` : ""}
      </p>
      <p className="m-0 text-sm text-[var(--te-ink-muted)]">{trip.seatModeLabel}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
        <span className="text-base font-bold">{trip.price}</span>
        <button type="button" className="cursor-pointer underline" onClick={onOpen}>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

const BOOKING_TONE: Record<string, "success" | "warning" | "danger" | "info"> = {
  pending_payment: "warning",
  confirmed: "success",
  checked_in: "info",
  completed: "info",
  cancelled: "danger",
  refunded: "info",
};

export function BookingStatusPill({ status }: { status: string }) {
  const { t } = useAuth();
  const tone = BOOKING_TONE[status] ?? "info";
  return (
    <StatusPill tone={tone} icon={status === "pending_payment" ? "clock" : undefined}>
      {t(`screen.traveler.bookingState.${status}`)}
    </StatusPill>
  );
}

export interface BookingCardView {
  id: string;
  bookingReference: string;
  tripTitle: string;
  dates: string;
  status: string;
  total: string;
}

export function BookingCard({ booking, onOpen }: { booking: BookingCardView; onOpen: () => void }) {
  const { t } = useAuth();
  return (
    <article className="flex flex-col gap-2 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-5 shadow-[var(--te-card-shadow)] transition-shadow hover:shadow-[var(--te-card-shadow-hover)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[var(--te-ink-muted)]">
          {booking.bookingReference}
        </span>
        <BookingStatusPill status={booking.status} />
      </div>
      <h3 className="m-0 text-lg leading-7 font-bold">{booking.tripTitle}</h3>
      <p className="m-0 text-sm text-[var(--te-ink-muted)]">{booking.dates}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
        <span className="text-base font-bold">{booking.total}</span>
        <button type="button" className="cursor-pointer underline" onClick={onOpen}>
          {booking.status === "pending_payment"
            ? t("screen.traveler.bookings.openPayment")
            : t("screen.traveler.bookings.openBooking")}
        </button>
      </div>
    </article>
  );
}

const PLAN_BADGE_TIER: Record<PlanTier, "neutral" | "info" | "warning"> = {
  free: "neutral",
  explorer: "info",
  vip: "warning",
};

export function PlanBadge({ tier }: { tier: PlanTier }) {
  const { t } = useAuth();
  return (
    <StatusPill tone={PLAN_BADGE_TIER[tier]} icon={tier === "vip" ? "ticket" : undefined}>
      {t(`screen.traveler.plan.tier.${tier}`)}
    </StatusPill>
  );
}
