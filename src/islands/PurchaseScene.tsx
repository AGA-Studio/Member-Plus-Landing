import PurchaseExample from "@/islands/PurchaseExample";
import { MaskText } from "@/islands/scroll/MaskText";
import { ScrollIn } from "@/islands/scroll/ScrollIn";
import type { Locale, Messages } from "@/i18n";

type PurchaseSceneProps = {
  locale: Locale;
  purchase: Messages["purchase"];
  exampleBadge: string;
};

export default function PurchaseScene({ locale, purchase, exampleBadge }: PurchaseSceneProps) {
  return (
    <div className="mx-auto grid max-w-page items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-5">
        <MaskText text={purchase.title} as="h2" className="text-title max-w-xl text-balance" />
        <MaskText text={purchase.lead} as="p" className="max-w-xl text-lg text-muted" />
      </div>
      <ScrollIn from={{ rotateX: 42, y: 140, z: -260, scale: 0.9 }} end={0.7}>
        <PurchaseExample locale={locale} purchase={purchase} exampleBadge={exampleBadge} />
      </ScrollIn>
    </div>
  );
}
