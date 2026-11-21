import type { Locale } from "@/i18n";

export const legalPaths = {
  privacy: { es: "/privacidad", en: "/en/privacy" },
  terms: { es: "/terminos", en: "/en/terms" },
} as const satisfies Record<string, Record<Locale, string>>;

export type LegalKind = keyof typeof legalPaths;
