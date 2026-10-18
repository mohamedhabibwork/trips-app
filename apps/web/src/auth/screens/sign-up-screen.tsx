// /sign-up — the role chooser (SCR-PUB-02) and the traveler form (SCR-PUB-03) (AC-1, P0-1).
//
// Step machine: choose → form → otp → pending. Drivers, photographers and organizations apply on
// their own pages (SCR-PUB-04..06), so this form registers travelers only.
// Country is required on every registration form (FR-AUTH-02) and is attached to the payload by the
// single `withCountry()` adapter; the server strips it today (G3, TODO(FR-AUTH-02)).
import { useNavigate } from "@tanstack/react-router";
import {
  REGISTRATION_COUNTRIES,
  countryName,
  isRegistrationCountryEnabled,
  toRegistrationPayload,
} from "@trips-app/auth";
import type { AuthErrorView, SessionTokenPayload } from "@trips-app/auth";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { cn } from "@trips-app/ui/lib/utils";
import { useState } from "react";

import {
  Button,
  CheckField,
  Notice,
  SelectField,
  StatusPill,
  TextLink,
} from "@/components/kit/controls";
import { PageIntro, PageMain } from "@/components/kit/layout";
import { pathFor } from "@/navigation/web-routes";

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
  | { kind: "choose" }
  | { kind: "form" }
  | { kind: "otp"; dispatches: OtpDispatchView[]; index: number }
  | { kind: "pending"; contact: string };

interface RoleOption {
  role: RegistrationRole;
  key: "traveler" | "driver" | "photographer" | "organization";
  /** Supplier roles apply on their own page; the traveler continues here. */
  screenId?: string;
  webOnly?: boolean;
}

const ROLE_OPTIONS: readonly RoleOption[] = [
  { role: "traveler", key: "traveler" },
  { role: "platform_driver", key: "driver", screenId: "SCR-PUB-04" },
  { role: "platform_photographer", key: "photographer", screenId: "SCR-PUB-05" },
  { role: "organization_owner", key: "organization", screenId: "SCR-PUB-06", webOnly: true },
];

interface SignUpScreenProps {
  returnTo?: string;
  /** `form` opens the traveler form directly (`/sign-up/traveler`). */
  start?: "choose" | "form";
}

export function SignUpScreen({ returnTo, start = "choose" }: SignUpScreenProps) {
  const { t, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>({ kind: start });
  const [role, setRole] = useState<RegistrationRole>("traveler");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState<"ar" | "en">(locale);
  const [enableParentRole, setEnableParentRole] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);
  const [missing, setMissing] = useState<"country" | "contact" | null>(null);

  const submitForm = async (): Promise<void> => {
    if (email.trim().length === 0 && phone.trim().length === 0) {
      setMissing("contact");
      return;
    }
    if (country.length === 0) {
      setMissing("country");
      return;
    }
    setMissing(null);
    setSubmitting(true);
    setError(null);
    try {
      // The country is required by the form (G1/G2) and removed here (G3): the server schemas do not
      // declare it, so `toRegistrationPayload` is the only place that decides what is sent.
      const payload = toRegistrationPayload({
        fullName: fullName.trim(),
        email: email.trim().length > 0 ? email.trim() : null,
        phone: phone.trim().length > 0 ? phone.trim() : null,
        password: null,
        preferredLanguage: language,
        surface: "web" as const,
        country,
      });

      const result = (await client.auth.registerTraveler({
        ...payload,
        preferredSignInMethod: "otp",
        enableParentRole,
      })) as unknown as RegistrationResult;

      const dispatches = result.otpDispatches ?? [];
      if (dispatches.length === 0) {
        setStep({ kind: "pending", contact: email.trim() || phone.trim() });
        return;
      }
      setStep({ kind: "otp", dispatches, index: 0 });
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/registerTraveler" }));
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

      if (result.session) {
        signInWithSession(result.session);
        await navigate({ to: returnToSafe(returnTo, result.session.activeRole) });
        return;
      }

      if (!result.allRequiredChannelsVerified && current.index + 1 < current.dispatches.length) {
        setStep({ kind: "otp", dispatches: current.dispatches, index: current.index + 1 });
        return;
      }

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

  if (step.kind === "choose") {
    return (
      <RoleChooser
        role={role}
        onRole={setRole}
        onContinue={() => {
          const option = ROLE_OPTIONS.find((candidate) => candidate.role === role);
          if (option?.screenId) {
            void navigate({ to: pathFor(option.screenId) });
            return;
          }
          setStep({ kind: "form" });
        }}
      />
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
        changeLabel={dispatch.channel === "email" ? t("screen.auth.signUp.changeEmail") : undefined}
      />
    );
  }

  if (step.kind === "pending") {
    return <PendingApprovalScreen contact={step.contact} role={role} />;
  }

  // M2: per-field issues render under their input; anything else goes to the banner.
  const renderedFields = new Set(["fullName", "email", "phone", "country"]);
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
      layout="phone"
      title={t("screen.auth.signUp.travelerTitle")}
      subtitle={t("screen.auth.signUp.travelerLead")}
      footer={
        <AuthLinkRow>
          <span>{t("auth.signUp.haveAccount")}</span>
          <TextLink to={pathFor("SCR-PUB-08")}>{t("auth.signUp.signIn")}</TextLink>
        </AuthLinkRow>
      }
    >
      <form
        className="flex flex-1 flex-col gap-3.5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submitForm();
        }}
      >
        <AuthField
          id="fullName"
          label={t("auth.signUp.fullName")}
          value={fullName}
          onChange={setFullName}
          autoComplete="name"
          required
          disabled={submitting}
          issues={issuesFor("fullName")}
        />

        <AuthField
          id="email"
          type="email"
          label={t("auth.signUp.email")}
          placeholder={t("screen.auth.signUp.emailPlaceholder")}
          value={email}
          onChange={setEmail}
          autoComplete="email"
          inputMode="email"
          disabled={submitting}
          issues={issuesFor("email")}
        />

        <AuthField
          id="phone"
          type="tel"
          label={t("auth.signUp.phone")}
          placeholder={t("screen.auth.signUp.phonePlaceholder")}
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
          inputMode="tel"
          disabled={submitting}
          issues={issuesFor("phone")}
        />

        <SelectField
          id="country"
          label={t("auth.signUp.country")}
          value={country}
          required
          disabled={submitting}
          errors={issuesFor("country")}
          onChange={(event) => setCountry(event.target.value)}
        >
          <option value="">{t("screen.auth.signUp.selectCountry")}</option>
          {REGISTRATION_COUNTRIES.map((option) => (
            <option key={option.code} value={option.code} disabled={!option.enabled}>
              {isRegistrationCountryEnabled(option.code)
                ? countryName(option.code, locale)
                : t("auth.signUp.countryComingSoon", {
                    country: countryName(option.code, locale),
                  })}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="language"
          label={t("screen.auth.signUp.language")}
          value={language}
          disabled={submitting}
          onChange={(event) => setLanguage(event.target.value === "ar" ? "ar" : "en")}
        >
          <option value="en" lang="en">
            {t("component.shell.language.english")}
          </option>
          <option value="ar" lang="ar">
            {t("component.shell.language.arabic")}
          </option>
        </SelectField>

        <CheckField
          label={t("auth.signUp.parentToggle")}
          checked={enableParentRole}
          disabled={submitting}
          onChange={(event) => setEnableParentRole(event.target.checked)}
        />

        {missing ? (
          <Notice tone="danger">
            {missing === "country"
              ? t("screen.auth.signUp.countryRequired")
              : t("screen.auth.signUp.contactRequired")}
          </Notice>
        ) : null}

        <SubmitBanner view={bannerView} locale={locale} />

        <Button
          type="submit"
          className="mt-auto"
          disabled={submitting || fullName.trim().length === 0}
        >
          {submitting ? t("auth.common.submitting") : t("auth.signUp.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}

interface RoleChooserProps {
  role: RegistrationRole;
  onRole: (role: RegistrationRole) => void;
  onContinue: () => void;
}

/** SCR-PUB-02: one card per role; the button names the role it continues with. */
function RoleChooser({ role, onRole, onContinue }: RoleChooserProps) {
  const { t } = useAuth();
  const selected = ROLE_OPTIONS.find((option) => option.role === role) ?? ROLE_OPTIONS[0];

  return (
    <PageMain className="gap-8">
      <PageIntro
        title={t("screen.auth.signUp.chooserTitle")}
        description={t("screen.auth.signUp.chooserLead")}
      />
      <section
        role="radiogroup"
        aria-label={t("screen.auth.signUp.rolesLabel")}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {ROLE_OPTIONS.map((option) => {
          const checked = option.role === role;
          return (
            <button
              key={option.role}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onRole(option.role)}
              className={cn(
                "flex cursor-pointer flex-col gap-3 rounded-[var(--te-radius-lg)] bg-[var(--te-surface-raised)] p-6 text-start text-[var(--te-ink)] shadow-[var(--te-card-shadow)]",
                checked
                  ? "border-2 border-[var(--te-ink)]"
                  : "border-[1.5px] border-[var(--te-control-border)]",
              )}
            >
              {checked ? (
                <StatusPill tone="neutral" className="font-medium">
                  <TeIcon name="check" className="size-4" />
                  {t("screen.auth.signUp.selected")}
                </StatusPill>
              ) : null}
              {option.webOnly && !checked ? (
                <StatusPill tone="warning" className="font-medium">
                  {t("screen.auth.signUp.webOnly")}
                </StatusPill>
              ) : null}
              <span className="text-2xl leading-8 font-semibold">
                {t(`screen.auth.signUp.${option.key}`)}
              </span>
              <span className="text-sm leading-5 text-[var(--te-ink-muted)]">
                {t(`screen.auth.signUp.${option.key}Body`)}
              </span>
            </button>
          );
        })}
      </section>
      <section className="flex flex-wrap items-center gap-6">
        <Button onClick={onContinue}>
          {t(`screen.auth.signUp.continue.${selected?.key ?? "traveler"}`)}
        </Button>
        <span className="text-sm text-[var(--te-ink-muted)]">
          {t("auth.signUp.haveAccount")}{" "}
          <TextLink to={pathFor("SCR-PUB-08")}>{t("auth.signUp.signIn")}</TextLink>
        </span>
      </section>
    </PageMain>
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
