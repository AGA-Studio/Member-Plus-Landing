import { cx } from "@/lib/cx";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";
import {
  formatDiscount,
  formatMoney,
  formatPositiveMoney,
  formatSignedPoints,
  interpolate,
  parseAmountToCents,
  type Formatter,
} from "../lib/format";
import { calculatePurchase } from "../lib/pricing";
import type { Member, TierBenefits } from "../lib/domain";
import type { Messages } from "@/i18n";

type PurchaseFormProps = {
  member: Member | null;
  amount: string;
  amountFocused: boolean;
  useCashback: boolean;
  formatter: Formatter;
  messages: Messages["product"]["cashier"]["purchase"];
  submitRef?: React.Ref<HTMLButtonElement>;
  amountRef?: React.Ref<HTMLDivElement>;
};

const noBenefits: TierBenefits = { discountPercent: 0, pointsPerTenPesos: 0, cashbackPercent: 0 };

export function PurchaseForm({
  member,
  amount,
  amountFocused,
  useCashback,
  formatter,
  messages,
  submitRef,
  amountRef,
}: PurchaseFormProps) {
  const hasMember = member !== null;
  const cashbackBalanceCents = member?.cashbackBalanceCents ?? 0;
  const isActive = member?.status === "active";
  const benefits = member && isActive ? member.benefits : noBenefits;
  const canUseCashback = isActive && cashbackBalanceCents > 0;
  const amountCents = parseAmountToCents(amount);
  const breakdown = calculatePurchase({
    amountCents,
    benefits,
    useCashback: useCashback && canUseCashback,
    cashbackBalanceCents,
  });
  const hasAmount = amountCents > 0;
  const empty = "—";

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-heading text-foreground">{messages.title}</h1>
        {hasMember ? (
          <span className="inline-flex h-9 items-center justify-center rounded-md bg-transparent px-4 text-sm font-semibold text-foreground">
            {messages.cancel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">{messages.amount}</span>
        <div
          ref={amountRef}
          className={cx(
            "flex h-16 items-center gap-2 rounded-md border bg-surface px-4 transition-colors duration-150 ease-out",
            amountFocused ? "border-primary outline-2 outline-offset-2 outline-ring" : "border-border-strong",
            !hasMember && "bg-surface-muted",
          )}
        >
          <span aria-hidden className="font-display text-title font-semibold text-muted">
            {messages.currencySymbol}
          </span>
          <span
            className={cx(
              "min-w-0 flex-1 font-display text-title font-semibold tabular-nums",
              amount ? "text-foreground" : "text-border-strong",
            )}
          >
            {amount || "0.00"}
          </span>
          <span className="text-sm font-medium text-muted">{messages.currency}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">
          {messages.concept} <span className="font-normal text-muted">{messages.optional}</span>
        </span>
        <div
          className={cx(
            "flex h-11 w-full items-center rounded-md border border-border-strong px-3 text-base text-muted",
            !hasMember ? "bg-surface-muted" : "bg-surface",
          )}
        >
          {messages.conceptPlaceholder}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-medium text-foreground">{messages.useCashback}</span>
          <span className="text-sm text-muted">
            {!hasMember
              ? messages.cashbackNoMember
              : canUseCashback
                ? interpolate(messages.cashbackAvailable, { amount: formatMoney(formatter, cashbackBalanceCents) })
                : messages.cashbackUnavailable}
          </span>
        </div>
        <Switch checked={useCashback && canUseCashback} onCheckedChange={() => undefined} disabled={!canUseCashback} />
      </div>

      <dl className="flex flex-col gap-3 rounded-lg bg-surface-muted p-5">
        <SummaryRow label={messages.summary.amount} value={hasAmount ? formatMoney(formatter, breakdown.amountCents) : empty} />
        <SummaryRow
          label={
            member
              ? interpolate(messages.summary.discount, { tier: member.tierName, percent: benefits.discountPercent })
              : messages.summary.discountEmpty
          }
          value={hasAmount ? formatDiscount(formatter, breakdown.discountCents) : empty}
          tone="positive"
        />
        {breakdown.cashbackAppliedCents > 0 ? (
          <SummaryRow label={messages.summary.cashbackUsed} value={formatDiscount(formatter, breakdown.cashbackAppliedCents)} tone="positive" />
        ) : null}
        <div className="border-t border-border pt-3">
          <SummaryRow label={messages.summary.total} value={formatMoney(formatter, breakdown.totalCents)} tone="total" />
        </div>
        <SummaryRow label={messages.summary.pointsEarned} value={formatSignedPoints(formatter, breakdown.pointsEarned)} tone="positive" />
        <SummaryRow label={messages.summary.cashbackEarned} value={formatPositiveMoney(formatter, breakdown.cashbackEarnedCents)} tone="positive" />
      </dl>

      <div className="static flex flex-col gap-3">
        <Button ref={submitRef} size="xl" fullWidth disabled={!hasMember || !hasAmount}>
          {messages.submit}
        </Button>
      </div>
    </div>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  tone?: "normal" | "positive" | "total";
};

function SummaryRow({ label, value, tone = "normal" }: SummaryRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={cx("text-base", tone === "total" ? "font-medium text-foreground" : "text-muted")}>{label}</dt>
      <dd
        className={cx(
          "tabular-nums",
          tone === "total" && "font-display text-heading font-semibold text-foreground",
          tone === "positive" && "text-base font-medium text-success-text",
          tone === "normal" && "text-base text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
