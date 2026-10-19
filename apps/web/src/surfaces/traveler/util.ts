// Small helpers shared by the traveler screens.
/** Picks the locale's field with a fallback to the other language. */
export function pick(
  locale: string,
  ar: string | null | undefined,
  en: string | null | undefined,
): string {
  return ((locale === "ar" ? ar || en : en || ar) ?? "").trim();
}

/** Page frame for traveler screens: one column, phone-first, capped width on desktop. */
export const TRAVELER_PAGE_CLASS =
  "mx-auto flex w-full max-w-[880px] flex-col gap-5 px-4 py-6 md:py-10";
