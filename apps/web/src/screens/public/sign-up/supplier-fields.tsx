// Fields and value helpers shared by the supplier application forms (SCR-PUB-04, 05, 06).
import { useAuth } from "@/auth/auth-context";
import { TextField } from "@/components/kit/controls";

/** The server's minimum for a supplier password. */
export const SUPPLIER_PASSWORD_MIN_LENGTH = 12;

/** The password a supplier signs in with after approval (the server requires one). */
export function SupplierPasswordField({ disabled = false }: { disabled?: boolean }) {
  const { t } = useAuth();
  return (
    <TextField
      name="password"
      type="password"
      dir="ltr"
      label={t("screen.public.signUp.supplier.password")}
      hint={t("screen.public.signUp.supplier.passwordHint", {
        count: SUPPLIER_PASSWORD_MIN_LENGTH,
      })}
      autoComplete="new-password"
      minLength={SUPPLIER_PASSWORD_MIN_LENGTH}
      required
      disabled={disabled}
    />
  );
}

/** A `<input type="date">` value (yyyy-mm-dd) as an ISO timestamp at midnight UTC; null if invalid. */
export function dateInputToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Whether a date input value lies after `now` (a licence or insurance that has not expired). */
export function isFutureDate(value: string, now: Date = new Date()): boolean {
  const iso = dateInputToIso(value);
  return iso !== null && new Date(iso).getTime() > now.getTime();
}

/** Splits a comma- or newline-separated answer into trimmed, non-empty entries. */
export function splitList(value: string): string[] {
  return value
    .split(/[,،\n]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}
