import { CircleCheck, ScanLine } from "lucide-react";
import { MembershipCard } from "@/components/ui/MembershipCard";
import { MaskText } from "@/islands/scroll/MaskText";
import { ScrollIn, type ScrollPose } from "@/islands/scroll/ScrollIn";
import { demoBusinesses } from "@/data/demo";
import { cx } from "@/lib/cx";
import type { Messages } from "@/i18n";

type AudienceDeckProps = {
  messages: Messages;
};

const swatch = {
  bronze: "bg-tier-bronze",
  silver: "bg-tier-silver",
  gold: "bg-tier-gold",
  onyx: "bg-tier-onyx ring-1 ring-tier-onyx-edge",
} as const;

const cardClass = "flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg";
const stageClass = "relative flex h-48 items-center justify-center overflow-hidden border-b border-border p-6";

const poses: ScrollPose[] = [
  { rotateY: 58, x: -160, z: -280, scale: 0.9 },
  { rotateX: 46, y: 180, z: -320, scale: 0.88 },
  { rotateY: -58, x: 160, z: -280, scale: 0.9 },
];
const starts = [0, 0.1, 0.2];
const ends = [0.55, 0.65, 0.75];

export default function AudienceDeck({ messages }: AudienceDeckProps) {
  const ownerTiers = demoBusinesses[0]?.tiers ?? [];
  const audience = messages.audience;

  return (
    <div className="mx-auto flex max-w-page flex-col gap-14">
      <MaskText text={audience.title} as="h2" className="text-title max-w-2xl text-balance text-white" />
      <ul className="grid gap-6 md:grid-cols-3">
        <li>
          <ScrollIn from={poses[0] ?? {}} start={starts[0] ?? 0} end={ends[0] ?? 0.55}>
            <div className={cardClass}>
              <div className={cx(stageClass, "bg-surface-muted")} aria-hidden="true">
                <ul className="flex w-full max-w-60 flex-col gap-2">
                  {ownerTiers.map((tier) => (
                    <li key={tier.tier} className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 shadow-xs">
                      <span className={cx("size-6 shrink-0 rounded-xs", swatch[tier.tier])} />
                      <span className="flex-1 text-sm font-semibold">{messages.tiers[tier.tier]}</span>
                      <span className="text-sm font-semibold tabular-nums">{tier.discount} %</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2 p-6">
                <h3 className="text-subheading">{audience.owner.title}</h3>
                <p className="text-base text-muted">{audience.owner.body}</p>
              </div>
            </div>
          </ScrollIn>
        </li>
        <li>
          <ScrollIn from={poses[1] ?? {}} start={starts[1] ?? 0.1} end={ends[1] ?? 0.65}>
            <div className={cardClass}>
              <div className={cx(stageClass, "bg-ink-900")} aria-hidden="true">
                <div className="flex flex-col items-center gap-3">
                  <span className="grid size-16 place-items-center rounded-lg border border-accent-400 text-accent-400">
                    <ScanLine className="size-8" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-success-soft py-1.5 pr-3 pl-2 text-sm font-medium text-success-text">
                    <CircleCheck className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    {messages.hero.chipDetected}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 p-6">
                <h3 className="text-subheading">{audience.cashier.title}</h3>
                <p className="text-base text-muted">{audience.cashier.body}</p>
              </div>
            </div>
          </ScrollIn>
        </li>
        <li>
          <ScrollIn from={poses[2] ?? {}} start={starts[2] ?? 0.2} end={ends[2] ?? 0.75}>
            <div className={cardClass}>
              <div className={cx(stageClass, "bg-brand")} aria-hidden="true">
                <MembershipCard
                  size="sm"
                  tier="gold"
                  tierLabel={messages.tiers.gold}
                  businessName={messages.demo.businessName}
                  memberName={messages.demo.member}
                  code={messages.demo.code}
                  className="w-56 -rotate-3"
                />
              </div>
              <div className="flex flex-col gap-2 p-6">
                <h3 className="text-subheading">{audience.customer.title}</h3>
                <p className="text-base text-muted">{audience.customer.body}</p>
              </div>
            </div>
          </ScrollIn>
        </li>
      </ul>
    </div>
  );
}
