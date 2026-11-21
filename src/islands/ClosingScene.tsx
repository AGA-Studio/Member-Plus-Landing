import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { MembershipCard } from "@/components/ui/MembershipCard";
import { clamp, smooth } from "@/lib/track";
import type { Messages } from "@/i18n";

type ClosingSceneProps = {
  messages: Messages;
  loginUrl: string;
  accessHref: string;
};

function WordRise({ word, progress, start, span }: { word: string; progress: MotionValue<number>; start: number; span: number }) {
  const y = useTransform(progress, (value) => `${(1 - smooth((value - start) / span)) * 125}%`);
  const visibility = useTransform(progress, (value) => (value < start ? "hidden" : "visible"));
  return (
    <motion.span style={{ y, visibility }} className="inline-block">
      {word}
    </motion.span>
  );
}

function Words({
  text,
  as: Tag = "p",
  progress,
  from,
  to,
  className,
}: {
  text: string;
  as?: "h2" | "p";
  progress: MotionValue<number>;
  from: number;
  to: number;
  className: string;
}) {
  const words = text.split(" ");
  const span = (to - from) * 0.55;
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span key={`${word}-${index}`}>
            <span className="-my-1 inline-block overflow-hidden py-1 align-bottom">
              <WordRise word={word} progress={progress} start={from + ((to - from - span) * index) / Math.max(1, words.length - 1)} span={span} />
            </span>
            {index < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </Tag>
  );
}

function Magnetic({ children }: { children: ReactNode }) {
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const scale = useSpring(useMotionValue(1), { stiffness: 260, damping: 20 });
  return (
    <div
      className="-m-6 p-6"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - (rect.left + rect.width / 2)) * 0.22);
        y.set((event.clientY - (rect.top + rect.height / 2)) * 0.3);
        scale.set(1.04);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
        scale.set(1);
      }}
    >
      <motion.div style={{ x, y, scale }}>{children}</motion.div>
    </div>
  );
}

export default function ClosingScene({ messages, loginUrl, accessHref }: ClosingSceneProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [live, setLive] = useState(false);
  const entering = useScroll({ target: trackRef, offset: ["start end", "start start"] }).scrollYProgress;
  const pinned = useScroll({ target: trackRef, offset: ["start start", "end end"] }).scrollYProgress;
  const progress = useTransform([entering, pinned], ([enter = 0, pin = 0]: number[]) => enter * 0.16 + pin * 0.84);

  useEffect(() => {
    setLive(!reduced);
  }, [reduced]);

  useEffect(() => {
    return progress.on("change", (value) => {
      const track = trackRef.current;
      if (!track) return;
      if (value > 0.2) track.dataset.tone = "dark";
      else delete track.dataset.tone;
    });
  }, [progress]);

  const pointerX = useSpring(useMotionValue(0), { stiffness: 120, damping: 16 });
  const pointerY = useSpring(useMotionValue(0), { stiffness: 120, damping: 16 });

  const clipDark = useTransform(progress, (value) => `circle(${smooth(value / 0.42) * 160}% at 50% 62%)`);
  const clipBrand = useTransform(progress, (value) => `circle(${smooth((value - 0.6) / 0.32) * 170}% at 50% 108%)`);
  const cardEntry = useTransform(progress, (value) => 1 - smooth(value / 0.36));
  const cardY = useTransform(cardEntry, (value) => value * 220);
  const cardScale = useTransform(cardEntry, (value) => 1 - value * 0.4);
  const entryRotateY = useTransform(cardEntry, (value) => value * -80);
  const entryRotateX = useTransform(cardEntry, (value) => value * 42);
  const cardRotateY = useTransform([pointerX, entryRotateY], ([pointer = 0, entry = 0]: number[]) => pointer * 14 + entry);
  const cardRotateX = useTransform([pointerY, entryRotateX], ([pointer = 0, entry = 0]: number[]) => pointer * -12 + entry);
  const glowX = useTransform(pointerX, (value) => value * 90);
  const glowY = useTransform(pointerY, (value) => value * 60);
  const buttonsY = useTransform(progress, (value) => `${(1 - smooth((value - 0.5) / 0.14)) * 140}%`);
  const buttonsVisibility = useTransform(progress, (value) => (value < 0.5 ? "hidden" : "visible"));

  const closing = messages.closing;

  return (
    <div ref={trackRef} data-scroll-track="closing" className="relative">
      <div aria-hidden="true" className="pointer-events-none motion-reduce:hidden">
        <div className="h-dvh" />
        <div className="h-dvh" />
        <div className="h-dvh" />
      </div>
      <div className="absolute inset-0 motion-reduce:relative">
        <div
          className="sticky top-0 flex h-dvh flex-col overflow-hidden bg-background"
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            pointerX.set(clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1));
            pointerY.set(clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1));
          }}
        >
          <motion.div aria-hidden="true" style={live ? { clipPath: clipDark } : {}} className="absolute inset-0 bg-ink-950" />
          <motion.div aria-hidden="true" style={live ? { clipPath: clipBrand } : {}} className="absolute inset-0 bg-brand" />

          <div className="relative z-10 mx-auto flex w-full max-w-page flex-1 flex-col items-center justify-center gap-10 px-4 pt-20 text-center sm:px-6 lg:flex-row lg:justify-between lg:gap-16 lg:px-8 lg:text-left">
            <div className="flex flex-col items-center gap-5 lg:items-start">
              {live ? (
                <Words
                  text={closing.title}
                  as="h2"
                  progress={progress}
                  from={0.28}
                  to={0.52}
                  className="text-display max-w-xl font-display font-bold tracking-display text-balance text-white"
                />
              ) : (
                <h2 className="text-display max-w-xl text-balance text-white">{closing.title}</h2>
              )}
              {live ? (
                <Words text={closing.body} progress={progress} from={0.42} to={0.62} className="max-w-md text-lg text-ink-200" />
              ) : (
                <p className="max-w-md text-lg text-ink-200">{closing.body}</p>
              )}
              <div className="-mx-6 -mb-8 overflow-hidden px-6 pt-2 pb-8">
                <motion.div
                  style={live ? { y: buttonsY, visibility: buttonsVisibility } : {}}
                  className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
                >
                  <Magnetic>
                    <a
                      href={loginUrl}
                      className="inline-flex h-13 items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-semibold whitespace-nowrap text-primary-foreground shadow-sm transition-[transform,background-color] duration-150 ease-out hover:bg-primary-hover active:scale-97 active:bg-primary-active"
                    >
                      {messages.common.login}
                    </a>
                  </Magnetic>
                  <Magnetic>
                    <a
                      href={accessHref}
                      className="inline-flex h-13 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 text-base font-semibold whitespace-nowrap text-white backdrop-blur-md transition-[transform,background-color] duration-150 ease-out hover:bg-white/20 active:scale-97"
                    >
                      {messages.common.requestAccess}
                    </a>
                  </Magnetic>
                </motion.div>
              </div>
            </div>

            <motion.div
              aria-hidden="true"
              style={live ? { y: cardY, scale: cardScale, rotateY: cardRotateY, rotateX: cardRotateX, transformPerspective: 1400 } : {}}
              className="relative w-64 shrink-0 sm:w-80 lg:w-md"
            >
              <MembershipCard
                tier="gold"
                tierLabel={messages.tiers.gold}
                businessName={messages.demo.businessName}
                memberName={messages.demo.member}
                code={messages.demo.code}
                className="shadow-lg"
              />
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-card">
                <motion.div style={{ x: glowX, y: glowY }} className="absolute -inset-1/2 bg-radial from-white/55 via-white/10 to-transparent" />
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-page flex-col px-4 pb-8 sm:px-6 lg:px-8">
            {live ? (
              <>
                <Words text={closing.giantOne} as="p" progress={progress} from={0.72} to={0.88} className="font-display text-giant font-bold tracking-display text-white" />
                <Words text={closing.giantTwo} as="p" progress={progress} from={0.8} to={0.96} className="font-display text-giant font-bold tracking-display text-white" />
              </>
            ) : (
              <>
                <p className="font-display text-giant font-bold tracking-display text-white">{closing.giantOne}</p>
                <p className="font-display text-giant font-bold tracking-display text-white">{closing.giantTwo}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
