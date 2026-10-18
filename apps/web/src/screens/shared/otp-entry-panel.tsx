import { TeButton } from "@trips-app/ui/components/te-button";
import { TeOtpInput, TE_OTP_DEFAULT_LENGTH } from "@trips-app/ui/components/te-otp-input";
import { t } from "@trips-app/i18n";

// The resend action unlocks after a 45 to 60 second countdown (A1). The upper bound is shown.
export const RESEND_COUNTDOWN_SECONDS = 60;
export const CODE_EXPIRY_MINUTES = 5;

/** A code is complete when every cell holds a digit. */
export function isCodeComplete(code: string): boolean {
  return code.length === TE_OTP_DEFAULT_LENGTH;
}

interface OtpEntryPanelProps {
  /** Destination with partial masking, for example a***@example.com. */
  destination: string;
  code: string;
  onCodeChange: (code: string) => void;
  error?: string;
}

/** Code entry shared by verification, password reset and the OTP entry screen. The caller owns the code and the submit. */
export function OtpEntryPanel({ destination, code, onCodeChange, error }: OtpEntryPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="te-body">
        {t("screen.shared.otpEntryPanel.enterDigitCode", { length: TE_OTP_DEFAULT_LENGTH })}{" "}
        <strong>{destination}</strong>
        {t("screen.shared.otpEntryPanel.codeExpiry", { minutes: CODE_EXPIRY_MINUTES })}
      </p>
      <TeOtpInput
        label={t("screen.shared.otpEntryPanel.verificationCode")}
        cellLabel={t("screen.shared.otpEntryPanel.digitOf")}
        value={code}
        onValueChange={onCodeChange}
        error={error}
      />
      <div className="flex flex-wrap gap-2">
        <TeButton variant="ghost">{t("screen.shared.otpEntryPanel.changeEmailOrPhone")}</TeButton>
        <TeButton variant="ghost" disabled>
          {t("screen.shared.otpEntryPanel.resendIn", { seconds: RESEND_COUNTDOWN_SECONDS })}
        </TeButton>
      </div>
    </div>
  );
}
