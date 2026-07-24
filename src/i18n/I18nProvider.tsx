import { createContext, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { assert } from "../assert";
import { createEuroFormatter, type CurrencyFormatter } from "./formatCurrency";
import { detectLocale, type Locale } from "./locale";
import { TRANSLATIONS, type Translations } from "./translations";

const LOCALE_STORAGE_KEY = "plan-the-party:locale";

type I18nContextValue = Readonly<{
  locale: Locale;
  translations: Translations;
  formatCurrency: CurrencyFormatter;
  setLocale: (locale: Locale) => void;
}>;

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale(
    localStorage.getItem(LOCALE_STORAGE_KEY),
    navigator.languages,
  ));

  const value = useMemo<I18nContextValue>(() => {
    const formatCurrency = createEuroFormatter(locale === "lt" ? "lt-LT" : "en-GB");
    return {
      locale,
      translations: TRANSLATIONS[locale],
      formatCurrency,
      setLocale: (nextLocale) => {
        localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
        setLocaleState(nextLocale);
      },
    };
  }, [locale]);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.title = value.translations.appTitle;
  }, [locale, value.translations.appTitle]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  assert(value !== null, "useI18n must be used within I18nProvider.");
  return value;
}
