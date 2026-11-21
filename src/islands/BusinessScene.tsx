import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import TenantShowcase from "@/islands/TenantShowcase";
import { MembershipCard } from "@/components/ui/MembershipCard";
import { MaskText } from "@/islands/scroll/MaskText";
import { ScrollIn } from "@/islands/scroll/ScrollIn";
import { tierShowcase } from "@/data/demo";
import { smooth } from "@/lib/track";
import type { Locale, Messages } from "@/i18n";

type BusinessSceneProps = {
  locale: Locale;
  messages: Messages;
};

function FanCard({
  index,
  count,
  stacked,
  progress,
  children,
}: {
  index: number;
  count: number;
  stacked: boolean;
  progress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion() ?? false;
  const gather = useTransform(progress, (value) => (reduced ? 0 : 1 - smooth((value - index * 0.04) / 0.62)));
  const centre = (count - 1) / 2 - index;
  const x = useTransform(gather, (value) => (stacked ? `${centre * 100 * value}%` : "0%"));
  const y = useTransform(gather, (value) => value * (stacked ? 36 : 120));
  const z = useTransform(gather, (value) => -value * (stacked ? 60 + Math.abs(centre) * 50 : 260));
  const rotateY = useTransform(gather, (value) => value * (stacked ? -centre * 16 : (index % 2 === 0 ? 40 : -40)));
  const rotateZ = useTransform(gather, (value) => value * (stacked ? centre * 3 : 0));
  return (
    <motion.li style={{ x, y, z, rotateY, rotateZ, zIndex: count - Math.round(Math.abs(centre)) }} className="will-change-transform">
      {children}
    </motion.li>
  );
}

function TierFan({ messages }: { messages: Messages }) {
  const ref = useRef<HTMLUListElement>(null);
  const [stacked, setStacked] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setStacked(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <motion.ul
      ref={ref}
      style={{ transformPerspective: 1600 }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      {tierShowcase.map((item, index) => (
        <FanCard key={item.tier} index={index} count={tierShowcase.length} stacked={stacked} progress={scrollYProgress}>
          <MembershipCard
            tier={item.tier}
            tierLabel={messages.tiers[item.tier]}
            businessName={item.business}
            memberName={item.member}
            code={item.code}
          />
        </FanCard>
      ))}
    </motion.ul>
  );
}

export default function BusinessScene({ locale, messages }: BusinessSceneProps) {
  return (
    <div className="mx-auto flex max-w-page flex-col gap-28">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <MaskText text={messages.business.title} as="h2" className="text-title max-w-2xl text-balance" />
          <MaskText text={messages.business.lead} as="p" className="max-w-xl text-lg text-muted" />
        </div>
        <ScrollIn from={{ rotateX: 32, y: 140, z: -240, scale: 0.9 }} end={0.7}>
          <TenantShowcase
            locale={locale}
            business={messages.business}
            tiers={messages.tiers}
            exampleBusiness={messages.common.exampleBusiness}
          />
        </ScrollIn>
      </div>

      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <MaskText text={messages.business.tiersTitle} as="h2" className="text-title max-w-2xl text-balance" />
          <MaskText text={messages.business.tiersLead} as="p" className="max-w-xl text-lg text-muted" />
        </div>
        <TierFan messages={messages} />
      </div>
    </div>
  );
}
