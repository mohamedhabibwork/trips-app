// SCR-TRV-19 Profile, language and notifications: name, email, phone, country, interface language
// (applies at once, D-20) and notification channels per category with the quiet-hours notice.
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, SelectField, TextField } from "@/components/kit/controls";
import { client } from "@/utils/orpc";
import { ScreenLoading } from "@/surfaces/traveler/components/states";
import { useTravelerProfile } from "@/surfaces/traveler/plan-tier";
import { TRAVELER_PAGE_CLASS } from "@/surfaces/traveler/util";
import { toast } from "sonner";

const CATEGORIES = ["trip_updates", "booking_updates", "promotions"] as const;

const CHANNELS = ["in_app", "email", "sms", "push"] as const;

type Channel = (typeof CHANNELS)[number];

export function Trv19Profile() {
  const { t, locale, setLocale } = useAuth();
  const profile = useTravelerProfile();

  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("EG");
  const [phone, setPhone] = useState("");
  const [prefs, setPrefs] = useState<Record<string, readonly Channel[]>>({});

  useEffect(() => {
    if (!profile.data) return;
    setFullName(profile.data.fullName ?? "");
    setCountryCode(profile.data.countryCode ?? "EG");
    setPhone(profile.data.phoneE164 ?? "");
    const initial: Record<string, readonly Channel[]> = {};
    for (const category of CATEGORIES) {
      const enabled = (
        profile.data.notificationPreferences as unknown as
          | Record<string, readonly string[] | undefined>
          | undefined
      )?.[category];
      initial[category] = (enabled ?? ["in_app"]).filter((channel): channel is Channel =>
        (CHANNELS as readonly string[]).includes(channel),
      );
    }
    setPrefs(initial);
  }, [profile.data]);

  const save = useMutation({
    mutationFn: () =>
      client.traveler.updateProfile({
        fullName: fullName.trim(),
        countryCode: (countryCode.trim().toUpperCase() || "EG") as "EG" | "SA" | "AE",
        phoneE164: phone.trim() || null,
        preferredLanguage: locale === "ar" ? "ar" : "en",
        notificationPreferences: prefs as Record<string, string[]>,
      }),
    onSuccess: () => {
      toast.success(t("screen.traveler.profile.saved"));
      void profile.refetch();
    },
    onError: () => toast.error(t("screen.traveler.common.errorTitle")),
  });

  if (profile.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (profile.isError || !profile.data) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <Notice tone="danger" strong>
          {t("screen.traveler.common.errorTitle")}
        </Notice>
        <Button tone="outline" onClick={() => void profile.refetch()}>
          {t("screen.traveler.common.retry")}
        </Button>
      </div>
    );
  }

  function toggleChannel(category: string, channel: Channel) {
    setPrefs((current) => {
      const enabled = current[category] ?? [];
      return {
        ...current,
        [category]: enabled.includes(channel)
          ? enabled.filter((item) => item !== channel)
          : [...enabled, channel],
      };
    });
  }

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.profile.title")}</h1>

      <TextField
        label={t("screen.traveler.profile.name")}
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
      />
      <TextField
        label={t("screen.traveler.profile.email")}
        value={profile.data.email ?? ""}
        disabled
        hint={t("screen.traveler.profile.emailLocked")}
      />
      <TextField
        label={t("screen.traveler.profile.phone")}
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        dir="ltr"
      />
      <SelectField
        label={t("screen.traveler.profile.country")}
        value={countryCode}
        onChange={(event) => setCountryCode(event.target.value)}
      >
        <option value="EG">{t("screen.traveler.profile.country.eg")}</option>
        <option value="SA">{t("screen.traveler.profile.country.sa")}</option>
        <option value="AE">{t("screen.traveler.profile.country.ae")}</option>
      </SelectField>

      <SelectField
        label={t("screen.traveler.profile.language")}
        value={locale}
        onChange={(event) => setLocale(event.target.value === "ar" ? "ar" : "en")}
        hint={t("screen.traveler.profile.languageNote")}
      >
        <option value="ar">{t("screen.traveler.profile.language.ar")}</option>
        <option value="en">{t("screen.traveler.profile.language.en")}</option>
      </SelectField>

      <section aria-labelledby="trv19-channels" className="flex flex-col gap-3">
        <h2 id="trv19-channels" className="m-0 text-lg font-semibold">
          {t("screen.traveler.profile.channelsTitle")}
        </h2>
        {CATEGORIES.map((category) => (
          <fieldset key={category} className="m-0 border-0 p-0">
            <legend className="mb-1 text-[15px] font-semibold">
              {t(`screen.traveler.profile.category.${category}`)}
            </legend>
            <div className="flex flex-wrap gap-4">
              {CHANNELS.map((channel) => (
                <label key={channel} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={(prefs[category] ?? []).includes(channel)}
                    onChange={() => toggleChannel(category, channel)}
                  />
                  {t(`screen.traveler.profile.channel.${channel}`)}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <Notice tone="info">{t("screen.traveler.profile.quietHours")}</Notice>
      </section>

      <Button block disabled={save.isPending} onClick={() => save.mutate()}>
        {save.isPending ? t("auth.common.submitting") : t("screen.traveler.profile.save")}
      </Button>

      <div className="flex flex-col gap-2 rounded-[var(--te-radius-md)] border-[1.5px] border-[var(--te-hairline)] p-4">
        <h2 className="m-0 text-lg font-semibold">{t("screen.traveler.profile.accountTitle")}</h2>
        <Link to="/traveler/privacy" className="text-sm underline">
          {t("screen.traveler.profile.privacyLink")}
        </Link>
        <Link to="/traveler/become-supplier" className="text-sm underline">
          {t("screen.traveler.profile.supplierLink")}
        </Link>
        <Link to="/traveler/plans" className="text-sm underline">
          {t("screen.traveler.profile.plansLink")}
        </Link>
      </div>
    </div>
  );
}
