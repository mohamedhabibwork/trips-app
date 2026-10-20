// SCR-PHO-11 Earnings and payouts: the money view of finalized deals
// (docs/design/web/PhoWebEarnings.dc.html). The agreed fees are real
// (`negotiation.listSupplierOffers`, accepted deals); a payout ledger and a payout schedule have
// no service yet, so those two cards render their structure as honest empty states.
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { formatDateTime, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import {
  NO_VALUE,
  StudioButton,
  StudioCard,
  StudioEmpty,
  StudioError,
  StudioLink,
  StudioLoading,
  StudioNotice,
  StudioPage,
  StudioPageHeader,
  StudioRow,
  StudioSegmented,
} from "../studio-ui";
import { useStudioPlan } from "../studio-plan";
import { dealStatusLabel } from "../studio-vocab";

type Period = "all" | "countered" | "accepted";

export function StudioEarnings() {
  const { t, locale } = useAuth();
  const enabled = typeof window !== "undefined";
  const plan = useStudioPlan();
  const [period, setPeriod] = useState<Period>("accepted");

  const offersQuery = useQuery({
    ...serverQueryOptions(orpc.negotiation.listSupplierOffers, "negotiation/listSupplierOffers", {
      input: {},
      enabled,
      retry: false,
    }),
  });

  if (offersQuery.isPending || plan.loading) {
    return (
      <StudioPage>
        <StudioLoading rows={4} />
      </StudioPage>
    );
  }
  if (offersQuery.isError) {
    return (
      <StudioPage>
        <StudioError onRetry={() => void offersQuery.refetch()} />
      </StudioPage>
    );
  }

  const offers = offersQuery.data.items;
  const accepted = offers.filter((offer) => offer.status === "accepted");
  const agreedTotal = accepted.reduce((sum, offer) => sum + (offer.agreedPriceMinor ?? 0), 0);
  const currency = accepted[0]?.currencyCode ?? "EGP";

  const visible =
    period === "accepted"
      ? accepted
      : period === "countered"
        ? offers.filter((offer) => offer.status.startsWith("countered"))
        : offers;

  return (
    <StudioPage>
      <StudioPageHeader
        title={t("screen.studio.earnings.title")}
        caption={t("screen.studio.earnings.caption")}
        actions={
          <>
            <StudioSegmented
              label={t("screen.studio.earnings.periodLabel")}
              value={period}
              onChange={setPeriod}
              options={[
                { value: "accepted", label: t("screen.studio.earnings.periodAccepted") },
                { value: "countered", label: t("screen.studio.earnings.periodCountered") },
                { value: "all", label: t("screen.studio.earnings.periodAll") },
              ]}
            />
            <span className="flex flex-col items-end gap-0.5">
              <StudioButton variant="secondary" disabled={true}>
                {t("screen.studio.earnings.export")}
              </StudioButton>
              <span className="text-[13px] font-semibold text-[var(--te-ink-muted)]">
                {plan.exportAllowed
                  ? t("screen.studio.earnings.exportReady")
                  : t("screen.studio.earnings.exportNeedsPro")}
              </span>
            </span>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StudioCard>
          <span className="text-sm text-[var(--te-ink-muted)]">
            {t("screen.studio.earnings.kpi.agreed")}
          </span>
          <b className="text-[28px] leading-[34px] font-bold">
            {formatMinorAmount(agreedTotal, currency, locale)}
          </b>
          <span className="text-[13px] text-[var(--te-ink-muted)]">
            {t("screen.studio.earnings.kpi.agreedHint", { count: accepted.length })}
          </span>
        </StudioCard>
        <StudioCard>
          <span className="text-sm text-[var(--te-ink-muted)]">
            {t("screen.studio.earnings.kpi.deals")}
          </span>
          <b className="text-[28px] leading-[34px] font-bold">{accepted.length}</b>
          <span className="text-[13px] text-[var(--te-ink-muted)]">
            {t("screen.studio.earnings.kpi.dealsHint")}
          </span>
        </StudioCard>
        <StudioCard className="!bg-[var(--te-ink)] text-[var(--te-ink-inverse)]">
          <span className="text-sm text-[#b8bad6]">
            {t("screen.studio.earnings.kpi.nextPayout")}
          </span>
          <b className="text-[28px] leading-[34px] font-bold">{NO_VALUE}</b>
          <span className="text-[13px] text-[#b8bad6]">
            {t("screen.studio.earnings.kpi.nextPayoutHint")}
          </span>
        </StudioCard>
        <StudioCard>
          <span className="text-sm text-[var(--te-ink-muted)]">
            {t("screen.studio.earnings.kpi.plan")}
          </span>
          <b className="text-[28px] leading-[34px] font-bold">
            {plan.tier ? t(`component.shell.studio.plan.${plan.tier}`) : NO_VALUE}
          </b>
          <span className="text-[13px] text-[var(--te-ink-muted)]">
            {t("screen.studio.earnings.kpi.planHint")}
          </span>
        </StudioCard>
      </div>

      <StudioRow align="start">
        <StudioCard
          title={t("screen.studio.earnings.payouts")}
          className="basis-[420px] lg:flex-[2]"
        >
          <StudioEmpty title={t("screen.studio.earnings.payoutsEmptyTitle")}>
            {t("screen.studio.earnings.payoutsEmptyBody")}
          </StudioEmpty>
        </StudioCard>

        <StudioCard
          title={t("screen.studio.earnings.ledger")}
          className="basis-[560px] lg:flex-[3]"
          actions={
            <span className="text-[13px] text-[var(--te-ink-muted)]">
              {t("screen.studio.earnings.ledgerCaption")}
            </span>
          }
        >
          {visible.length === 0 ? (
            <StudioEmpty title={t("screen.studio.earnings.ledgerEmptyTitle")}>
              {t("screen.studio.earnings.ledgerEmptyBody")}
            </StudioEmpty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="text-[13px] text-[var(--te-ink-muted)]">
                    <th scope="col" className="ps-0 pb-2 text-start font-semibold">
                      {t("screen.studio.earnings.colDeal")}
                    </th>
                    <th scope="col" className="px-3 pb-2 text-start font-semibold">
                      {t("screen.studio.common.status")}
                    </th>
                    <th scope="col" className="px-3 pb-2 text-end font-semibold">
                      {t("screen.studio.earnings.colAgreed")}
                    </th>
                    <th scope="col" className="pe-0 pb-2 text-end font-semibold">
                      {t("screen.studio.earnings.colUpdated")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((offer) => (
                    <tr key={offer.id} className="border-t border-[var(--te-hairline)]">
                      <td className="py-2.5 pe-3 font-semibold">
                        <StudioLink to={pathFor("SCR-PHO-06", { tripId: offer.tripId })}>
                          {t("screen.studio.common.tripIdLabel", { id: offer.tripId.slice(0, 8) })}
                        </StudioLink>
                      </td>
                      <td className="px-3 py-2.5">{dealStatusLabel(offer.status)}</td>
                      <td className="px-3 py-2.5 text-end font-semibold">
                        {offer.agreedPriceMinor !== null
                          ? formatMinorAmount(offer.agreedPriceMinor, offer.currencyCode, locale)
                          : formatMinorAmount(offer.currentOfferMinor, offer.currencyCode, locale)}
                      </td>
                      <td className="py-2.5 pe-0 text-end text-[13px] text-[var(--te-ink-muted)]">
                        {formatDateTime(offer.updatedAt, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <StudioNotice tone="info">
            <p className="m-0 text-sm leading-5">{t("screen.studio.earnings.ledgerNote")}</p>
          </StudioNotice>
        </StudioCard>
      </StudioRow>
    </StudioPage>
  );
}
