import { useState } from "react";
import { TeSelect } from "@trips-app/ui/components/te-select";
import { setLocale, t } from "@trips-app/i18n";

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
] as const;

interface LanguageSelectProps {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/** Language control shown on every public screen. Keeps its own value unless a parent listens. */
export function LanguageSelect({ defaultValue = "en", onValueChange }: LanguageSelectProps) {
  const [value, setValue] = useState(defaultValue);

  function handleChange(next: string) {
    setValue(next);
    if (next === "ar" || next === "en") {
      setLocale(next);
    }
    onValueChange?.(next);
  }

  return (
    <TeSelect
      label={t("screen.public.common.languageSelect.language")}
      options={LANGUAGE_OPTIONS}
      value={value}
      onValueChange={handleChange}
    />
  );
}
