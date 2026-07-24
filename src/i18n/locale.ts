import { assert } from "../assert";

export const SUPPORTED_LOCALES = ["en", "lt"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function detectLocale(storedLocale: string | null, browserLanguages: readonly string[]): Locale {
  if (storedLocale !== null) {
    assert(isLocale(storedLocale), `Unsupported stored locale "${storedLocale}".`);
    return storedLocale;
  }

  for (const tag of browserLanguages) {
    const language = new Intl.Locale(tag).language;
    if (isLocale(language)) return language;
  }

  return "en";
}
