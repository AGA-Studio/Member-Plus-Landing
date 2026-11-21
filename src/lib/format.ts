import { intlLocales, type Locale } from "@/i18n";

export function formatMoney(locale: Locale, amount: number): string {
  return new Intl.NumberFormat(intlLocales[locale], {
    style: "currency",
    currency: "MXN",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(intlLocales[locale], { maximumFractionDigits: 0 }).format(value);
}
