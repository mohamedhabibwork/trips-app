import { cn } from "@trips-app/ui/lib/utils";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { useId, useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";

export const TE_OTP_DEFAULT_LENGTH = 6;

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Converts Arabic-Indic digits to ASCII and drops everything that is not a digit. */
export function normalizeOtpDigits(text: string): string {
  const ascii = Array.from(text, (char) => {
    const index = ARABIC_INDIC_DIGITS.indexOf(char);
    return index >= 0 ? String(index) : char;
  }).join("");
  return ascii.replace(/\D/g, "");
}

/** Writes incoming digits from a position, replacing what is there, and caps the code length. */
export function writeOtpDigits(
  value: string,
  index: number,
  incoming: string,
  length: number,
): string {
  const position = Math.min(index, value.length);
  const tail = value.slice(position + incoming.length);
  return (value.slice(0, position) + incoming + tail).slice(0, length);
}

export interface TeOtpInputProps {
  length?: number;
  value: string;
  onValueChange: (value: string) => void;
  /** Visible label. The group is named by it. */
  label: string;
  /** Accessible name for each cell. {position} and {length} are replaced. */
  cellLabel?: string;
  /** What went wrong and what to do next. Announced with role="alert". */
  error?: string;
  className?: string;
}

/**
 * One-time code split into cells. Paste and autofill fill from the focused cell.
 * The cells are always laid out left to right, so the arrow keys do not mirror in RTL.
 */
export function TeOtpInput({
  length = TE_OTP_DEFAULT_LENGTH,
  value,
  onValueChange,
  label,
  cellLabel = "Digit {position} of {length}",
  error,
  className,
}: TeOtpInputProps) {
  const labelId = useId();
  const errorId = `${labelId}-error`;
  const cellRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cells = Array.from({ length }, (_, index) => value[index] ?? "");

  function focusCell(index: number) {
    const target = cellRefs.current[Math.min(Math.max(index, 0), length - 1)];
    target?.focus();
    target?.select();
  }

  function writeAt(index: number, incoming: string) {
    const next = writeOtpDigits(value, index, incoming, length);
    onValueChange(next);
    focusCell(Math.min(Math.min(index, value.length) + incoming.length, length - 1));
  }

  function removeAt(index: number) {
    if (index >= value.length) return;
    onValueChange(value.slice(0, index) + value.slice(index + 1));
  }

  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const raw = normalizeOtpDigits(event.currentTarget.value);
    const previous = cells[index] ?? "";
    if (raw.length === 0) {
      removeAt(index);
      return;
    }
    const incoming = previous ? raw.replace(previous, "") : raw;
    if (incoming.length > 0) writeAt(index, incoming);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    const digit = normalizeOtpDigits(event.key);
    if (/^\d$/.test(digit)) {
      event.preventDefault();
      writeAt(index, digit);
      return;
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      const target = index < value.length ? index : value.length - 1;
      if (target < 0) return;
      removeAt(target);
      focusCell(target);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      focusCell(index + (event.key === "ArrowLeft" ? -1 : 1));
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = normalizeOtpDigits(event.clipboardData.getData("text"));
    if (pasted.length > 0) writeAt(index, pasted);
  }

  return (
    <div className={cn("te-otp", className)}>
      <p id={labelId} className="te-otp__label">
        {label}
      </p>
      <div role="group" aria-labelledby={labelId} className="te-otp__cells">
        {cells.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              cellRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={cellLabel
              .replace("{position}", String(index + 1))
              .replace("{length}", String(length))}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            value={digit}
            className="te-otp__cell"
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            onFocus={(event) => event.currentTarget.select()}
          />
        ))}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="te-otp__error">
          <TeIcon name="alert" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
