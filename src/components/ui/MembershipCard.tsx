import { useMemo } from "react";
import { cx } from "@/lib/cx";
import { buildQrShape } from "@/lib/qr";

export type Tier = "bronze" | "silver" | "gold" | "onyx";

const tierClasses: Record<Tier, string> = {
  bronze: "bg-tier-bronze text-tier-bronze-foreground",
  silver: "bg-tier-silver text-tier-silver-foreground",
  gold: "bg-tier-gold text-tier-gold-foreground",
  onyx: "bg-tier-onyx text-tier-onyx-foreground ring-1 ring-tier-onyx-edge",
};

type MembershipCardProps = {
  tier: Tier;
  tierLabel: string;
  businessName: string;
  memberName: string;
  code: string;
  size?: "md" | "sm";
  hideDetails?: boolean;
  className?: string | undefined;
};

export function QrMark({ seed, className }: { seed: string; className?: string }) {
  const shape = useMemo(() => buildQrShape(seed), [seed]);
  return (
    <svg
      viewBox={`0 0 ${shape.size} ${shape.size}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      <path d={shape.path} fill="currentColor" />
    </svg>
  );
}

export function MembershipCard({
  tier,
  tierLabel,
  businessName,
  memberName,
  code,
  size = "md",
  hideDetails = false,
  className,
}: MembershipCardProps) {
  const compact = size === "sm";
  return (
    <div
      className={cx(
        "relative flex aspect-card flex-col justify-between overflow-hidden rounded-card shadow-lg",
        compact ? "p-3" : "p-5 sm:p-6",
        tierClasses[tier],
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-transparent"
      />
      <div className={cx("relative flex items-start justify-between gap-3", hideDetails && "invisible")}>
        <span className={cx("font-display font-semibold", compact ? "text-sm" : "text-lg")}>
          {businessName}
        </span>
        <span
          className={cx(
            "rounded-full border border-current text-xs font-semibold",
            compact ? "px-2 py-0.5" : "px-3 py-1",
          )}
        >
          {tierLabel}
        </span>
      </div>
      <div className={cx("relative flex items-end justify-between gap-3", hideDetails && "invisible")}>
        <div className="flex min-w-0 flex-col gap-1">
          <span className={cx("truncate font-medium", compact ? "text-xs" : "text-base")}>
            {memberName}
          </span>
          <span className={cx("font-mono tabular-nums", compact ? "text-xs" : "text-sm")}>{code}</span>
        </div>
        <div
          className={cx(
            "shrink-0 rounded-md bg-white text-ink-900",
            compact ? "p-1.5" : "p-2",
          )}
        >
          <QrMark seed={code} className={compact ? "size-10" : "size-14"} />
        </div>
      </div>
    </div>
  );
}
