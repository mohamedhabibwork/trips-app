// SCR-TRV-12 Cancel booking and refund preview: a decision screen, not a modal (D-07 placeholder
// tiers, BRL-12). Shows the time to departure, the policy row applied, the refund amount and the
// coupon reversal note; confirming leaves the booking in Refund Pending (FR-PAY-03).
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, StatusPill, TextAreaField } from "@/components/kit/controls";
import { formatDateTime, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { client, orpc } from "@/utils/orpc";
import { ScreenError, ScreenLoading } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS } from "@/surfaces/traveler/util";

export function Trv12CancelBooking({ bookingId: bookingIdProp }: { bookingId?: string } = {}) {
  const { t, locale } = useAuth();
  const routeParams = useParams({ strict: false });
  const bookingId = bookingIdProp ?? routeParams.bookingId ?? "";
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);

  const previewQuery = useQuery(orpc.booking.refundPreview.queryOptions({ input: { bookingId } }));

  const cancel = useMutation({
    mutationFn: async () =>
      client.booking.cancelBooking({
        bookingId,
        reason: reason.trim() || t("screen.traveler.cancel.defaultReason"),
      }),
    onSuccess: () => {
      void navigate({ to: pathFor("SCR-TRV-11", { bookingId }) });
    },
  });

  if (previewQuery.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (previewQuery.isError) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenError onRetry={() => void previewQuery.refetch()} />
      </div>
    );
  }
  const preview = previewQuery.data;

  if (cancel.isSuccess) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <StatusPill tone="warning" icon="clock">
          {t("screen.traveler.cancel.refundInProgressBadge")}
        </StatusPill>
        <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.cancel.done")}</h1>
        <Notice tone="info">{t("screen.traveler.cancel.refundPendingNote")}</Notice>
        <Button block onClick={() => void navigate({ to: pathFor("SCR-TRV-11", { bookingId }) })}>
          {t("screen.traveler.confirmed.viewBooking")}
        </Button>
      </div>
    );
  }

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.cancel.title")}</h1>

      <section className="flex flex-col gap-1.5 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-4 shadow-[var(--te-card-shadow)] text-[15px]">
        <p className="m-0">
          {preview.departureAt
            ? t("screen.traveler.cancel.departure", {
                at: formatDateTime(preview.departureAt, locale),
              })
            : t("screen.traveler.cancel.departureUnknown")}
        </p>
        <p className="m-0">
          {t("screen.traveler.cancel.policyRow", {
            hours: preview.minHoursBeforeDeparture,
            percent: preview.refundPercent,
          })}
        </p>
        <p className="m-0 text-base font-bold">
          {t("screen.traveler.cancel.refundAmount", {
            amount: formatMinorAmount(preview.refundAmountMinor, currencyOf(preview), locale),
          })}
        </p>
        {preview.couponReversed ? (
          <p className="m-0 text-sm text-[var(--te-ink-muted)]">
            {t("screen.traveler.cancel.couponReversed")}
          </p>
        ) : null}
        <p className="m-0 text-[13px] text-[var(--te-ink-muted)]">
          {t("screen.traveler.cancel.nonRefundableNote")}
        </p>
      </section>

      <TextAreaField
        label={t("screen.traveler.cancel.reasonLabel")}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        hint={t("screen.traveler.cancel.reasonHint")}
      />

      {cancel.isError ? (
        <Notice tone="danger">{t("screen.traveler.cancel.cancelFailed")}</Notice>
      ) : null}

      <Button
        tone="danger"
        block
        disabled={cancel.isPending}
        onClick={() => {
          setConfirming(true);
          cancel.mutate();
        }}
      >
        {cancel.isPending || confirming
          ? t("auth.common.submitting")
          : t("screen.traveler.cancel.confirm")}
      </Button>
      <Button
        tone="outline"
        block
        disabled={cancel.isPending}
        onClick={() => void navigate({ to: pathFor("SCR-TRV-11", { bookingId }) })}
      >
        {t("screen.traveler.cancel.keepBooking")}
      </Button>
    </div>
  );
}

function currencyOf(preview: { totalAmountMinor: number } & Record<string, unknown>): string {
  const value = (preview as { currencyCode?: string }).currencyCode;
  return value ?? "EGP";
}
