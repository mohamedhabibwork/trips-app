// Six single-digit boxes (SCR-PUB-07, SCR-SHR-14: 56×64 on desktop, 50×60 on a phone): auto-advance, backspace, paste, and arrow keys (PRD §6).
import { useRef } from "react";

import { useAuth } from "../auth-context";

export interface OtpInputProps {
  /** The digits entered so far, as a string of length <= `length`. */
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  /** Called when the last digit is filled, so the form can submit without a click. */
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  onComplete,
  autoFocus = true,
}: OtpInputProps) {
  const { t } = useAuth();
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const setDigit = (index: number, digit: string): void => {
    const next = value.padEnd(length, " ").split("");
    next[index] = digit.length > 0 ? digit : " ";
    const joined = next.join("").replace(/\s+$/g, "");
    onChange(joined);
    if (digit.length > 0 && index < length - 1) refs.current[index + 1]?.focus();
    if (joined.length === length) onComplete?.(joined);
  };

  const handlePaste = (text: string): void => {
    const cleaned = text.replace(/\D/g, "").slice(0, length);
    if (cleaned.length === 0) return;
    onChange(cleaned);
    if (cleaned.length === length) {
      refs.current[length - 1]?.focus();
      onComplete?.(cleaned);
    } else {
      refs.current[Math.min(cleaned.length, length - 1)]?.focus();
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-2 md:gap-2.5"
      dir="ltr"
      role="group"
      aria-label={t("auth.otp.label")}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          value={digits[index]?.trim() ?? ""}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          maxLength={1}
          aria-label={t("auth.otp.digitLabel", { index: index + 1 })}
          className="box-border h-[60px] w-full max-w-14 min-w-0 rounded-[var(--te-radius-sm)] border-[1.5px] border-[var(--te-control-border)] bg-[var(--te-surface-raised)] text-center text-[22px] font-semibold text-[var(--te-ink)] focus:border-2 focus:border-[var(--te-focus-ring)] disabled:opacity-60 md:h-16 md:text-2xl"
          onChange={(event) => {
            const raw = event.target.value;
            // A paste or an autofilled code arrives as several characters in one event.
            if (raw.length > 1) {
              handlePaste(raw);
              return;
            }
            setDigit(index, raw.replace(/\D/g, ""));
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && digits[index]?.trim() === "" && index > 0) {
              refs.current[index - 1]?.focus();
            }
            if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
            if (event.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus();
          }}
          onPaste={(event) => {
            event.preventDefault();
            handlePaste(event.clipboardData.getData("text"));
          }}
        />
      ))}
    </div>
  );
}
