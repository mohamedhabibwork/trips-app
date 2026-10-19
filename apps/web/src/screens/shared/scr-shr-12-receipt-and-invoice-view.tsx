// SCR-SHR-12 Receipt and invoice view (`/receipts/$receiptId`, the id is the payment id): the
// receipt from payments.getReceipt — number, date, billed-to name, the booking lines, subtotal and
// total. No tax is stored by the platform, so no tax row is shown. The print dialog saves a PDF.
import { useQuery } from "@tanstack/react-query";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import type { ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, TextButton } from "@/components/kit/controls";
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

type ReceiptLine = {
  kind: "trip" | "programs" | "discount" | "subscription";
  titleAr: string | null;
  titleEn: string | null;
  couponCode: string | null;
  quantity: number;
};

/** The label of one receipt line in the reader's language. */
function lineLabel(
  line: ReceiptLine,
  locale: string,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (line.kind === "trip") {
    const title = (locale === "ar" ? line.titleAr : line.titleEn) ?? line.titleEn ?? "";
    return t("screen.shared.receipt.lineTrip", { title, count: line.quantity });
  }
  if (line.kind === "programs") {
    return t("screen.shared.receipt.linePrograms", { count: line.quantity });
  }
  if (line.kind === "discount") {
    return line.couponCode
      ? t("screen.shared.receipt.lineCoupon", { code: line.couponCode })
      : t("screen.shared.receipt.lineDiscount");
  }
  return t("screen.shared.receipt.lineSubscription");
}

export function ScrShr12ReceiptAndInvoiceView() {
  const { t, locale, status } = useAuth();
  const router = useRouter();
  const receiptId = useRouterState({
    select: (state) => matchWebRoute("public", state.location.pathname)?.params.receiptId,
  });
  const signedIn = status === "authenticated";
  const receiptQuery = useQuery({
    ...orpc.payments.getReceipt.queryOptions({ input: { paymentId: receiptId ?? "" } }),
    enabled: signedIn && Boolean(receiptId),
    retry: false,
  });
  const receipt = receiptQuery.data;

  if (!signedIn) {
    return (
      <PhoneColumn>
        <SignInRequired message={t("screen.shared.receipt.signIn")} />
      </PhoneColumn>
    );
  }
  if (receiptQuery.isPending && receiptId) {
    return (
      <PhoneColumn>
        <p role="status" className="m-0 text-sm text-[var(--te-ink-muted)]">
          {t("screen.shared.receipt.loading")}
        </p>
      </PhoneColumn>
    );
  }
  if (!receipt) {
    const missing =
      !receiptId ||
      (receiptQuery.error as { code?: string } | null)?.code === "NOT_FOUND" ||
      (receiptQuery.error as { status?: number } | null)?.status === 404;
    return (
      <PhoneColumn>
        <Notice tone={missing ? "info" : "danger"}>
          {missing ? t("screen.shared.receipt.notFound") : t("screen.shared.receipt.failed")}
        </Notice>
      </PhoneColumn>
    );
  }

  const money = (minor: number) => formatMinorAmount(minor, receipt.currencyCode, locale);

  return (
    <PhoneColumn className="gap-3.5">
      <TextButton className="self-start print:hidden" onClick={() => router.history.back()}>
        {t("screen.shared.receipt.back")}
      </TextButton>
      <h1 className="m-0 text-2xl font-bold">{t("screen.shared.receipt.title")}</h1>
      <Card className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <span dir="ltr" className="text-[13px] font-semibold text-[var(--te-ink-muted)]">
            {receipt.invoiceNumber}
          </span>
          <span className="inline-flex items-center gap-1 rounded-[var(--te-radius-pill)] bg-[var(--te-success-soft)] px-2.5 py-1 text-[13px] font-semibold text-[var(--te-success)]">
            <TeIcon name="check" className="size-4" />
            {t("screen.shared.receipt.issued")}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-sm">
          <span className="text-[var(--te-ink-muted)]">{t("screen.shared.receipt.date")}</span>
          <span className="font-semibold">{formatDate(receipt.issuedAt, locale)}</span>
        </div>
        <div className="flex flex-col gap-0.5 text-sm">
          <span className="text-[var(--te-ink-muted)]">{t("screen.shared.receipt.billedTo")}</span>
          <span className="font-semibold">{receipt.billedToName}</span>
        </div>
      </Card>
      <Card className="gap-2.5 text-sm">
        <div className="flex justify-between gap-2 text-[13px] font-semibold text-[var(--te-ink-muted)]">
          <span>{t("screen.shared.receipt.item")}</span>
          <span>{t("screen.shared.receipt.amount")}</span>
        </div>
        {receipt.lines
          .filter((line) => line.amountMinor > 0)
          .map((line) => (
            <Row
              key={line.kind}
              label={lineLabel(line, locale, t)}
              value={money(line.amountMinor)}
            />
          ))}
        <div className="my-1 h-px bg-[var(--te-hairline)]" />
        <Row label={t("screen.shared.receipt.subtotal")} value={money(receipt.subtotalMinor)} />
        {receipt.lines
          .filter((line) => line.amountMinor < 0)
          .map((line) => (
            <Row
              key={line.kind}
              label={lineLabel(line, locale, t)}
              value={money(line.amountMinor)}
            />
          ))}
        <Row label={t("screen.shared.receipt.total")} value={money(receipt.totalMinor)} strong />
        {receipt.refundedMinor > 0 ? (
          <Row label={t("screen.shared.receipt.refunded")} value={money(-receipt.refundedMinor)} />
        ) : null}
      </Card>
      <Button className="mt-auto print:hidden" onClick={() => window.print()}>
        {t("screen.shared.receipt.download")}
      </Button>
    </PhoneColumn>
  );
}
