// SCR-PUB-12 Staff code set-up (`/business/sign-in/set-up-code`): the first staff sign-in sets its
// second factor here. The set-up (challenge, TOTP key, SMS destination) comes from the staff sign-in
// step in memory; without it the page sends the user back to sign in.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AuthErrorView } from "@trips-app/auth";
import { useState, type FormEvent } from "react";

import { isOtpAuthUri } from "@/auth/admin-enrollment";
import { useAuth } from "@/auth/auth-context";
import { getStaffSetup, setStaffSetup } from "@/auth/staff-setup";
import { SubmitBanner } from "@/auth/components/submit-banner";
import { toAuthErrorView } from "@/auth/errors";
import {
  Button,
  ChoiceGroup,
  ChoiceRow,
  Notice,
  StatusPill,
  TextField,
  TextLink,
  linkClass,
} from "@/components/kit/controls";
import { CenteredPanel, Lead, PanelHeading } from "@/components/kit/layout";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

import { maskDestination } from "../../shared/otp-entry-panel";

const CODE_LENGTH = 6;

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
  const [setup] = useState(getStaffSetup);
  const [method, setMethod] = useState<CodeMethod>(() =>
    setup && !setup.totpSecret && setup.smsTarget ? "sms" : "totp",
  );
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!setup || submitting || code.length !== CODE_LENGTH) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await setupMutation.mutateAsync({
        challengeToken: setup.challengeToken,
        method,
        verificationCode: code,
      });
      setStaffSetup(null);
      signInWithSession(result.session);
      await navigate({ to: "/business" });
    } catch (caught) {
      setCode("");
      setError(toAuthErrorView(caught, { locale, procedure: "auth/staffSetupSecondFactor" }));
    } finally {
      setSubmitting(false);
    }
  }

  if (!setup) {
    return (
      <CenteredPanel width={560}>
        <PanelHeading>{t("screen.public.signIn.staffCodeSetUp.title")}</PanelHeading>
        <Notice tone="info">{t("screen.public.signIn.staffCodeSetUp.startOver")}</Notice>
        <TextLink to={pathFor("SCR-PUB-11")}>
          {t("screen.public.signIn.staffCodeSetUp.backToSignIn")}
        </TextLink>
      </CenteredPanel>
    );
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
            disabled={submitting || !setup.totpSecret}
          >
            {t("screen.public.signIn.staffCodeSetUp.app")}
          </ChoiceRow>
          <ChoiceRow
            name="method"
            value="sms"
            checked={method === "sms"}
            onChange={() => setMethod("sms")}
            disabled={submitting || !setup.smsTarget}
          >
            {setup.smsTarget
              ? t("screen.public.signIn.staffCodeSetUp.smsTo", {
                  phone: maskDestination(setup.smsTarget),
                })
              : t("screen.public.signIn.staffCodeSetUp.sms")}
          </ChoiceRow>
        </ChoiceGroup>
        {method === "totp" && setup.totpSecret ? (
          <div className="flex flex-col gap-1.5 rounded-[var(--te-radius-md)] border-[1.5px] border-[var(--te-hairline)] bg-[var(--te-surface)] p-4 text-sm leading-5">
            <span className="font-semibold">
              {t("screen.public.signIn.staffCodeSetUp.enterKey")}
            </span>
            <span dir="ltr" className="font-mono text-base break-all select-all">
              {setup.totpSecret}
            </span>
            {setup.otpauthUri && isOtpAuthUri(setup.otpauthUri) ? (
              <a href={setup.otpauthUri} className={linkClass()}>
                {t("screen.public.signIn.staffCodeSetUp.openInApp")}
              </a>
            ) : null}
          </div>
        ) : null}
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
