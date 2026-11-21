import { Check } from "lucide-react";
import { MaskText } from "@/islands/scroll/MaskText";
import { ScrollIn } from "@/islands/scroll/ScrollIn";
import { createPlaceholderPlans } from "@/data/plans";
import { cx } from "@/lib/cx";
import type { Messages } from "@/i18n";

type PlansGridProps = {
  messages: Messages;
};

export default function PlansGrid({ messages }: PlansGridProps) {
  const plans = createPlaceholderPlans(messages.plans.placeholder);

  return (
    <div className="mx-auto flex max-w-page flex-col gap-12">
      <div className="flex flex-col gap-4">
        <MaskText text={messages.plans.title} as="h2" className="text-title max-w-2xl text-balance" />
        <MaskText text={messages.plans.lead} as="p" className="max-w-xl text-lg text-muted" />
      </div>
      <ul className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <li key={index}>
            <ScrollIn from={{ rotateX: 40, y: 150, z: -220, scale: 0.92 }} start={index * 0.08} end={0.6 + index * 0.08}>
              <div
                className={cx(
                  "relative flex flex-col gap-6 rounded-xl border bg-surface/70 p-6 shadow-sm backdrop-blur-md sm:p-8",
                  plan.featured ? "border-primary shadow-md" : "border-border",
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-text">
                    {messages.plans.placeholder.featured}
                  </span>
                )}
                <div className="flex flex-col gap-2">
                  <h3 className="text-heading">{plan.name}</h3>
                  <p className="text-base text-muted">{plan.description}</p>
                </div>
                <p className="flex items-baseline gap-2">
                  <span className="font-display text-display font-bold tabular-nums">{plan.price}</span>
                  <span className="text-base text-muted">{plan.period}</span>
                </p>
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-base">
                      <Check className="size-5 shrink-0 text-success-text" strokeWidth={1.75} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="#closing"
                  className="mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-5 text-sm font-semibold whitespace-nowrap text-foreground transition-[transform,background-color,color] duration-150 ease-out hover:bg-surface-muted active:scale-97 active:bg-surface-muted"
                >
                  {plan.cta}
                </a>
              </div>
            </ScrollIn>
          </li>
        ))}
      </ul>
    </div>
  );
}
