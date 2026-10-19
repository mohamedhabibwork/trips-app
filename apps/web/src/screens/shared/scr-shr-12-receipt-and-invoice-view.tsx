// SCR-SHR-12 Receipt and invoice view (`/receipts/$receiptId`): one ledger entry as a receipt —
// number, status, date, the line, commission and total. The browser's print dialog saves a PDF.
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import type { ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice } from "@/components/kit/controls";
import { formatDate, formatMinorAmount } from "@/components/kit/format";
import { PhoneColumn } from "@/components/kit/layout";
import { matchWebRoute } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

import { SignInRequired } from "./sign-in-required";

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`flex flex-col rounded-[var(--te-radius-lg)] bg-[var(--te-surface-raised)] p-[18px] shadow-[var(--te-card-shadow)] ${className}`}
    >
      {children}
    </section>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-2 ${strong ? "mt-1 text-[17px] font-bold" : ""}`}>
      <span>{label}</span>
      <span dir="ltr" className={strong ? "" : "font-semibold"}>
        {value}
      </span>
    </div>
  );
}

export function ScrShr12ReceiptAndInvoiceView() {
  const { t, locale, status } = useAuth();
  const receiptId = useRouterState({
    select: (state) => matchWebRoute("public", state.location.pathname)?.params.receiptId,
  });
  const signedIn = status === "authenticated";
  const ledgerQuery = useQuery({
    ...orpc.accounting.listLedgerEntries.queryOptions({ input: {} }),
    enabled: signedIn,
  });
  const entries = ledgerQuery.data ?? [];
  const entry = receiptId ? entries.find((item) => item.id === receiptId) : entries[0];

  if (!signedIn) {
    return (
      <PhoneColumn>
        <SignInRequired message={t("screen.shared.receipt.signIn")} />
      </PhoneColumn>
    );
  }
  if (ledgerQuery.isPending) {
    return (
      <PhoneColumn>
        <p role="status" className="m-0 text-sm text-[var(--te-ink-muted)]">
          {t("screen.shared.receipt.loading")}
        </p>
      </PhoneColumn>
    );
  }
  if (!entry) {
    return (
      <PhoneColumn>
        <Notice tone={ledgerQuery.isError ? "danger" : "info"}>
          {ledgerQuery.isError
            ? t("screen.shared.receipt.failed")
            : t("screen.shared.receipt.notFound")}
        </Notice>
      </PhoneColumn>
    );
  }

  const money = (minor: number) => formatMinorAmount(minor, entry.currencyCode, locale);

  return (
    <PhoneColumn className="gap-3.5">
      <h1 className="sr-only">{t("screen.shared.receipt.title")}</h1>
      <Card className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <span dir="ltr" className="text-[13px] font-semibold text-[var(--te-ink-muted)]">
            {entry.invoiceNumber ?? entry.id}
          </span>
          <span className="inline-flex items-center gap-1 rounded-[var(--te-radius-pill)] bg-[var(--te-success-soft)] px-2.5 py-1 text-[13px] font-semibold text-[var(--te-success)]">
            <TeIcon name="check" className="size-4" />
            {t("screen.shared.receipt.issued")}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-sm">
          <span className="text-[var(--te-ink-muted)]">{t("screen.shared.receipt.date")}</span>
          <span className="font-semibold">{formatDate(entry.occurredAt, locale)}</span>
        </div>
      </Card>
      <Card className="gap-2.5 text-sm">
        <div className="flex justify-between gap-2 text-[13px] font-semibold text-[var(--te-ink-muted)]">
          <span>{t("screen.shared.receipt.item")}</span>
          <span>{t("screen.shared.receipt.amount")}</span>
        </div>
        <Row label={entry.description || entry.entryType} value={money(entry.grossAmountMinor)} />
        <div className="my-1 h-px bg-[var(--te-hairline)]" />
        <Row label={t("screen.shared.receipt.subtotal")} value={money(entry.grossAmountMinor)} />
        <Row
          label={t("screen.shared.receipt.commission")}
          value={money(-Math.abs(entry.commissionAmountMinor))}
        />
        <Row label={t("screen.shared.receipt.total")} value={money(entry.netAmountMinor)} strong />
      </Card>
      <Button className="mt-auto print:hidden" onClick={() => window.print()}>
        {t("screen.shared.receipt.download")}
      </Button>
    </PhoneColumn>
  );
}
