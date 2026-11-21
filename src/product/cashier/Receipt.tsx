import { Check, Star, Wallet } from "lucide-react";
import { Badge } from "../ui/Badge";
import { buttonStyles } from "../ui/Button";
import {
  formatDate,
  formatDiscount,
  formatMoney,
  formatPoints,
  formatPositiveMoney,
  formatSignedPoints,
  interpolate,
  type Formatter,
} from "../lib/format";
import type { Receipt as ReceiptData } from "../lib/domain";
import type { Messages } from "@/i18n";

type ReceiptProps = {
  receipt: ReceiptData;
  formatter: Formatter;
  messages: Messages["product"]["cashier"]["receipt"];
};

export function Receipt({ receipt, formatter, messages }: ReceiptProps) {
  const { breakdown } = receipt;
  const createdAt = formatDate(formatter, receipt.createdAt, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const rows = [
    { label: messages.date, value: createdAt },
    { label: messages.customer, value: receipt.memberName },
    { label: messages.concept, value: receipt.concept || messages.noConcept },
    { label: messages.amount, value: formatMoney(formatter, breakdown.amountCents) },
    {
      label: interpolate(messages.discount, { tier: receipt.tierName, percent: receipt.discountPercent }),
      value: formatDiscount(formatter, breakdown.discountCents),
      positive: true,
    },
  ];

  const balances = [
    {
      icon: Star,
      gained: `${formatSignedPoints(formatter, breakdown.pointsEarned)} ${messages.pointsUnit}`,
      label: messages.pointsBalance,
      value: formatPoints(formatter, receipt.pointsAfter),
    },
    {
      icon: Wallet,
      gained: formatPositiveMoney(formatter, breakdown.cashbackEarnedCents),
      label: messages.cashbackBalance,
      value: formatMoney(formatter, receipt.cashbackBalanceAfterCents),
    },
  ];

  return (
    <article className="mx-auto flex w-full max-w-xl flex-col overflow-hidden rounded-xl bg-surface shadow-md">
      <header className="flex flex-col items-center gap-2 bg-brand px-6 py-10 text-center text-white">
        <span className="flex size-14 items-center justify-center rounded-full border border-white">
          <Check aria-hidden strokeWidth={1.75} className="size-7" />
        </span>
        <h1 className="font-display text-subheading font-semibold">{messages.title}</h1>
        <p className="font-display text-display font-bold tabular-nums">{formatMoney(formatter, breakdown.totalCents)}</p>
        <p className="text-base text-white/90">{interpolate(messages.chargedTo, { name: receipt.memberName })}</p>
      </header>

      <div className="flex flex-col gap-6 p-8">
        <dl className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-base text-muted">{row.label}</dt>
              <dd
                className={
                  row.positive
                    ? "text-right text-base font-medium text-success-text tabular-nums"
                    : "text-right text-base font-medium text-foreground tabular-nums"
                }
              >
                {row.value}
              </dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
            <dt className="text-base font-medium text-foreground">{messages.total}</dt>
            <dd className="font-display text-heading font-semibold text-foreground tabular-nums">
              {formatMoney(formatter, breakdown.totalCents)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">{messages.newBalance}</p>
          <div className="grid grid-cols-2 gap-3">
            {balances.map(({ icon: Icon, gained, label, value }) => (
              <section key={label} className="flex flex-col gap-2 rounded-lg bg-surface-muted p-4">
                <Badge tone="success" className="self-start">
                  {gained}
                </Badge>
                <p className="flex items-center gap-1.5 text-sm text-muted">
                  <Icon aria-hidden strokeWidth={1.75} className="size-4" />
                  {label}
                </p>
                <p className="font-display text-heading font-semibold text-foreground tabular-nums">{value}</p>
              </section>
            ))}
          </div>
        </div>

        <span className={buttonStyles({ size: "xl", fullWidth: true })}>{messages.another}</span>
      </div>
    </article>
  );
}
