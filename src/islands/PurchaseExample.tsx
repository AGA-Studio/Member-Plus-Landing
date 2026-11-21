import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { formatMoney, formatNumber } from "@/lib/format";
import { interpolate, type Locale, type Messages } from "@/i18n";

type PurchaseExampleProps = {
  locale: Locale;
  purchase: Messages["purchase"];
  exampleBadge: string;
};

const purchaseAmount = 1000;
const discountAmount = 150;
const totalAmount = 850;
const pointsAmount = 85;
const cashbackAmount = 25.5;

function countAt(progress: number, start: number, target: number): number {
  const local = Math.min(1, Math.max(0, (progress - start) / 0.6));
  return target * (1 - (1 - local) ** 3);
}

export default function PurchaseExample({ locale, purchase, exampleBadge }: PurchaseExampleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const [progress, setProgress] = useState(1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.4"] });

  useEffect(() => {
    if (!reducedMotion) setProgress(scrollYProgress.get());
  }, [reducedMotion, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!reducedMotion) setProgress(value);
  });

  const purchaseValue = countAt(progress, 0, purchaseAmount);
  const discountValue = countAt(progress, 0.1, discountAmount);
  const totalValue = countAt(progress, 0.2, totalAmount);
  const pointsValue = countAt(progress, 0.3, pointsAmount);
  const cashbackValue = countAt(progress, 0.4, cashbackAmount);

  const money = (amount: number) => formatMoney(locale, amount);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface/70 p-5 shadow-md backdrop-blur-md sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted">
          {interpolate(purchase.scenario, { amount: formatMoney(locale, purchaseAmount) })}
        </p>
        <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning-text">
          {exampleBadge}
        </span>
      </div>

      <dl className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-base text-muted">{purchase.purchase}</dt>
          <dd className="font-display text-subheading font-semibold tabular-nums">{money(Math.round(purchaseValue))}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-base text-muted">{purchase.discount}</dt>
          <dd className="font-display text-subheading font-semibold tabular-nums">-{money(Math.round(discountValue))}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-b-lg bg-primary-soft px-4 py-4">
          <dt className="text-base font-medium text-primary-text">{purchase.subtotal}</dt>
          <dd className="font-display text-heading font-bold tabular-nums">{money(Math.round(totalValue))}</dd>
        </div>
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
          <span className="text-sm text-muted">{purchase.points}</span>
          <span className="font-display text-display font-bold tabular-nums">
            {formatNumber(locale, Math.round(pointsValue))}
          </span>
          <span className="text-sm text-muted">{purchase.pointsRule}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
          <span className="text-sm text-muted">{purchase.cashback}</span>
          <span className="font-display text-display font-bold tabular-nums">{money(Math.round(cashbackValue * 100) / 100)}</span>
          <span className="text-sm text-muted">{purchase.cashbackRule}</span>
        </div>
      </div>
    </div>
  );
}
