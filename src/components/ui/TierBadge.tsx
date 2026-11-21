import { cx } from "@/lib/cx";
import type { Tier } from "@/components/ui/MembershipCard";

const dotClasses: Record<Tier, string> = {
  bronze: "bg-tier-bronze",
  silver: "bg-tier-silver ring-1 ring-border-strong",
  gold: "bg-tier-gold",
  onyx: "bg-tier-onyx ring-1 ring-tier-onyx-edge",
};

type TierBadgeProps = {
  tier: Tier;
  label: string;
  size?: "sm" | "md";
  className?: string | undefined;
};

export function TierBadge({ tier, label, size = "sm", className }: TierBadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex w-fit shrink-0 items-center rounded-full border border-border bg-surface font-semibold text-foreground",
        size === "sm" ? "gap-1.5 px-2.5 py-0.5 text-xs" : "gap-2 px-3 py-1 text-sm",
        className,
      )}
    >
      <span aria-hidden="true" className={cx("rounded-full", size === "sm" ? "size-2.5" : "size-3", dotClasses[tier])} />
      {label}
    </span>
  );
}
