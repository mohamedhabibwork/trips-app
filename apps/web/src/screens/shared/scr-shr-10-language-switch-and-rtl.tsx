import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect } from "@trips-app/ui/components/te-select";
import { COUNTRY_OPTIONS } from "../public/common/country-options";
import { LanguageSelect } from "../public/common/language-select";
import { goBack, preventSubmit } from "./screen-actions";

/** Language and layout direction. Switching keeps the form data and the current step. */
export function ScrShr10LanguageSwitchAndRtl() {
  const [language, setLanguage] = useState("en");
  const [country, setCountry] = useState("");
  const isArabic = language === "ar";

  return (
    <div
      lang={isArabic ? "ar" : "en"}
      dir={isArabic ? "rtl" : "ltr"}
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6"
    >
      <TePageHeader
        title="Language switch and RTL"
        description={isArabic ? "Layout: right to left" : "Layout: left to right"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <LanguageSelect defaultValue={language} onValueChange={setLanguage} />
            <TeButton variant="ghost" onClick={goBack}>
              Back
            </TeButton>
          </div>
        }
      />
      <TeCard>
        <form className="flex flex-col gap-4" onSubmit={preventSubmit}>
          <TeInput label="Full name" name="fullName" autoComplete="name" />
          <TeSelect
            label="Country"
            name="country"
            options={COUNTRY_OPTIONS}
            value={country}
            onValueChange={setCountry}
          />
          <div>
            <TeButton type="submit" variant="primary">
              Continue
              <TeIcon name="arrow" flipInRtl />
            </TeButton>
          </div>
        </form>
      </TeCard>
    </div>
  );
}
