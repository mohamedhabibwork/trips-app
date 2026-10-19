// Pieces of the billing pages: a usage row with its bar (SCR-ORG-33) and a totals row (SCR-ORG-38).
import type { ReactNode } from "react";

import { t } from "@trips-app/i18n";
import { cn } from "@trips-app/ui/lib/utils";

import { NO_VALUE } from "../common/org-ui";

const FULL_PERCENT = 100;

interface UsageRowProps {
  label: string;
  /** Current use; null while unknown. */
  used: number | null;
  /** Plan limit; null means unlimited, undefined while unknown. */
  limit: number | null | undefined;
}

/** "Active trips this month · 3 of 25" with a bar. The bar is decorative; the text carries it. */
export function UsageRow({ label, used, limit }: UsageRowProps) {
  const limitText =
    limit === undefined
      ? NO_VALUE
      : limit === null
        ? t("screen.organization.billing.billingParts.unlimited")
        : String(limit);
  const usedText = used === null ? NO_VALUE : String(used);
  const percent =
    used !== null && typeof limit === "number" && limit > 0
      ? Math.min(FULL_PERCENT, Math.round((used / limit) * FULL_PERCENT))
      : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-3 text-sm leading-5">
        <span className="font-semibold">{label}</span>
        <span>
          {t("screen.organization.billing.billingParts.nOfLimit", {
            n: usedText,
            limit: limitText,
          })}
        </span>
      </div>
      <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-[var(--te-hairline)]">
        <i
          className="block h-full rounded-full bg-[var(--te-ink)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface TotalRowProps {
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
}

/** One line of an invoice's totals: label on the start side, amount on the end side. */
export function TotalRow({ label, value, strong = false }: TotalRowProps) {
  return (
    <div
      className={cn(
        "flex justify-between gap-3 text-sm leading-5",
        strong && "text-base leading-6 font-semibold",
      )}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
