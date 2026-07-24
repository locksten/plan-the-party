import { useI18n } from "../i18n/I18nProvider";
import { SUPPORTED_LOCALES, type Locale } from "../i18n/locale";
import { classes } from "../ui";

export function LanguageSelector() {
  const { locale, setLocale, translations } = useI18n();
  const languageNames = {
    en: "English",
    lt: "Lietuvių",
  } as const satisfies Readonly<Record<Locale, string>>;
  return (
    <div
      className="flex rounded-full border-[0.125rem] border-navy bg-cream p-0.5 shadow-[0_0.1875rem_0_#17233f]"
      role="group"
      aria-label={translations.language.label}
    >
      {SUPPORTED_LOCALES.map((option) => (
        <button
          className={classes(
            "min-h-8 rounded-full px-2.5 text-xs font-black uppercase text-navy",
            locale === option && "bg-yellow",
          )}
          type="button"
          aria-pressed={locale === option}
          aria-label={languageNames[option]}
          title={option === "en" ? translations.language.english : translations.language.lithuanian}
          onClick={() => setLocale(option)}
          key={option}
        >
          <span className="relative top-px">{option}</span>
        </button>
      ))}
    </div>
  );
}
