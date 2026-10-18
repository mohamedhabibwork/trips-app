import { useEffect, useState, type FormEvent } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { isCodeComplete, OtpEntryPanel } from "./otp-entry-panel";
import { goBack } from "./screen-actions";
import { StatePreview } from "./state-preview";

function maskTarget(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "***";
  if (trimmed.includes("@")) {
    const [local = "", domain = ""] = trimmed.split("@");
    return `${local.slice(0, 1)}***@${domain}`;
  }
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-2)}`;
}

function OtpEntryForm() {
  const queryClient = useQueryClient();
  const verifyMutation = useMutation(
    orpc.auth.verifyOtp.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const [code, setCode] = useState("");
  const [target, setTarget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      const saved = sessionStorage.getItem("te:lastOtpTarget");
      if (saved) setTarget(saved);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !isCodeComplete(code)) return;
    setSubmitting(true);
    try {
      await verifyMutation.mutateAsync({
        targetIdentifier: target || "pending-verification",
        purpose: "registration",
        code,
        surface: "web",
      });
    } catch {
      // Handled via StatePreview or caller
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => void handleSubmit(e)}>
      <OtpEntryPanel destination={maskTarget(target)} code={code} onCodeChange={setCode} />
      <div>
        <TeButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={!isCodeComplete(code) || submitting}
        >
          {t("screen.shared.scrShr14OtpEntry.verify")}
        </TeButton>
      </div>
    </form>
  );
}

/** One-time code entry for verification. Used by sign-up verification and password reset. */
export function ScrShr14OtpEntry() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <TePageHeader
        title={t("screen.shared.scrShr14OtpEntry.otpEntry")}
        description={t("screen.shared.scrShr14OtpEntry.enterTheOneTimeCode")}
        actions={
          <TeButton variant="ghost" onClick={goBack}>
            {t("screen.shared.scrShr14OtpEntry.back")}
          </TeButton>
        }
      />
      <StatePreview
        main={<OtpEntryForm />}
        error={
          <div className="flex flex-col gap-6">
            <TeInlineAlert tone="error" title={t("screen.shared.scrShr14OtpEntry.wrongCode")}>
              {t("screen.shared.scrShr14OtpEntry.thatCodeDoesNotMatch")}
            </TeInlineAlert>
            <OtpEntryForm />
          </div>
        }
      />
    </div>
  );
}
