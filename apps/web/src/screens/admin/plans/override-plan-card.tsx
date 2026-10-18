// The "Override plan" card of SCR-ADM-17 (docs/design/web/admin/SCR-ADM-17.dc.html): account, plan,
// required reason and end date. The override applies at once and is written to the audit log.
import { useState } from "react";
import { t } from "@trips-app/i18n";

import { AdminButton } from "../common/admin-actions";
import { AdminInput, AdminSelect, AdminTextarea, type AdminOption } from "../common/admin-form";
import { AdminAlert, AdminCard } from "../common/admin-ui";

const MIN_REASON_LENGTH = 3;
const MAX_REASON_LENGTH = 500;

export interface OverrideAccount {
  accountId: string;
  name: string;
}

export interface OverrideInput {
  accountId: string;
  planId: string;
  reason: string;
}

/** The account whose id or exact name (any case) was typed, if exactly one matches. */
function findAccount(
  accounts: readonly OverrideAccount[],
  typed: string,
): OverrideAccount | undefined {
  const needle = typed.trim().toLowerCase();
  if (!needle) return undefined;
  const matches = accounts.filter(
    (account) => account.accountId === typed.trim() || account.name.toLowerCase() === needle,
  );
  const unique = new Map(matches.map((account) => [account.accountId, account]));
  return unique.size === 1 ? [...unique.values()][0] : undefined;
}

export function OverridePlanCard({
  accounts,
  plans,
  isSaving,
  isSaved,
  isFailed,
  onSave,
}: {
  accounts: readonly OverrideAccount[];
  plans: readonly AdminOption[];
  isSaving: boolean;
  isSaved: boolean;
  isFailed: boolean;
  onSave: (input: OverrideInput, onDone: () => void) => void;
}) {
  const [accountText, setAccountText] = useState("");
  const [planId, setPlanId] = useState("");
  const [reason, setReason] = useState("");
  const [endDate, setEndDate] = useState("");

  const account = findAccount(accounts, accountText);
  const trimmedReason = reason.trim();
  const canSave =
    Boolean(account) && planId !== "" && trimmedReason.length >= MIN_REASON_LENGTH && !isSaving;

  const save = () => {
    if (!account || !canSave) return;
    onSave({ accountId: account.accountId, planId, reason: trimmedReason }, () => setReason(""));
  };

  return (
    <AdminCard title={t("screen.admin.plans.overridePlanCard.title")}>
      <AdminInput
        label={t("screen.admin.plans.overridePlanCard.account")}
        value={accountText}
        required
        aria-invalid={accountText.trim() !== "" && !account}
        help={
          accountText.trim() !== "" && !account
            ? t("screen.admin.plans.overridePlanCard.accountNotFound")
            : undefined
        }
        onChange={(event) => setAccountText(event.target.value)}
      />
      <AdminSelect
        label={t("screen.admin.plans.overridePlanCard.plan")}
        options={[
          { value: "", label: t("screen.admin.plans.overridePlanCard.selectPlan") },
          ...plans,
        ]}
        value={planId}
        onValueChange={setPlanId}
      />
      <AdminTextarea
        label={t("screen.admin.plans.overridePlanCard.reason")}
        rows={4}
        required
        maxLength={MAX_REASON_LENGTH}
        placeholder={t("screen.admin.plans.overridePlanCard.reasonPlaceholder")}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <AdminInput
        label={t("screen.admin.plans.overridePlanCard.endDate")}
        type="date"
        value={endDate}
        onChange={(event) => setEndDate(event.target.value)}
      />
      <p className="te-caption">{t("screen.admin.plans.overridePlanCard.auditNote")}</p>
      {isFailed ? (
        <AdminAlert tone="danger" title={t("screen.admin.plans.overridePlanCard.saveFailedTitle")}>
          {t("screen.admin.plans.overridePlanCard.saveFailedBody")}
        </AdminAlert>
      ) : null}
      {isSaved ? (
        <AdminAlert tone="success">{t("screen.admin.plans.overridePlanCard.saved")}</AdminAlert>
      ) : null}
      <AdminButton variant="primary" disabled={!canSave} onClick={save}>
        {t("screen.admin.plans.overridePlanCard.saveOverride")}
      </AdminButton>
    </AdminCard>
  );
}
