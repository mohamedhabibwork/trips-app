// SCR-PHO-05 Deal requests: the list of negotiations and the selected deal's response panel
// (docs/design/web/PhoWebDeals.dc.html). Offers come from `negotiation.listSupplierOffers`; the
// reply goes through `negotiation.respondToOffer` (accept / counter / decline). The list endpoint
// serves platform photographers, so an org photographer sees the explained error state.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";
import { formatDateTime, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import {
  NO_VALUE,
  StudioBadge,
  StudioButton,
  StudioCard,
  StudioError,
  StudioLink,
  StudioLinkButton,
  StudioLoading,
  StudioNotice,
  StudioPage,
  StudioPageHeader,
  StudioRow,
} from "../studio-ui";
import {
  OPEN_DEAL_STATUSES,
  PHOTOGRAPHER_TURN_STATUSES,
  amountTextToMinor,
  dealStatusMeta,
  dealStatusLabel,
  minorToAmountText,
} from "../studio-vocab";

export function DealRequests() {
  const { t, locale } = useAuth();
  const enabled = typeof window !== "undefined";
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterText, setCounterText] = useState("");
  const [actionError, setActionError] = useState(false);

  const offersQuery = useQuery({
    ...serverQueryOptions(orpc.negotiation.listSupplierOffers, "negotiation/listSupplierOffers", {
      input: {},
      enabled,
      retry: false,
    }),
  });

  const respondMutation = useMutation(
    serverMutationOptions(orpc.negotiation.respondToOffer, "negotiation/respondToOffer", {
      onSuccess: () => {
        setActionError(false);
        setCounterOpen(false);
        void queryClient.invalidateQueries({ queryKey: orpc.negotiation.key() });
      },
      onError: () => setActionError(true),
    }),
  );

  if (offersQuery.isPending) {
    return (
      <StudioPage>
        <StudioLoading rows={4} />
      </StudioPage>
    );
  }
  if (offersQuery.isError) {
    return (
      <StudioPage>
        <StudioError onRetry={() => void offersQuery.refetch()}>
          {t("screen.studio.deals.loadFailedBody")}
        </StudioError>
      </StudioPage>
    );
  }

  const offers = offersQuery.data.items;
  const openCount = offers.filter((offer) => OPEN_DEAL_STATUSES.includes(offer.status)).length;
  const selected = offers.find((offer) => offer.id === selectedId) ?? offers[0] ?? null;
  const yourTurn = selected ? PHOTOGRAPHER_TURN_STATUSES.includes(selected.status) : false;
  const isOpen = selected ? OPEN_DEAL_STATUSES.includes(selected.status) : false;
  const counterValue =
    counterText || (selected ? minorToAmountText(selected.currentOfferMinor) : "");

  function respond(action: "accept" | "counter" | "decline") {
    if (!selected) return;
    if (action === "counter") {
      const minor = amountTextToMinor(counterValue);
      if (minor === null) {
        setActionError(true);
        return;
      }
      respondMutation.mutate({
        negotiationId: selected.id,
        action: "counter",
        counterOfferMinor: minor,
      });
      return;
    }
    respondMutation.mutate({ negotiationId: selected.id, action });
  }

  return (
    <StudioPage>
      <StudioPageHeader
        title={t("screen.studio.deals.title")}
        caption={t("screen.studio.deals.caption")}
        badge={
          <StudioBadge tone={openCount > 0 ? "live" : "neu"} icon={false}>
            {t("screen.studio.deals.usage", { count: openCount })}
          </StudioBadge>
        }
      />

      <StudioRow align="start">
        <StudioCard
          title={t("screen.studio.deals.listTitle", { count: offers.length })}
          className="basis-[380px] lg:flex-[2]"
        >
          {offers.length === 0 ? (
            <StudioNotice tone="info" title={t("screen.studio.deals.emptyTitle")}>
              <p className="m-0 text-sm leading-5">{t("screen.studio.deals.emptyBody")}</p>
            </StudioNotice>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {offers.map((offer) => {
                const active = selected?.id === offer.id;
                return (
                  <li key={offer.id}>
                    <button
                      type="button"
                      aria-current={active ? "true" : undefined}
                      onClick={() => {
                        setSelectedId(offer.id);
                        setCounterOpen(false);
                        setCounterText("");
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 border-t border-[var(--te-hairline)] px-3 py-3 text-start first:border-t-0 first:pt-0 ${
                        active ? "bg-[var(--te-surface)]" : "hover:bg-[var(--te-surface)]"
                      }`}
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-[15px] font-semibold text-[var(--te-ink)]">
                          {t("screen.studio.common.tripIdLabel", { id: offer.tripId.slice(0, 8) })}
                        </span>
                        <span className="text-[13px] text-[var(--te-ink-muted)]">
                          {t("screen.studio.common.rounds", { count: offer.roundsCount })} ·{" "}
                          {formatDateTime(offer.updatedAt, locale)}
                        </span>
                      </span>
                      <span className="flex flex-col items-end gap-1">
                        <span className="text-[15px] font-bold">
                          {formatMinorAmount(offer.currentOfferMinor, offer.currencyCode, locale)}
                        </span>
                        <StudioBadge tone={dealStatusMeta(offer.status).tone} icon={false}>
                          {dealStatusLabel(offer.status)}
                        </StudioBadge>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </StudioCard>

        {selected ? (
          <StudioCard className="basis-[560px] lg:flex-[3]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <StudioBadge tone={dealStatusMeta(selected.status).tone} icon={false}>
                  {dealStatusLabel(selected.status)}
                </StudioBadge>
                <h2 className="m-0 text-2xl leading-8 font-bold">
                  {t("screen.studio.common.tripIdLabel", { id: selected.tripId.slice(0, 8) })}
                </h2>
                <span className="text-[15px] text-[var(--te-ink-muted)]">
                  {t("screen.studio.deals.lastMove", {
                    who:
                      selected.lastOfferedBy === "organization"
                        ? t("screen.studio.deals.partyOrg")
                        : t("screen.studio.deals.partyYou"),
                    when: formatDateTime(selected.respondedAt ?? selected.updatedAt, locale),
                  })}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[13px] text-[var(--te-ink-muted)]">
                  {t("screen.studio.deals.latestOffer")}
                </span>
                <span className="text-[32px] leading-[38px] font-bold">
                  {formatMinorAmount(selected.currentOfferMinor, selected.currencyCode, locale)}
                </span>
              </div>
            </div>

            <dl className="m-0 grid gap-3 sm:grid-cols-3">
              <Fact label={t("screen.studio.deals.fact.initial")}>
                {formatMinorAmount(selected.initialOfferMinor, selected.currencyCode, locale)}
              </Fact>
              <Fact label={t("screen.studio.deals.fact.rounds")}>
                {t("screen.studio.common.rounds", { count: selected.roundsCount })}
              </Fact>
              <Fact label={t("screen.studio.deals.fact.expires")}>
                {formatDateTime(selected.expiresAt, locale)}
              </Fact>
            </dl>

            <div className="flex flex-col gap-2">
              <h3 className="m-0 text-base font-semibold">{t("screen.studio.deals.history")}</h3>
              <ol className="m-0 flex list-none flex-col p-0">
                <HistoryRow
                  what={t("screen.studio.deals.historyInitial")}
                  who={t("screen.studio.deals.partyOrg")}
                  when={formatDateTime(selected.createdAt, locale)}
                  amount={formatMinorAmount(
                    selected.initialOfferMinor,
                    selected.currencyCode,
                    locale,
                  )}
                />
                {selected.roundsCount > 1 ? (
                  <HistoryRow
                    what={t("screen.studio.deals.historyCurrent")}
                    who={
                      selected.lastOfferedBy === "organization"
                        ? t("screen.studio.deals.partyOrg")
                        : t("screen.studio.deals.partyYou")
                    }
                    when={formatDateTime(selected.respondedAt ?? selected.updatedAt, locale)}
                    amount={formatMinorAmount(
                      selected.currentOfferMinor,
                      selected.currencyCode,
                      locale,
                    )}
                  />
                ) : null}
                {selected.agreedPriceMinor !== null ? (
                  <HistoryRow
                    what={t("screen.studio.deals.historyAgreed")}
                    who={t("screen.studio.deals.partyBoth")}
                    when={formatDateTime(selected.respondedAt ?? selected.updatedAt, locale)}
                    amount={formatMinorAmount(
                      selected.agreedPriceMinor,
                      selected.currencyCode,
                      locale,
                    )}
                  />
                ) : null}
              </ol>
            </div>

            {actionError ? (
              <StudioNotice tone="err" title={t("screen.studio.deals.actionFailed")}>
                <p className="m-0 text-sm leading-5">{t("screen.studio.deals.actionFailedBody")}</p>
              </StudioNotice>
            ) : null}

            {isOpen ? (
              <div className="flex flex-col gap-3 border-t border-[var(--te-hairline)] pt-4">
                {counterOpen ? (
                  <div className="flex flex-wrap items-end gap-3 bg-[var(--te-surface)] p-4">
                    <label className="flex min-w-0 flex-1 basis-[220px] flex-col gap-1 text-sm leading-5">
                      <span className="font-semibold">{t("screen.studio.deals.counterLabel")}</span>
                      <span className="flex h-12 items-center overflow-hidden rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface-raised)]">
                        <input
                          inputMode="decimal"
                          value={counterValue}
                          onChange={(event) => setCounterText(event.target.value)}
                          className="h-full min-w-0 flex-1 border-0 bg-transparent px-3.5 text-base"
                        />
                        <span className="px-3.5 text-sm font-semibold">EGP</span>
                      </span>
                      <span className="text-[13px] text-[var(--te-ink-muted)]">
                        {t("screen.studio.deals.counterCaption")}
                      </span>
                    </label>
                    <StudioButton
                      variant="navy"
                      onClick={() => respond("counter")}
                      disabled={respondMutation.isPending}
                    >
                      {t("screen.studio.deals.sendCounter")}
                    </StudioButton>
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <StudioButton
                    onClick={() => respond("accept")}
                    disabled={!yourTurn || respondMutation.isPending}
                  >
                    {t("screen.studio.deals.accept")}
                  </StudioButton>
                  <StudioButton
                    variant="secondary"
                    aria-expanded={counterOpen}
                    onClick={() => setCounterOpen((value) => !value)}
                    disabled={!yourTurn || respondMutation.isPending}
                  >
                    {t("screen.studio.deals.counter")}
                  </StudioButton>
                  <StudioButton
                    variant="text"
                    onClick={() => respond("decline")}
                    disabled={respondMutation.isPending}
                  >
                    {t("screen.studio.deals.decline")}
                  </StudioButton>
                  <span className="flex-1" />
                  <span className="text-[13px] text-[var(--te-ink-muted)]">
                    {t("screen.studio.deals.expires", {
                      when: formatDateTime(selected.expiresAt, locale),
                    })}
                  </span>
                </div>
                {!yourTurn ? (
                  <p className="m-0 text-[13px] text-[var(--te-ink-muted)]">
                    {t("screen.studio.deals.notYourTurn")}
                  </p>
                ) : null}
              </div>
            ) : null}

            {selected.status === "accepted" ? (
              <StudioLinkButton to={pathFor("SCR-PHO-06", { tripId: selected.tripId })}>
                {t("screen.studio.deals.openBrief")}
              </StudioLinkButton>
            ) : null}
            <StudioLink to={pathFor("SCR-PHO-04")} className="w-fit">
              {t("screen.studio.deals.openAvailability")}
            </StudioLink>
          </StudioCard>
        ) : null}
      </StudioRow>
    </StudioPage>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-[var(--te-radius-md)] bg-[var(--te-surface)] px-3.5 py-3">
      <dt className="text-[13px] text-[var(--te-ink-muted)]">{label}</dt>
      <dd className="m-0 mt-0.5 text-[15px] font-semibold">{children}</dd>
    </div>
  );
}

function HistoryRow({
  what,
  who,
  when,
  amount,
}: {
  what: string;
  who: string;
  when: string;
  amount: string;
}) {
  return (
    <li className="flex items-center gap-3 border-t border-[var(--te-hairline)] py-2.5 first:border-t-0">
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-full bg-[var(--te-control-border)]"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[15px] font-semibold">{what}</span>
        <span className="text-[13px] text-[var(--te-ink-muted)]">
          {who} · {when}
        </span>
      </span>
      <span className="text-[15px] font-bold">{amount === NO_VALUE ? "" : amount}</span>
    </li>
  );
}
