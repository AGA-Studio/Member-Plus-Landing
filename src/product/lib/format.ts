import { intlLocales, type Locale } from "@/i18n";

export type Formatter = {
  locale: Locale;
};

const moneyOptions = {
  style: "currency",
  currency: "MXN",
  currencyDisplay: "narrowSymbol",
} as const;

function number(formatter: Formatter, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(intlLocales[formatter.locale], options).format(value);
}

export function formatMoney(formatter: Formatter, cents: number): string {
  return number(formatter, cents / 100, moneyOptions);
}

export function formatDiscount(formatter: Formatter, cents: number): string {
  return `−${formatMoney(formatter, cents)}`;
}

export function formatPositiveMoney(formatter: Formatter, cents: number): string {
  return `+${formatMoney(formatter, cents)}`;
}

export function formatPoints(formatter: Formatter, points: number): string {
  return number(formatter, points);
}

export function formatSignedPoints(formatter: Formatter, points: number): string {
  return `+${number(formatter, points)}`;
}

export function formatPlainAmount(formatter: Formatter, amount: number): string {
  return number(formatter, amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(formatter: Formatter, isoDate: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(intlLocales[formatter.locale], options).format(new Date(isoDate));
}

export function parseAmountToCents(rawAmount: string): number {
  const cleaned = rawAmount.replace(/[^0-9.]/g, "");
  const [whole = "", fraction = ""] = cleaned.split(".");
  const wholeDigits = whole.replace(/^0+(?=\d)/, "") || "0";
  const fractionDigits = fraction.slice(0, 2).padEnd(2, "0");

  return Number(wholeDigits) * 100 + Number(fractionDigits);
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}
