import { englishTranslations, type Translations } from "./locales/en";
import { lithuanianTranslations } from "./locales/lt";

export type { Translations } from "./locales/en";

export const TRANSLATIONS = {
  en: englishTranslations,
  lt: lithuanianTranslations,
} as const satisfies Readonly<Record<"en" | "lt", Translations>>;
