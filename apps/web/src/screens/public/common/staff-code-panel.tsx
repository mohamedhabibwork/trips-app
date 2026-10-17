import { useState } from "react";
import { TeOtpInput, TE_OTP_DEFAULT_LENGTH } from "@trips-app/ui/components/te-otp-input";
import { TeTabs } from "@trips-app/ui/components/te-tabs";

const METHOD_TABS = [
  { id: "sms", label: "SMS" },
  { id: "app", label: "Authenticator app" },
] as const;

const METHOD_HINTS: Readonly<Record<string, string>> = {
  sms: `We send a ${TE_OTP_DEFAULT_LENGTH}-digit code to your phone by text message.`,
  app: `Enter the ${TE_OTP_DEFAULT_LENGTH}-digit code shown in your authenticator app.`,
};

interface StaffCodePanelProps {
  code: string;
  onCodeChange: (code: string) => void;
}

/** Second factor for staff: pick SMS or an authenticator app, then enter the code. Posts as staffCode. */
export function StaffCodePanel({ code, onCodeChange }: StaffCodePanelProps) {
  const [method, setMethod] = useState("sms");

  return (
    <div className="flex flex-col gap-4">
      <TeTabs
        tabs={METHOD_TABS}
        activeId={method}
        onSelect={setMethod}
        ariaLabel="Second factor method"
      />
      <input type="hidden" name="method" value={method} />
      <p className="te-body">{METHOD_HINTS[method]}</p>
      <TeOtpInput label="Staff code" value={code} onValueChange={onCodeChange} />
      <input type="hidden" name="staffCode" value={code} />
    </div>
  );
}
