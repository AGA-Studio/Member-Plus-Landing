import es from "./es.json";
import en from "./en.json";

export type Messages = typeof es;
export type Locale = "es" | "en";

export const locales: readonly Locale[] = ["es", "en"];
export const defaultLocale: Locale = "es";

const dictionaries: Record<Locale, Messages> = { es, en };

export const intlLocales: Record<Locale, string> = {
  es: "es-MX",
  en: "en-US",
};

export const languageNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

export function localePath(locale: Locale, hash = ""): string {
  const base = locale === defaultLocale ? "/" : `/${locale}/`;
  return `${base}${hash}`;
}

export function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}
