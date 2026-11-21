import { useRef, useState, type KeyboardEvent } from "react";
import { demoBusinesses, type DemoBusinessKey } from "@/data/demo";
import { cx } from "@/lib/cx";
import { formatMoney } from "@/lib/format";
import type { Locale, Messages } from "@/i18n";
import type { Tier } from "@/components/ui/MembershipCard";
import { TierBadge } from "@/components/ui/TierBadge";

type TenantShowcaseProps = {
  locale: Locale;
  business: Messages["business"];
  tiers: Messages["tiers"];
  exampleBusiness: string;
};

const tierSwatch: Record<Tier, string> = {
  bronze: "bg-tier-bronze",
  silver: "bg-tier-silver",
  gold: "bg-tier-gold",
  onyx: "bg-tier-onyx ring-1 ring-tier-onyx-edge",
};


function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}

export default function TenantShowcase({ locale, business, tiers, exampleBusiness }: TenantShowcaseProps) {
  const [active, setActive] = useState<DemoBusinessKey>("volcan");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = demoBusinesses.find((item) => item.key === active) ?? demoBusinesses[0];
  if (!current) return null;
  const currentLabels = business.businesses[current.key];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (offset === 0) return;
    event.preventDefault();
    const nextIndex = (index + offset + demoBusinesses.length) % demoBusinesses.length;
    const next = demoBusinesses[nextIndex];
    if (!next) return;
    setActive(next.key);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label={business.tabsLabel} className="flex flex-wrap gap-2">
        {demoBusinesses.map((item, index) => (
          <button
            key={item.key}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`tenant-tab-${item.key}`}
            aria-selected={item.key === active}
            aria-controls="tenant-panel"
            tabIndex={item.key === active ? 0 : -1}
            onClick={() => setActive(item.key)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cx(
              "h-11 rounded-full border px-5 text-sm font-semibold transition-[transform,background-color,color] duration-150 ease-out active:scale-97",
              item.key === active
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-border-strong bg-surface text-foreground hover:bg-surface-muted",
            )}
          >
            {business.businesses[item.key].name}
          </button>
        ))}
      </div>

      <div
        id="tenant-panel"
        role="tabpanel"
        aria-labelledby={`tenant-tab-${current.key}`}
        data-tenant={current.key}
        className="rounded-xl border border-border bg-surface shadow-lg"
      >
        <div key={current.key} className="flex flex-col transition-[opacity,translate] duration-200 ease-out starting:translate-y-1 starting:opacity-0">
          <div className="flex items-center gap-4 border-b border-border p-4 sm:p-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-md bg-primary font-display text-base font-bold text-primary-foreground">
              {current.initials}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-display text-subheading font-semibold">{currentLabels.name}</span>
              <span className="text-sm text-muted">{currentLabels.kind}</span>
            </div>
            <span className="ml-auto hidden rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-text sm:inline">
              {exampleBusiness}
            </span>
          </div>

          <div className="grid gap-0 lg:grid-cols-2">
            <div className="flex flex-col gap-3 p-4 sm:p-5">
              <h3 className="text-base font-semibold">{business.customers}</h3>
              <ul className="flex flex-col divide-y divide-border">
                {current.customers.map((customer) => (
                  <li key={customer.code} className="flex items-center gap-3 py-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary-text">
                      {initials(customer.name)}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-base font-medium">{customer.name}</span>
                      <span className="font-mono text-xs text-muted tabular-nums">{customer.code}</span>
                    </div>
                    <TierBadge tier={customer.tier} label={tiers[customer.tier]} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 border-t border-border p-4 sm:p-5 lg:border-t-0 lg:border-l">
              <h3 className="text-base font-semibold">{business.tiers}</h3>
              <p aria-hidden="true" className="flex items-end gap-3 px-3 text-xs text-muted">
                <span className="size-10 shrink-0" />
                <span className="flex-1" />
                <span className="w-14 text-right sm:w-20">{business.discount}</span>
                <span className="w-14 text-right sm:w-20">{business.pointsPer}</span>
                <span className="w-14 text-right sm:w-20">{business.cashback}</span>
              </p>
              <ul className="flex flex-col gap-3">
                {current.tiers.map((tier) => (
                  <li key={tier.tier} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span className={cx("size-10 shrink-0 rounded-sm", tierSwatch[tier.tier])} aria-hidden="true" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-base font-semibold">{tiers[tier.tier]}</span>
                      <span className="text-sm text-muted tabular-nums">{formatMoney(locale, tier.price)}</span>
                    </div>
                    <dl className="contents text-sm font-semibold tabular-nums">
                      <dt className="sr-only">{business.discount}</dt>
                      <dd className="w-14 text-right sm:w-20">{tier.discount} %</dd>
                      <dt className="sr-only">{business.pointsPer}</dt>
                      <dd className="w-14 text-right sm:w-20">{tier.pointsPerTen}</dd>
                      <dt className="sr-only">{business.cashback}</dt>
                      <dd className="w-14 text-right sm:w-20">{tier.cashback} %</dd>
                    </dl>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
