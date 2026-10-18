import { t } from "@trips-app/i18n"; // Placeholder list. The full country list comes from the server; only the launch market is shown here.
export const COUNTRY_OPTIONS = [
  {
    value: "",
    get label() {
      return t("screen.public.common.countryOptions.selectACountry");
    },
  },
  {
    value: "SA",
    get label() {
      return t("screen.public.common.countryOptions.saudiArabia");
    },
  },
] as const;
