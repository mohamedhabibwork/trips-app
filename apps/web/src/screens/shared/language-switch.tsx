// The language switch from SCR-SHR-10: English or Arabic on a two-way track. Switching flips the
// layout direction and keeps typed data and the current step (the page is not reloaded).
import { useAuth } from "@/auth/auth-context";
import { Segmented } from "@/components/kit/controls";

export function LanguageSwitchPanel() {
  const { t, locale, setLocale } = useAuth();
  return (
    <div className="flex flex-col gap-4">
      <Segmented
        label={t("screen.shared.languageSwitch.label")}
        value={locale}
        onChange={setLocale}
        options={[
          { value: "en", label: t("component.shell.language.english"), lang: "en" },
          { value: "ar", label: t("component.shell.language.arabic"), lang: "ar" },
        ]}
      />
      <p className="m-0 text-[15px] leading-7 text-[var(--te-ink-muted)]">
        {t("screen.shared.languageSwitch.keepsData")}
      </p>
    </div>
  );
}
