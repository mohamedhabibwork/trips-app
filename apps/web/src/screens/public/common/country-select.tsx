// "Country" select for the application forms, from the shared registration market table.
import { REGISTRATION_COUNTRIES, countryName, isRegistrationCountryEnabled } from "@trips-app/auth";

import { useAuth } from "@/auth/auth-context";
import { SelectField } from "@/components/kit/controls";

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  errors?: readonly string[];
}

export function CountrySelect({ value, onChange, disabled = false, errors }: CountrySelectProps) {
  const { t, locale } = useAuth();
  return (
    <SelectField
      name="country"
      label={t("screen.public.common.countrySelect.country")}
      value={value}
      required
      disabled={disabled}
      errors={errors}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{t("screen.public.common.countrySelect.selectCountry")}</option>
      {REGISTRATION_COUNTRIES.map((option) => (
        <option key={option.code} value={option.code} disabled={!option.enabled}>
          {isRegistrationCountryEnabled(option.code)
            ? countryName(option.code, locale)
            : t("auth.signUp.countryComingSoon", { country: countryName(option.code, locale) })}
        </option>
      ))}
    </SelectField>
  );
}
