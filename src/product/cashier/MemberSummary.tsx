import { CalendarCheck, CreditCard, Star, Wallet } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { MembershipCard } from "../ui/MembershipCard";
import { formatDate, formatMoney, formatPoints, interpolate, type Formatter } from "../lib/format";
import type { Member } from "../lib/domain";
import type { Messages } from "@/i18n";

type MemberSummaryProps = {
  member: Member;
  businessName: string;
  formatter: Formatter;
  messages: Messages["product"]["cashier"]["purchase"]["member"];
};

const statusTones = {
  active: "success",
  expired: "warning",
  cancelled: "danger",
} as const;

export function MemberSummary({ member, businessName, formatter, messages }: MemberSummaryProps) {
  const validUntil = formatDate(formatter, member.validUntil, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  const stats = [
    { icon: Star, label: messages.points, value: formatPoints(formatter, member.points) },
    { icon: Wallet, label: messages.cashback, value: formatMoney(formatter, member.cashbackBalanceCents) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <MembershipCard
        tier={member.tier}
        tierLabel={member.tierName}
        businessName={businessName}
        memberName={member.fullName}
        code={member.code}
      />
      <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar name={member.fullName} className="hidden size-14 text-base" />
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-heading text-foreground">{member.fullName}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={member.tier}>{member.tierName}</Badge>
              <Badge tone={statusTones[member.status]}>{messages.status[member.status]}</Badge>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <CalendarCheck aria-hidden strokeWidth={1.75} className="size-4" />
              {interpolate(messages.validUntil, { date: validUntil })}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-5">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-sm text-muted">
                <Icon aria-hidden strokeWidth={1.75} className="size-4" />
                {label}
              </dt>
              <dd className="font-display text-lg font-semibold text-foreground tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export function MemberSummaryPlaceholder({ messages }: { messages: Messages["product"]["cashier"]["purchase"]["member"] }) {
  const emptyValue = "—";
  const stats = [
    { icon: Star, label: messages.points },
    { icon: Wallet, label: messages.cashback },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div
        aria-hidden
        className="flex aspect-card flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-strong bg-surface-muted text-muted"
      >
        <CreditCard strokeWidth={1.5} className="size-10" />
        <span className="text-base font-medium">{messages.emptyCard}</span>
      </div>
      <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span aria-hidden className="hidden size-14 shrink-0 rounded-full bg-surface-muted" />
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-heading text-muted">{messages.emptyTitle}</h2>
            <p className="text-sm text-muted">{messages.emptyDescription}</p>
            <div aria-hidden className="flex flex-wrap items-center gap-2">
              <span className="h-6 w-16 rounded-full bg-surface-muted" />
              <span className="h-6 w-20 rounded-full bg-surface-muted" />
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-5">
          {stats.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-sm text-muted">
                <Icon aria-hidden strokeWidth={1.75} className="size-4" />
                {label}
              </dt>
              <dd className="font-display text-lg font-semibold text-muted tabular-nums">{emptyValue}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
