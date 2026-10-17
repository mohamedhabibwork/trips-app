// /sign-up — traveler, driver, photographer and organization owner (AC-1, P0-1).
//
// Step machine: form → otp (one channel for a traveler, both for a supplier) → pending.
// Country is required on every registration form (FR-AUTH-02) and is attached to the payload by the
// single `withCountry()` adapter; the server strips it today (G3, TODO(FR-AUTH-02)).
import { Link, useNavigate } from "@tanstack/react-router";
import {
  REGISTRATION_COUNTRIES,
  countryName,
  defaultCountryForLocale,
  isRegistrationCountryEnabled,
  toRegistrationPayload,
} from "@trips-app/auth";
import type { AuthErrorView, SessionTokenPayload } from "@trips-app/auth";
import { Button } from "@trips-app/ui/components/button";
import { Input } from "@trips-app/ui/components/input";
import { Label } from "@trips-app/ui/components/label";
import { useState } from "react";

import { client } from "../../utils/orpc";
import { useAuth } from "../auth-context";
import { AuthField, AuthLinkRow, AuthShell } from "../components/auth-shell";
import { SubmitBanner } from "../components/submit-banner";
import { toAuthErrorView } from "../errors";
import { homeRouteForRole } from "../home-route";
import { OtpScreen } from "./otp-screen";
import { PendingApprovalScreen } from "./pending-approval-screen";

type RegistrationRole =
  | "traveler"
  | "platform_driver"
  | "platform_photographer"
  | "organization_owner";

interface OtpDispatchView {
  channel: string;
  targetIdentifier: string;
  resendAvailableInSeconds: number;
  devCodePreview?: string;
}

interface RegistrationResult {
  status?: string;
  otpDispatches?: OtpDispatchView[];
}

interface VerifyResult {
  verified?: boolean;
  accountActivated?: boolean;
  allRequiredChannelsVerified?: boolean;
  session?: SessionTokenPayload | null;
}

type Step =
  | { kind: "form" }
  | { kind: "otp"; dispatches: OtpDispatchView[]; index: number }
  | { kind: "pending"; contact: string }
  | { kind: "webOnly" };

const ROLE_OPTIONS: ReadonlyArray<{ role: RegistrationRole; labelKey: string }> = [
  { role: "traveler", labelKey: "auth.signUp.roleTraveler" },
  { role: "platform_driver", labelKey: "auth.signUp.roleDriver" },
  { role: "platform_photographer", labelKey: "auth.signUp.rolePhotographer" },
  { role: "organization_owner", labelKey: "auth.signUp.roleOrganization" },
];

export function SignUpScreen({ returnTo }: { returnTo?: string }) {
  const { t, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>({ kind: "form" });
  const [role, setRole] = useState<RegistrationRole>("traveler");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState(() => defaultCountryForLocale(locale));
  const [enableParentRole, setEnableParentRole] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);

  const isSupplier = role !== "traveler";

  const submitForm = async (): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      // The country is required by the form (G1/G2) and removed here (G3): the server schemas do not
      // declare it, so `toRegistrationPayload` is the only place that decides what is sent.
      const payload = toRegistrationPayload({
        fullName: fullName.trim(),
        email: email.trim().length > 0 ? email.trim() : null,
        phone: phone.trim().length > 0 ? phone.trim() : null,
        password: password.length > 0 ? password : null,
        preferredLanguage: locale,
        surface: "web" as const,
        country,
      });

      const result = (isSupplier
        ? await client.auth.registerSupplierAccount({
            ...payload,
            role,
            email: email.trim(),
            phone: phone.trim(),
            password,
          })
        : await client.auth.registerTraveler({
            ...payload,
            preferredSignInMethod: password.length > 0 ? "password" : "otp",
            enableParentRole,
          })) as unknown as RegistrationResult;

      const dispatches = result.otpDispatches ?? [];
      if (dispatches.length === 0) {
        setStep({ kind: "pending", contact: email.trim() || phone.trim() });
        return;
      }
      setStep({ kind: "otp", dispatches, index: 0 });
    } catch (caught) {
      const view = toAuthErrorView(caught, {
        locale,
        procedure: isSupplier ? "auth/registerSupplierAccount" : "auth/registerTraveler",
      });
      // G5: a web-only rejection swaps the form for the R-ORG screen instead of a generic error.
      if (view.key === "auth.error.webOnlyRegistration") {
        setStep({ kind: "webOnly" });
        return;
      }
      setError(view);
    } finally {
      setSubmitting(false);
    }
  };

  const submitOtp = async (
    current: { dispatches: OtpDispatchView[]; index: number },
    code: string,
  ): Promise<void> => {
    const dispatch = current.dispatches[current.index];
    if (!dispatch) return;

    setSubmitting(true);
    setError(null);
    try {
      const result = (await client.auth.verifyOtp({
        targetIdentifier: dispatch.targetIdentifier,
        purpose: "registration",
        code,
        surface: "web",
      })) as unknown as VerifyResult;

      if (result.session && !isSupplier) {
        signInWithSession(result.session);
        await navigate({ to: returnToSafe(returnTo, result.session.activeRole) });
        return;
      }

      // Supplier accounts need both channels verified (D2 covers travelers only).
      if (!result.allRequiredChannelsVerified && current.index + 1 < current.dispatches.length) {
        setStep({ kind: "otp", dispatches: current.dispatches, index: current.index + 1 });
        return;
      }

      if (result.session && isSupplier) {
        signInWithSession(result.session);
      }

      // AC-1: a supplier lands on the pending/onboarding screen after verifying both channels.
      setStep({ kind: "pending", contact: email.trim() || phone.trim() });
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/verifyOtp" }));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async (current: {
    dispatches: OtpDispatchView[];
    index: number;
  }): Promise<void> => {
    const dispatch = current.dispatches[current.index];
    if (!dispatch) return;
    try {
      const next = (await client.auth.resendOtp({
        targetIdentifier: dispatch.targetIdentifier,
        channel: dispatch.channel === "email" ? "email" : "sms",
        purpose: "registration",
      })) as unknown as OtpDispatchView;
      const dispatches = [...current.dispatches];
      dispatches[current.index] = { ...dispatch, ...next };
      setStep({ kind: "otp", dispatches, index: current.index });
      setError(null);
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/resendOtp" }));
    }
  };

  if (step.kind === "webOnly") {
    return (
      <AuthShell title={t("auth.signUp.webOnlyTitle")} subtitle={t("auth.signUp.webOnlyBody")}>
        <Link to="/sign-up" className="text-xs underline underline-offset-4">
          {t("auth.signUp.webOnlyBack")}
        </Link>
      </AuthShell>
    );
  }

  if (step.kind === "otp") {
    const dispatch = step.dispatches[step.index];
    // No dispatch left means every channel is verified; fall through to the form is wrong, so the
    // pending screen is rendered instead of mutating state during render.
    if (!dispatch) {
      return <PendingApprovalScreen contact={email.trim() || phone.trim()} role={role} />;
    }
    return (
      <OtpScreen
        target={dispatch.targetIdentifier}
        resendAvailableInSeconds={dispatch.resendAvailableInSeconds}
        devCodePreview={dispatch.devCodePreview}
        submitting={submitting}
        error={error}
        onSubmit={(code) => void submitOtp(step, code)}
        onResend={() => void resend(step)}
        onChangeTarget={() => {
          setStep({ kind: "form" });
          setError(null);
        }}
      />
    );
  }

  if (step.kind === "pending") {
    return <PendingApprovalScreen contact={step.contact} role={role} />;
  }

  // M2: per-field issues render under their input; anything else goes to the banner.
  const renderedFields = new Set(["fullName", "email", "phone", "password", "country"]);
  const fieldIssues = error?.fieldErrors ?? [];
  const allRendered =
    fieldIssues.length > 0 && fieldIssues.every((issue) => renderedFields.has(issue.field));
  const bannerView = allRendered ? null : error;
  const issuesFor = (field: string): string[] =>
    fieldIssues
      .filter((issue) => issue.field === field)
      .map((issue) => issue.message || issue.field);

  return (
    <AuthShell
      title={t("auth.signUp.title")}
      subtitle={t("auth.signUp.subtitle")}
      footer={
        <AuthLinkRow>
          <span>{t("auth.signUp.haveAccount")}</span>
          <Link to="/sign-in" className="underline underline-offset-4">
            {t("auth.signUp.signIn")}
          </Link>
        </AuthLinkRow>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submitForm();
        }}
      >
        <div className="grid gap-1.5">
          <span className="text-xs font-medium">{t("auth.signUp.roleLabel")}</span>
          <div
            className="flex flex-wrap gap-1"
            role="group"
            aria-label={t("auth.signUp.roleLabel")}
          >
            {ROLE_OPTIONS.map((option) => (
              <Button
                key={option.role}
                type="button"
                size="sm"
                variant={role === option.role ? "secondary" : "outline"}
                aria-pressed={role === option.role}
                onClick={() => setRole(option.role)}
              >
                {t(option.labelKey)}
              </Button>
            ))}
          </div>
        </div>

        <AuthField
          id="fullName"
          label={t("auth.signUp.fullName")}
          value={fullName}
          onChange={setFullName}
          autoComplete="name"
          required
          disabled={submitting}
        />

        <AuthField
          id="email"
          type="email"
          label={t("auth.signUp.email")}
          value={email}
          onChange={setEmail}
          autoComplete="email"
          inputMode="email"
          required={isSupplier}
          disabled={submitting}
        />

        <AuthField
          id="phone"
          type="tel"
          label={t("auth.signUp.phone")}
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
          inputMode="tel"
          required={isSupplier}
          disabled={submitting}
        />

        <div className="grid gap-1.5">
          <Label htmlFor="country">
            {t("auth.signUp.country")}
            <span className="text-destructive">*</span>
          </Label>
          <select
            id="country"
            name="country"
            value={country}
            required
            disabled={submitting}
            onChange={(event) => setCountry(event.target.value)}
            className="border-input bg-transparent h-8 w-full border px-2.5 text-xs"
          >
            {REGISTRATION_COUNTRIES.map((option) => (
              <option key={option.code} value={option.code} disabled={!option.enabled}>
                {isRegistrationCountryEnabled(option.code)
                  ? countryName(option.code, locale)
                  : t("auth.signUp.countryComingSoon", {
                      country: countryName(option.code, locale),
                    })}
              </option>
            ))}
          </select>
        </div>

        <AuthField
          id="password"
          type="password"
          label={t("auth.signUp.password")}
          hint={t("auth.signUp.passwordHint")}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required={isSupplier}
          disabled={submitting}
          issues={issuesFor("password")}
        />

        {!isSupplier ? (
          <label className="flex items-center gap-2 text-xs">
            <Input
              type="checkbox"
              checked={enableParentRole}
              onChange={(event) => setEnableParentRole(event.target.checked)}
              className="size-4"
              disabled={submitting}
            />
            {t("auth.signUp.parentToggle")}
          </label>
        ) : null}

        <p className="text-muted-foreground text-[11px]">
          {isSupplier ? t("auth.signUp.hintBoth") : t("auth.signUp.hintEither")}
        </p>

        <SubmitBanner view={bannerView} locale={locale} />

        <Button type="submit" disabled={submitting || fullName.trim().length === 0}>
          {submitting ? t("auth.common.submitting") : t("auth.signUp.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}

function returnToSafe(
  returnTo: string | undefined,
  role: string,
): "/" | "/business" | "/admin" | "/crew" | "/studio" {
  const home = homeRouteForRole(role);
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) return home;
  if (
    returnTo === "/" ||
    returnTo === "/business" ||
    returnTo === "/admin" ||
    returnTo === "/crew" ||
    returnTo === "/studio"
  ) {
    return returnTo;
  }
  return home;
}
