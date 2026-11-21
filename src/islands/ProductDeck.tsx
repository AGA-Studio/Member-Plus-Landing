import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { clamp } from "@/lib/track";
import type { Locale, Messages } from "@/i18n";

type ProductDeckProps = {
  locale: Locale;
  screens: Messages["screens"];
};

const names = ["panel", "customers", "file", "tiers", "movements", "receipt", "card"] as const;
type ScreenName = (typeof names)[number];

const imageWidth = 2560;
const imageHeight = 1600;

function screenSrc(name: ScreenName, locale: Locale): string {
  return `/screens/${name}-${locale}.webp`;
}

function MonitorShot({ name, locale, eager }: { name: ScreenName; locale: Locale; eager: boolean }) {
  return (
    <div className="pointer-events-none rounded-xl bg-linear-to-b from-ink-300 to-ink-500 p-0.5 shadow-lg select-none">
      <div className="rounded-xl bg-ink-950 p-2">
        <div className="relative overflow-hidden rounded-md">
          <img
            src={screenSrc(name, locale)}
            alt=""
            width={imageWidth}
            height={imageHeight}
            decoding="async"
            loading={eager ? "eager" : "lazy"}
            draggable={false}
            className="block aspect-16/10 w-full bg-ink-900"
          />
        </div>
      </div>
    </div>
  );
}

function DeckMonitor({ name, index, count, locale, progress }: { name: ScreenName; index: number; count: number; locale: Locale; progress: MotionValue<number> }) {
  const pose = useTransform(progress, (value) => {
    const r = value * count - index;
    const waiting = clamp(-r, 0, 4);
    const away = clamp(r, 0, 1.7);
    const eased = away < 1 ? away * away * (3 - 2 * away) : away;
    return {
      y: -waiting * 5.5 - eased * 64,
      z: -waiting * 190 - eased * 640,
      rotateX: eased * 30,
      scale: 1 - eased * 0.06,
    };
  });
  const y = useTransform(pose, (value) => `${value.y}%`);
  const z = useTransform(pose, (value) => value.z);
  const rotateX = useTransform(pose, (value) => value.rotateX);
  const scale = useTransform(pose, (value) => value.scale);

  return (
    <motion.div style={{ y, z, rotateX, scale }} className="pointer-events-none absolute inset-0 select-none">
      <MonitorShot name={name} locale={locale} eager={index < 2} />
    </motion.div>
  );
}

function DeckLabel({ title, body, index, count, progress }: { title: string; body: string; index: number; count: number; progress: MotionValue<number> }) {
  const start = index / count;
  const end = (index + 1) / count;
  const first = index === 0;
  const last = index === count - 1;
  const enterFrom = first ? -0.08 : start;
  const enterTo = first ? -0.04 : start + 0.03;
  const leaveFrom = last ? 1.1 : end - 0.03;
  const leaveTo = last ? 1.2 : end;
  const titleY = useTransform(progress, [enterFrom, enterTo, leaveFrom, leaveTo], ["112%", "0%", "0%", "-112%"]);
  const bodyY = useTransform(progress, [enterFrom + 0.012, enterTo + 0.012, leaveFrom - 0.012, leaveTo - 0.012], ["112%", "0%", "0%", "-112%"]);
  return (
    <div aria-hidden="true" className="col-start-1 row-start-1 flex flex-col gap-3">
      <span className="block overflow-hidden pb-1">
        <motion.h3 style={{ y: titleY }} className="text-title text-white">
          {title}
        </motion.h3>
      </span>
      <span className="block overflow-hidden">
        <motion.p style={{ y: bodyY }} className="max-w-sm text-lg text-brand-200">
          {body}
        </motion.p>
      </span>
    </div>
  );
}

export default function ProductDeck({ locale, screens }: ProductDeckProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const count = names.length;
  const sway = useTransform(scrollYProgress, [0, 1], [-14, 10]);
  const lift = useTransform(scrollYProgress, [0, 0.12, 1], [8, 0, -4]);
  const progress = useTransform(scrollYProgress, (value) => clamp(value / 0.96));

  return (
    <>
      <div ref={trackRef} data-scroll-track="screens" className="relative motion-reduce:hidden">
        <div aria-hidden="true" className="pointer-events-none">
          <div className="h-dvh" />
          <div className="h-dvh" />
          <div className="h-dvh" />
          <div className="h-dvh" />
        </div>
        <div className="absolute inset-0">
          <div className="sticky top-0 h-dvh overflow-hidden">
            <div className="relative mx-auto flex h-full max-w-page flex-col px-4 pt-24 pb-16 sm:px-6 lg:grid lg:grid-cols-5 lg:items-center lg:gap-8 lg:px-8 lg:pt-20 lg:pb-0">
              <div className="relative z-10 order-2 mt-auto flex flex-col gap-6 lg:order-1 lg:col-span-2 lg:mt-0">
                <h2 className="text-title max-w-sm text-balance text-white">{screens.title}</h2>
                <div className="grid">
                  {names.map((name, index) => (
                    <DeckLabel
                      key={name}
                      title={screens.items[name]}
                      body={screens.descriptions[name]}
                      index={index}
                      count={count}
                      progress={progress}
                    />
                  ))}
                </div>
              </div>
              <div className="relative order-1 flex min-h-0 flex-1 items-center justify-center lg:order-2 lg:col-span-3 lg:flex-none">
                <div className="perspective-stage pointer-events-none relative w-full select-none">
                  <motion.div
                    style={{ rotateY: reduced ? 0 : sway, rotateX: reduced ? 0 : lift }}
                    className="relative aspect-16/10 w-full transform-3d"
                  >
                    {names.map((name, index) => (
                      <DeckMonitor key={name} name={name} index={index} count={count} locale={locale} progress={progress} />
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
            <ol className="sr-only" aria-label={screens.title}>
              {names.map((name) => (
                <li key={name}>
                  {screens.items[name]}. {screens.descriptions[name]}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="hidden px-4 py-16 sm:px-6 lg:px-8 motion-reduce:block">
        <h2 className="text-title mx-auto mb-12 max-w-page text-white">{screens.title}</h2>
        <ul className="mx-auto grid max-w-page gap-12 md:grid-cols-2">
          {names.map((name) => (
            <li key={name} className="flex flex-col gap-3">
              <MonitorShot name={name} locale={locale} eager={false} />
              <h3 className="text-heading text-white">{screens.items[name]}</h3>
              <p className="text-base text-brand-200">{screens.descriptions[name]}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
