import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { CircleCheck, ScanLine, Star } from "lucide-react";
import { MembershipCard } from "@/components/ui/MembershipCard";

type HeroSceneProps = {
  children: ReactNode;
  cardLabel: string;
  tierLabel: string;
  businessName: string;
  memberName: string;
  code: string;
  chipDetected: string;
  chipRegistered: string;
  chipPoints: string;
};

type Metrics = {
  maxScroll: number;
  viewportWidth: number;
  viewportHeight: number;
  cardCenterX: number;
  cardCenterY: number;
  cardWidth: number;
  cardHeight: number;
};

const springConfig = { stiffness: 120, damping: 14, mass: 0.6 };
const growEnd = 0.58;
const cardRadius = 20;

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function easeInOut(value: number): number {
  return value < 0.5 ? 4 * value * value * value : 1 - (-2 * value + 2) ** 3 / 2;
}

function mix(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

const chipClasses =
  "flex items-center gap-2 rounded-md border border-border bg-surface/70 py-2 pr-4 pl-2 text-sm font-medium shadow-md backdrop-blur-md transition-[opacity,translate] duration-300 ease-out starting:translate-y-2 starting:opacity-0";

export default function HeroScene({ children, ...props }: HeroSceneProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const metrics = useRef<Metrics>({
    maxScroll: 1,
    viewportWidth: 1,
    viewportHeight: 1,
    cardCenterX: 0,
    cardCenterY: 0,
    cardWidth: 1,
    cardHeight: 1,
  });

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, springConfig);
  const y = useSpring(pointerY, springConfig);
  const { scrollY } = useScroll();

  const progress = useTransform(scrollY, (value) => (reducedMotion ? 0 : clamp(value / metrics.current.maxScroll)));
  const grow = useTransform(progress, (value) => easeInOut(clamp(value / growEnd)));
  const expand = useTransform(progress, (value) => easeInOut(clamp((value - growEnd) / (1 - growEnd))));

  const scale = useTransform(grow, (value) => {
    const data = metrics.current;
    const target = Math.max(data.viewportWidth / data.cardWidth, data.viewportHeight / data.cardHeight) * 0.78;
    return mix(1, Math.max(1.6, target), value);
  });
  const shiftX = useTransform(grow, (value) => (metrics.current.viewportWidth / 2 - metrics.current.cardCenterX) * value);
  const shiftY = useTransform(grow, (value) => (metrics.current.viewportHeight / 2 - metrics.current.cardCenterY) * value);
  const spin = useTransform([x, grow], ([pointer = 0, amount = 0]: number[]) => pointer * 8 * (1 - amount) - 180 * amount);
  const tilt = useTransform([y, grow], ([pointer = 0, amount = 0]: number[]) => pointer * -8 * (1 - amount) + 6 * Math.sin(amount * Math.PI));

  const clip = useTransform([grow, expand], ([growValue = 0, value = 0]: number[]) => {
    if (growValue < 0.999) return "inset(50% 50% 50% 50% round 0px)";
    const data = metrics.current;
    const target = Math.max(data.viewportWidth / data.cardWidth, data.viewportHeight / data.cardHeight) * 0.78;
    const finalScale = Math.max(1.6, target);
    const width = data.cardWidth * finalScale;
    const height = data.cardHeight * finalScale;
    const insetX = Math.max(0, (data.viewportWidth - width) / 2) * (1 - value);
    const insetY = Math.max(0, (data.viewportHeight - height) / 2) * (1 - value);
    const radius = cardRadius * finalScale * (1 - value);
    return `inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px round ${radius}px)`;
  });

  const chipOneX = useTransform([x, grow], ([pointer = 0, amount = 0]: number[]) => pointer * 20 - amount * 220);
  const chipTwoX = useTransform([x, grow], ([pointer = 0, amount = 0]: number[]) => pointer * -12 + amount * 220);
  const chipOneY = useTransform([y, grow], ([pointer = 0, amount = 0]: number[]) => pointer * 14 - amount * 160);
  const chipTwoY = useTransform([y, grow], ([pointer = 0, amount = 0]: number[]) => pointer * -10 - amount * 60);
  const chipThreeY = useTransform([y, grow], ([pointer = 0, amount = 0]: number[]) => pointer * -10 + amount * 180);
  const textShift = useTransform(grow, (value) => value * -metrics.current.viewportHeight * 0.6);
  const auraX = useTransform(x, (value) => value * -28);

  useEffect(() => {
    return expand.on("change", (value) => {
      const track = trackRef.current;
      if (!track) return;
      if (value > 0.6) track.dataset.tone = "dark";
      else delete track.dataset.tone;
    });
  }, [expand]);

  useEffect(() => {
    const measure = () => {
      const card = cardRef.current;
      const track = trackRef.current;
      if (!card || !track) return;
      const data = metrics.current;
      data.viewportWidth = window.innerWidth;
      data.viewportHeight = window.innerHeight;
      data.maxScroll = Math.max(1, track.offsetHeight - window.innerHeight);
      const rect = card.getBoundingClientRect();
      const offset = window.scrollY;
      data.cardWidth = card.offsetWidth;
      data.cardHeight = card.offsetHeight;
      data.cardCenterX = rect.left + rect.width / 2;
      data.cardCenterY = rect.top + rect.height / 2 + offset;
    };

    measure();
    window.addEventListener("resize", measure);
    const settle = window.setTimeout(measure, 600);
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(settle);
    };
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches || reducedMotion) return;

    const onMove = (event: PointerEvent) => {
      pointerX.set(clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1));
      pointerY.set(clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointerX, pointerY, reducedMotion]);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (finePointer.matches || reducedMotion) return;
    return scrollY.on("change", (value) => {
      pointerX.set(clamp(value / 300 - 0.5, -1, 1));
      pointerY.set(clamp(value / 600 - 0.3, -1, 1));
    });
  }, [scrollY, pointerX, pointerY, reducedMotion]);

  return (
    <div ref={trackRef} className="relative">
      <div aria-hidden="true" className="pointer-events-none motion-reduce:hidden">
        <div className="h-dvh" />
        <div className="h-dvh" />
        <div className="h-dvh" />
      </div>
      <div className="absolute inset-0 motion-reduce:relative">
        <div className="sticky top-0 isolate flex min-h-svh items-center overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-full max-w-page items-center gap-14 lg:grid-cols-2 lg:gap-12">
            <motion.div style={{ y: textShift }} className="flex flex-col gap-6">
              {children}
            </motion.div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
              <motion.div
                aria-hidden="true"
                style={{ x: auraX }}
                className="pointer-events-none absolute inset-0 -z-10"
              >
                <div data-reveal="aura" className="absolute inset-x-0 top-1/2 mx-auto size-80 -translate-y-1/2 bg-brand opacity-70 mask-radial-from-30% mask-radial-to-70% sm:size-128" />
                <div data-reveal="aura" className="absolute -top-10 -right-8 size-48 bg-accent-400 opacity-50 mask-radial-from-20% mask-radial-to-70%" />
              </motion.div>

              <div data-reveal="card" className="relative z-30 transition-[opacity,scale] delay-100 duration-500 ease-out starting:scale-95 starting:opacity-0">
                <motion.div
                  ref={cardRef}
                  role="img"
                  aria-label={props.cardLabel}
                  style={{ x: shiftX, y: shiftY, scale, rotateY: spin, rotateX: tilt, transformPerspective: 1400 }}
                  className="relative aspect-card w-full transform-3d will-change-transform"
                >
                  <div className="absolute inset-0 backface-hidden">
                    <MembershipCard
                      tier="onyx"
                      tierLabel={props.tierLabel}
                      businessName={props.businessName}
                      memberName={props.memberName}
                      code={props.code}
                      className="size-full"
                    />
                  </div>
                  <div className="absolute inset-0 flex rotate-y-180 items-center justify-center rounded-card bg-ink-950 ring-1 ring-tier-onyx-edge backface-hidden">
                    <img src="/brand/icon-on-dark.webp" alt="" width={320} height={265} className="w-1/5" />
                  </div>
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-card">
                    <div className="h-full w-1/4 animate-card-scan bg-linear-to-r from-transparent via-white/40 to-transparent" />
                  </div>
                </motion.div>
              </div>

              <motion.div style={{ x: chipOneX, y: chipOneY }} className="absolute -top-8 left-4 z-30 sm:-top-6 sm:-left-6">
                <div data-reveal="chip" className={`${chipClasses} delay-450`}>
                  <span className="grid size-8 place-items-center rounded-sm bg-primary-soft text-primary-text">
                    <ScanLine className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  {props.chipDetected}
                </div>
              </motion.div>

              <motion.div style={{ x: chipTwoX, y: chipTwoY }} className="absolute top-2/5 right-0 z-30 sm:top-1/2 sm:-right-10">
                <div data-reveal="chip" className={`${chipClasses} delay-500`}>
                  <span className="grid size-8 place-items-center rounded-sm bg-success-soft text-success-text">
                    <CircleCheck className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  {props.chipRegistered}
                </div>
              </motion.div>

              <motion.div style={{ x: chipOneX, y: chipThreeY }} className="absolute -bottom-6 left-1/4 z-30 sm:-bottom-7">
                <div data-reveal="chip" className={`${chipClasses} delay-550`}>
                  <span className="grid size-8 place-items-center rounded-sm bg-warning-soft text-warning-text">
                    <Star className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="font-display font-semibold tabular-nums">{props.chipPoints}</span>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            aria-hidden="true"
            style={{ clipPath: clip }}
            className="pointer-events-none absolute inset-0 z-40 bg-ink-950 motion-reduce:hidden"
          />
        </div>
      </div>
    </div>
  );
}
