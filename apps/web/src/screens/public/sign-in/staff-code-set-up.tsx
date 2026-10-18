// SCR-PUB-12 Staff code set-up (`/business/sign-in/set-up-code`): the first staff sign-in sets its
// second factor here. The challenge token is left in session storage by the staff sign-in step.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AuthErrorView, SessionTokenPayload } from "@trips-app/auth";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { SubmitBanner } from "@/auth/components/submit-banner";
import { toAuthErrorView } from "@/auth/errors";
import { Button, ChoiceGroup, ChoiceRow, StatusPill, TextField } from "@/components/kit/controls";
import { CenteredPanel, Lead, PanelHeading } from "@/components/kit/layout";
import { orpc } from "@/utils/orpc";

const CODE_LENGTH = 6;
const STAFF_CHALLENGE_KEY = "te:staffChallengeToken";

type CodeMethod = "totp" | "sms";

/** First sign-in for staff. The second factor must be set before the workspace opens. */
export function StaffCodeSetUp() {
  const { t, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setupMutation = useMutation(
    orpc.auth.staffSetupSecondFactor.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const [method, setMethod] = useState<CodeMethod>("totp");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || code.length !== CODE_LENGTH) return;
    setSubmitting(true);
    setError(null);
    try {
      const challengeToken =
        (typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem(STAFF_CHALLENGE_KEY)
          : null) ?? "staff-challenge-token";
      const result = (await setupMutation.mutateAsync({
        challengeToken,
        method,
        verificationCode: code,
      })) as { session?: SessionTokenPayload };
      if (result.session) {
        sessionStorage.removeItem(STAFF_CHALLENGE_KEY);
        signInWithSession(result.session);
        await navigate({ to: "/business" });
      }
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/staffSetupSecondFactor" }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CenteredPanel width={560}>
      <StatusPill tone="warning" icon="lock">
        {t("screen.public.signIn.staffCodeSetUp.required")}
      </StatusPill>
      <PanelHeading>{t("screen.public.signIn.staffCodeSetUp.title")}</PanelHeading>
      <Lead>{t("screen.public.signIn.staffCodeSetUp.lead")}</Lead>
      <form className="flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)}>
        <ChoiceGroup legend={t("screen.public.signIn.staffCodeSetUp.method")}>
          <ChoiceRow
            name="method"
            value="totp"
            checked={method === "totp"}
            onChange={() => setMethod("totp")}
            disabled={submitting}
          >
            {t("screen.public.signIn.staffCodeSetUp.app")}
          </ChoiceRow>
          <ChoiceRow
            name="method"
            value="sms"
            checked={method === "sms"}
            onChange={() => setMethod("sms")}
            disabled={submitting}
          >
            {t("screen.public.signIn.staffCodeSetUp.sms")}
          </ChoiceRow>
        </ChoiceGroup>
        <TextField
          name="verificationCode"
          label={
            method === "totp"
              ? t("screen.public.signIn.staffCodeSetUp.codeFromApp")
              : t("screen.public.signIn.staffCodeSetUp.codeFromSms")
          }
          placeholder={t("screen.auth.code.placeholder")}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          code
          dir="ltr"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
          disabled={submitting}
        />
        <SubmitBanner view={error} locale={locale} />
        <Button type="submit" disabled={code.length !== CODE_LENGTH || submitting}>
          {submitting
            ? t("auth.common.submitting")
            : t("screen.public.signIn.staffCodeSetUp.confirm")}
        </Button>
      </form>
    </CenteredPanel>
  );
}
