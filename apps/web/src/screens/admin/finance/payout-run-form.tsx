// The "Create run" form of SCR-ADM-26 Payout runs: the admin enters the run total and its
// currency, so no amount is ever assumed.
import { useState, type FormEvent } from "react";
import { t } from "@trips-app/i18n";

import { AdminButton } from "../common/admin-actions";
import { AdminInput, AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminAlert, AdminCard } from "../common/admin-ui";
import {
  isPayoutCurrency,
  SUPPORTED_PAYOUT_CURRENCIES,
  type PayoutCurrency,
} from "./finance-format";

const MINOR_UNITS_PER_MAJOR = 100;
const MIN_AMOUNT_MINOR = 100;
const MAX_AMOUNT_MINOR = 500_000_000;

export interface NewPayoutRun {
  amountMinor: number;
  currency: PayoutCurrency;
}

const currencyOptions = (): readonly AdminOption[] =>
  SUPPORTED_PAYOUT_CURRENCIES.map((code) => ({ value: code, label: code }));

/** Amount in minor units, or null when the entry is not a valid run total. */
function parseAmountMinor(value: string): number | null {
  const amount = Number(value);
  if (value.trim() === "" || !Number.isFinite(amount)) return null;
  const minor = Math.round(amount * MINOR_UNITS_PER_MAJOR);
  return minor >= MIN_AMOUNT_MINOR && minor <= MAX_AMOUNT_MINOR ? minor : null;
}

export function CreatePayoutRunForm({
  isPending,
  hasError,
  onSubmit,
  onCancel,
}: {
  isPending: boolean;
  hasError: boolean;
  onSubmit: (run: NewPayoutRun) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<PayoutCurrency>("EGP");
  const amountMinor = parseAmountMinor(amount);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (amountMinor !== null) onSubmit({ amountMinor, currency });
  };

  return (
    <AdminCard title={t("screen.admin.finance.payoutRunForm.title")}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminInput
            label={t("screen.admin.finance.payoutRunForm.amount")}
            help={t("screen.admin.finance.payoutRunForm.amountHelp")}
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
          <AdminSelect
            label={t("screen.admin.finance.payoutRunForm.currency")}
            options={currencyOptions()}
            value={currency}
            onValueChange={(value) => isPayoutCurrency(value) && setCurrency(value)}
          />
        </div>
        {hasError ? (
          <AdminAlert tone="danger" title={t("screen.admin.finance.payoutRunForm.errorTitle")}>
            {t("screen.admin.finance.payoutRunForm.errorBody")}
          </AdminAlert>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <AdminButton type="submit" variant="primary" disabled={amountMinor === null || isPending}>
            {t("screen.admin.finance.payoutRunForm.submit")}
          </AdminButton>
          <AdminButton onClick={onCancel}>
            {t("screen.admin.finance.payoutRunForm.cancel")}
          </AdminButton>
        </div>
      </form>
    </AdminCard>
  );
}
