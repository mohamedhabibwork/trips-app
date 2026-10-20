// SCR-TRV-14 Receipts and invoices: rows for the traveler's paid bookings, receipt view
// (SCR-SHR-12) and export — export is Explorer/VIP only (Free sees the upgrade prompt).
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Notice } from "@/components/kit/controls";
import { formatDateTime, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { client, orpc } from "@/utils/orpc";
import { serverQueryOptions, serverRpc } from "@/utils/server-rpc";
import { ScreenEmpty, ScreenError, ScreenLoading } from "@/surfaces/traveler/components/states";
import { usePlanTier } from "@/surfaces/traveler/plan-tier";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";
import { PlanLimitPrompt } from "@/screens/shared/plan-limit-prompt";
import { useState } from "react";
import { toast } from "sonner";

export function Trv14Receipts() {
  const { t, locale } = useAuth();
  const navigate = useNavigate();
  const planTier = usePlanTier();
  const [exportTarget, setExportTarget] = useState<string | null>(null);

  const receiptsQuery = useQuery(
    serverQueryOptions(orpc.traveler.receipts.listMine, "traveler/receipts/listMine", {
      input: undefined,
    }),
  );

  if (receiptsQuery.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (receiptsQuery.isError) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenError onRetry={() => void receiptsQuery.refetch()} />
      </div>
    );
  }

  const receipts = receiptsQuery.data.receipts;

  function requestExport(receiptId: string) {
    // FR-TRV-03 / BR-BKG-05: export is Explorer/VIP. Free is offered the upgrade prompt (SCR-SHR-01).
    if (planTier === undefined || planTier === "free") {
      setExportTarget(receiptId);
      return;
    }
    serverRpc<Awaited<ReturnType<typeof client.traveler.receipts.export>>>(
      "traveler/receipts/export",
      { receiptId },
    )
      .then((result) => {
        toast.success(
          t("screen.traveler.receipts.exported", { number: result.receipt.invoiceNumber }),
        );
      })
      .catch(() => {
        toast.error(t("screen.traveler.common.errorTitle"));
      });
  }

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.receipts.title")}</h1>

      {receipts.length === 0 ? (
        <ScreenEmpty
          title={t("screen.traveler.receipts.emptyTitle")}
          body={t("screen.traveler.receipts.emptyBody")}
          action={
            <button
              type="button"
              className="cursor-pointer underline"
              onClick={() => void navigate({ to: pathFor("SCR-TRV-01") })}
            >
              {t("screen.traveler.bookings.browseTrips")}
            </button>
          }
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {receipts.map((receipt) => (
            <li
              key={receipt.id}
              className="flex flex-col gap-2 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-4 shadow-[var(--te-card-shadow)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="m-0 text-[15px] font-semibold">
                  {pick(locale, receipt.tripTitleAr, receipt.tripTitleEn) ||
                    receipt.bookingReference}
                </p>
                <p className="m-0 text-[13px] text-[var(--te-ink-muted)]">
                  {formatDateTime(receipt.paidAt ?? receipt.createdAt, locale)} ·{" "}
                  {receipt.invoiceNumber} ·{" "}
                  {receipt.status === "refunded"
                    ? t("screen.traveler.bookingState.refunded")
                    : t("screen.traveler.receipts.typeReceipt")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[15px] font-bold">
                  {formatMinorAmount(receipt.amountMinor, receipt.currencyCode, locale)}
                </span>
                <a
                  href={`/receipts/${encodeURIComponent(receipt.id)}`}
                  className="cursor-pointer text-sm underline"
                >
                  {t("screen.traveler.receipts.view")}
                </a>
                <button
                  type="button"
                  className="cursor-pointer text-sm underline"
                  onClick={() => requestExport(receipt.id)}
                >
                  {t("screen.traveler.receipts.export")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Notice tone="info">{t("screen.traveler.receipts.exportGateNote")}</Notice>

      {exportTarget ? (
        <PlanLimitPrompt
          limit="programsPerTrip"
          current={0}
          allowance={0}
          tierName={t("screen.traveler.plan.tier.explorer")}
          monthlyPrice={t("screen.traveler.plan.pricePlaceholder")}
          onUpgrade={() => {
            setExportTarget(null);
            void navigate({ to: pathFor("SCR-TRV-18") });
          }}
          onCancel={() => setExportTarget(null)}
        />
      ) : null}
    </div>
  );
}
