// SCR-SHR-10 Language switch and RTL: the switch, a field that keeps its value across the switch,
// and a date that follows the selected language's format.
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { TextField, buttonClass } from "@/components/kit/controls";
import { formatDate } from "@/components/kit/format";
import { PhoneColumn } from "@/components/kit/layout";

import { LanguageSwitchPanel } from "./language-switch";

export function ScrShr10LanguageSwitchAndRtl() {
  const { t, locale } = useAuth();
  return (
    <PhoneColumn>
      <h1 className="m-0 text-2xl leading-9 font-bold">
        {t("screen.shared.languageSwitch.title")}
      </h1>
      <LanguageSwitchPanel />
      <TextField
        name="fullName"
        label={t("screen.shared.languageSwitch.fullName")}
        autoComplete="name"
        className="font-medium"
      />
      <div className="flex items-center justify-between rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] px-4 py-3.5 shadow-[var(--te-card-shadow)]">
        <span className="text-[15px] font-medium">{t("screen.shared.languageSwitch.today")}</span>
        <span className="text-base font-bold">{formatDate(new Date(), locale)}</span>
      </div>
      <p className="m-0 text-[13px] leading-5 text-[var(--te-ink-muted)]">
        {t("screen.shared.languageSwitch.formats")}
      </p>
      <Link to="/" className={`${buttonClass("primary")} mt-auto`}>
        {t("screen.shared.languageSwitch.continue")}
      </Link>
    </PhoneColumn>
  );
}
