import { useEffect, useMemo, useRef, useState } from "react";
import { motion, motionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { CashierScreen, type CashierView } from "@/product/cashier/CashierScreen";
import { MembershipCard } from "@/product/ui/MembershipCard";
import { ScaledScreen, screenHeight, screenWidth } from "@/product/ScaledScreen";
import { createMember, createReceipt } from "@/product/data";
import { track } from "@/lib/track";
import type { Locale, Messages } from "@/i18n";

type CashierStoryProps = {
  locale: Locale;
  messages: Messages;
};

type Anchors = {
  scan: { x: number; y: number };
  submit: { x: number; y: number };
  amount: { x: number; y: number };
};

const stepKeys = ["card", "scan", "recognize", "charge", "receipt"] as const;
const stepStarts = [0, 0.16, 0.38, 0.56, 0.8];
const desktopQuery = "(min-width: 1024px)";

const defaultAnchors: Anchors = {
  scan: { x: 424, y: 155 },
  submit: { x: 945, y: 809 },
  amount: { x: 945, y: 272 },
};

function offsetWithin(root: HTMLElement, element: HTMLElement): { x: number; y: number } {
  let x = element.offsetWidth / 2;
  let y = element.offsetHeight / 2;
  let current: HTMLElement | null = element;
  while (current && current !== root) {
    x += current.offsetLeft;
    y += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

function viewAt(progress: number, member: ReturnType<typeof createMember>): CashierView {
  const typed = progress >= 0.685 ? "1000" : progress >= 0.65 ? "100" : progress >= 0.615 ? "10" : progress >= 0.58 ? "1" : "";
  const found = progress >= 0.37;
  return {
    member: progress >= 0.405 ? member : null,
    dialogOpen: progress >= 0.235 && progress < 0.405,
    scanFound: found,
    scanCode: found ? member.code : "",
    amount: typed,
    amountFocused: progress >= 0.565 && progress < 0.76,
  };
}

function sameView(a: CashierView, b: CashierView): boolean {
  return (
    a.member === b.member &&
    a.dialogOpen === b.dialogOpen &&
    a.scanFound === b.scanFound &&
    a.scanCode === b.scanCode &&
    a.amount === b.amount &&
    a.amountFocused === b.amountFocused
  );
}

function StepText({
  title,
  body,
  start,
  end,
  first,
  last,
  progress,
}: {
  title: string;
  body: string;
  start: number;
  end: number;
  first: boolean;
  last: boolean;
  progress: MotionValue<number>;
}) {
  const enterFrom = first ? -0.08 : start;
  const enterTo = first ? -0.04 : start + 0.03;
  const leaveFrom = last ? 1.1 : end - 0.03;
  const leaveTo = last ? 1.2 : end;
  const titleY = useTransform(progress, [enterFrom, enterTo, leaveFrom, leaveTo], ["112%", "0%", "0%", "-112%"]);
  const bodyY = useTransform(progress, [enterFrom + 0.012, enterTo + 0.012, leaveFrom - 0.012, leaveTo - 0.012], ["112%", "0%", "0%", "-112%"]);

  return (
    <div aria-hidden="true" className="col-start-1 row-start-1 flex flex-col gap-3">
      <span className="block overflow-hidden pb-1">
        <motion.h3 style={{ y: titleY }} className="text-display text-balance text-tier-onyx-foreground">
          {title}
        </motion.h3>
      </span>
      <span className="block overflow-hidden">
        <motion.p style={{ y: bodyY }} className="max-w-sm text-lg text-ink-300">
          {body}
        </motion.p>
      </span>
    </div>
  );
}

function RailBar({ progress, start, end }: { progress: MotionValue<number>; start: number; end: number }) {
  const fill = useTransform(progress, [start, end], [0, 1]);
  return (
    <span className="h-1 w-10 overflow-hidden rounded-full bg-ink-700">
      <motion.span style={{ scaleX: fill }} className="block h-full origin-left bg-white" />
    </span>
  );
}

function GoldCardFace({ messages, className }: { messages: Messages; className?: string | undefined }) {
  return (
    <MembershipCard
      tier="gold"
      tierLabel={messages.tiers.gold}
      businessName={messages.demo.businessName}
      memberName={messages.demo.member}
      code={messages.demo.code}
      className={className}
    />
  );
}

function StaticStory({ locale, messages, steps }: { locale: Locale; messages: Messages; steps: Array<{ title: string; body: string }> }) {
  const member = useMemo(() => createMember(messages.tiers.gold), [messages.tiers.gold]);
  const receipt = useMemo(() => createReceipt(messages.tiers.gold, messages.product.concept), [messages]);
  const views: CashierView[] = [
    { member: null, dialogOpen: false, scanFound: false, scanCode: "", amount: "", amountFocused: false },
    { member: null, dialogOpen: true, scanFound: true, scanCode: member.code, amount: "", amountFocused: false },
    { member, dialogOpen: false, scanFound: false, scanCode: "", amount: "", amountFocused: false },
    { member, dialogOpen: false, scanFound: false, scanCode: "", amount: "1000", amountFocused: true },
    { member, dialogOpen: false, scanFound: false, scanCode: "", amount: "1000", amountFocused: false },
  ];

  return (
    <ol className="mx-auto hidden max-w-page grid-cols-1 gap-16 px-4 py-16 sm:px-6 lg:px-8 motion-reduce:grid">
      {steps.map((step, index) => (
        <li key={step.title} className="flex flex-col gap-4">
          <h3 className="text-heading text-tier-onyx-foreground">{step.title}</h3>
          <p className="max-w-xl text-base text-ink-300">{step.body}</p>
          <div className="pointer-events-none overflow-hidden rounded-xl border border-ink-700 bg-ink-900 p-1.5 shadow-lg select-none">
            <ScaledScreen className="rounded-lg">
              <StaticScreen
                locale={locale}
                messages={messages}
                view={views[index] ?? views[0]!}
                receipt={receipt}
                receiptVisible={index === 4}
              />
            </ScaledScreen>
          </div>
        </li>
      ))}
    </ol>
  );
}

function StaticScreen({
  locale,
  messages,
  view,
  receipt,
  receiptVisible,
}: {
  locale: Locale;
  messages: Messages;
  view: CashierView;
  receipt: ReturnType<typeof createReceipt>;
  receiptVisible: boolean;
}) {
  const still = useRef({
    scanOffset: motionValue(0),
    cursor: motionValue(-100),
    scale: motionValue(1),
    toast: motionValue(-200),
  }).current;
  const receiptY = useMemo(() => motionValue(receiptVisible ? "0%" : "101%"), [receiptVisible]);

  return (
    <CashierScreen
      view={view}
      receipt={receipt}
      formatter={{ locale }}
      messages={messages.product}
      businessName={messages.demo.businessName}
      businessInitials="CV"
      scanOffset={still.scanOffset}
      receiptY={receiptY}
      toastY={still.toast}
      cursorX={still.cursor}
      cursorY={still.cursor}
      cursorScale={still.scale}
      feed={null}
      scanButtonRef={null}
      submitRef={null}
      amountRef={null}
      rootRef={null}
    />
  );
}

export default function CashierStory({ locale, messages }: CashierStoryProps) {
  const steps = stepKeys.map((key) => messages.how.steps[key]);
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLButtonElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const amountRef = useRef<HTMLDivElement>(null);
  const anchors = useRef<Anchors>(defaultAnchors);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const progress = scrollYProgress;

  const member = useMemo(() => createMember(messages.tiers.gold), [messages.tiers.gold]);
  const receipt = useMemo(() => createReceipt(messages.tiers.gold, messages.product.concept), [messages]);
  const [view, setView] = useState<CashierView>(() => viewAt(0, member));
  const monitorWidth = useRef(motionValue(760)).current;
  const spread = useRef(motionValue(1)).current;

  useEffect(() => {
    const query = window.matchMedia(desktopQuery);
    const update = () => {
      spread.set(query.matches ? 1 : 0);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [spread]);

  useEffect(() => {
    const measure = () => {
      const root = rootRef.current;
      if (!root) return;
      const next = { ...anchors.current };
      if (scanRef.current) next.scan = offsetWithin(root, scanRef.current);
      if (submitRef.current) next.submit = offsetWithin(root, submitRef.current);
      if (amountRef.current) next.amount = offsetWithin(root, amountRef.current);
      anchors.current = next;
    };
    measure();
    const timer = window.setTimeout(measure, 700);
    return () => window.clearTimeout(timer);
  }, []);

  useMotionValueEvent(progress, "change", (value) => {
    const next = viewAt(value, member);
    setView((current) => (sameView(current, next) ? current : next));
  });

  const camera = useTransform([progress, monitorWidth, spread], ([p = 0, width = 760, wide = 1]: number[]) => {
    const zoom = wide > 0.5 ? 0.8 : 1.5;
    const scale = track(p, [[0, 0.78], [0.12, 0.95], [0.24, 1.04], [0.4, 1.06], [0.56, 1.42 * zoom], [0.7, 1.5 * zoom], [0.82, 1.12], [1, 1.16]]);
    const focusX = wide > 0.5
      ? track(p, [[0, 0.5], [0.24, 0.5], [0.4, 0.4], [0.56, 0.58], [0.7, 0.58], [0.82, 0.5], [1, 0.5]])
      : track(p, [[0, 0.5], [0.24, 0.5], [0.4, 0.34], [0.56, 0.7], [0.7, 0.7], [0.82, 0.5], [1, 0.5]]);
    const focusY = track(p, [[0, 0.5], [0.4, 0.5], [0.56, 0.5], [0.7, 0.56], [0.82, 0.5], [1, 0.5]]);
    const height = width * (screenHeight / screenWidth);
    return {
      scale,
      x: (0.5 - focusX) * width * scale * 0.9,
      y: (0.5 - focusY) * height * scale * 0.9 + track(p, [[0, 70], [0.12, 0]]),
      rotateY: track(p, [[0, -26], [0.12, -12], [0.24, -6], [0.4, -3], [0.56, 3], [0.7, 3], [0.82, -8], [1, -12]]),
      rotateX: track(p, [[0, 8], [0.12, 4], [0.24, 2], [0.4, 1], [0.56, 0], [0.82, 3], [1, 5]]),
    };
  });

  const monitorScale = useTransform(camera, (value) => value.scale);
  const monitorX = useTransform(camera, (value) => value.x);
  const monitorY = useTransform(camera, (value) => value.y);
  const monitorRotateY = useTransform(camera, (value) => value.rotateY);
  const monitorRotateX = useTransform(camera, (value) => value.rotateX);
  const glareX = useTransform(monitorRotateY, [-30, 10], [-120, 320]);

  const cardPose = useTransform([progress, monitorWidth, spread], ([p = 0, width = 760, wide = 1]: number[]) => {
    const side = wide > 0.5 ? 1 : 0.55;
    return {
      x: track(p, [[0, 0.7], [0.1, -0.34], [0.24, -0.36], [0.38, -0.3], [0.46, -0.6], [0.8, -0.6], [1, -0.52]]) * width * side,
      y: track(p, [[0, 0.5], [0.1, 0.34], [0.24, 0.3], [0.38, 0.3], [0.46, 0.5], [0.8, 0.5], [1, 0.42]]) * width * (wide > 0.5 ? 1 : 0.8),
      z: track(p, [[0, 260], [0.1, 120], [0.24, 150], [0.38, 110], [0.46, 20], [1, 20]]),
      rotateY: track(p, [[0, -150], [0.1, -26], [0.24, -14], [0.38, -8], [0.46, -28], [0.8, -28], [1, -20]]),
      rotateX: track(p, [[0, 26], [0.1, 10], [0.24, 8], [0.38, 6], [0.46, 12], [1, 8]]),
      rotateZ: track(p, [[0, 22], [0.1, -4], [0.24, -3], [0.38, 0], [0.46, -6], [1, -4]]),
      scale: track(p, [[0, 0.4], [0.1, 0.78], [0.24, 0.78], [0.38, 0.8], [0.46, 0.46], [0.8, 0.46], [1, 0.58]]) * (width / 760),
    };
  });
  const cardX = useTransform(cardPose, (value) => value.x);
  const cardY = useTransform(cardPose, (value) => value.y);
  const cardZ = useTransform(cardPose, (value) => value.z);
  const cardRotateY = useTransform(cardPose, (value) => value.rotateY);
  const cardRotateX = useTransform(cardPose, (value) => value.rotateX);
  const cardRotateZ = useTransform(cardPose, (value) => value.rotateZ);
  const cardScale = useTransform(cardPose, (value) => value.scale);
  const sheen = useTransform(cardRotateY, [-150, 0], [380, -120]);

  const scanOffset = useTransform(progress, [0.26, 0.37], [-72, 72]);
  const receiptY = useTransform(progress, [0.8, 0.9], ["101%", "0%"]);
  const toastY = useTransform(progress, [0.88, 0.93], [-140, 0]);
  const cursorPose = useTransform(progress, (p) => {
    const a = anchors.current;
    return {
      x: track(p, [[0, 1180], [0.16, 1180], [0.22, a.scan.x], [0.25, a.scan.x], [0.32, 980], [0.46, 980], [0.55, a.amount.x], [0.74, a.amount.x], [0.78, a.submit.x], [1, a.submit.x]]),
      y: track(p, [[0, 860], [0.16, 860], [0.22, a.scan.y], [0.25, a.scan.y], [0.32, 560], [0.46, 560], [0.55, a.amount.y], [0.74, a.amount.y], [0.78, a.submit.y], [1, a.submit.y]]),
      press: track(p, [[0.235, 1], [0.245, 0.82], [0.26, 1], [0.545, 1], [0.555, 0.82], [0.57, 1], [0.78, 1], [0.79, 0.82], [0.805, 1]]),
    };
  });
  const cursorX = useTransform(cursorPose, (value) => value.x);
  const cursorY = useTransform(cursorPose, (value) => value.y);
  const cursorScale = useTransform(cursorPose, (value) => value.press);

  const feedPose = useTransform(progress, (p) => ({
    y: track(p, [[0.24, 110], [0.3, 6], [0.37, 0]]),
    scale: track(p, [[0.24, 0.5], [0.3, 0.74], [0.37, 0.76]]),
    rotate: track(p, [[0.24, 14], [0.3, -3], [0.37, 0]]),
  }));
  const feedY = useTransform(feedPose, (value) => value.y);
  const feedScale = useTransform(feedPose, (value) => value.scale);
  const feedRotate = useTransform(feedPose, (value) => value.rotate);

  const feed = (
    <motion.div style={{ y: feedY, scale: feedScale, rotate: feedRotate }} className="absolute w-105 opacity-95">
      <GoldCardFace messages={messages} />
    </motion.div>
  );

  return (
    <>
      <div ref={trackRef} data-scroll-track="how" className="relative motion-reduce:hidden">
        <div aria-hidden="true" className="pointer-events-none">
          <div className="h-dvh" />
          <div className="h-dvh" />
          <div className="h-dvh" />
        </div>
        <div className="absolute inset-0">
          <div className="sticky top-0 h-dvh overflow-hidden">
            <div className="relative mx-auto flex h-full max-w-page flex-col px-4 pt-24 pb-16 sm:px-6 lg:grid lg:grid-cols-5 lg:items-center lg:gap-8 lg:px-8 lg:pt-20 lg:pb-0">
              <div className="relative z-10 order-2 mt-auto grid lg:order-1 lg:col-span-2 lg:mt-0">
                {steps.map((step, index) => (
                  <StepText
                    key={step.title}
                    title={step.title}
                    body={step.body}
                    start={stepStarts[index] ?? 0}
                    end={stepStarts[index + 1] ?? 1.2}
                    first={index === 0}
                    last={index === steps.length - 1}
                    progress={progress}
                  />
                ))}
              </div>
              <div className="relative order-1 flex min-h-0 flex-1 items-center justify-center overflow-hidden lg:order-2 lg:col-span-3 lg:-mr-12 lg:flex-none lg:overflow-visible">
                <div className="relative w-full">
                  <motion.div style={{ transformPerspective: 1800 }} className="pointer-events-none relative w-full select-none">
                    <motion.div
                      style={{ x: monitorX, y: monitorY, scale: monitorScale, rotateY: monitorRotateY, rotateX: monitorRotateX }}
                      className="pointer-events-none relative w-full transform-3d select-none"
                    >
                      <div className="relative transform-3d rounded-xl bg-linear-to-b from-ink-400 to-ink-600 p-px shadow-lg">
                        <div className="absolute inset-0 -translate-z-6 rounded-xl bg-ink-800" aria-hidden="true" />
                        <div className="rounded-xl bg-ink-950 p-2">
                          <div className="relative overflow-hidden rounded-md">
                            <ScaledScreen width={monitorWidth}>
                              <CashierScreen
                                view={view}
                                receipt={receipt}
                                formatter={{ locale }}
                                messages={messages.product}
                                businessName={messages.demo.businessName}
                                businessInitials="CV"
                                scanOffset={scanOffset}
                                receiptY={receiptY}
                                toastY={toastY}
                                cursorX={cursorX}
                                cursorY={cursorY}
                                cursorScale={cursorScale}
                                feed={feed}
                                scanButtonRef={scanRef}
                                submitRef={submitRef}
                                amountRef={amountRef}
                                rootRef={rootRef}
                              />
                            </ScaledScreen>
                            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                              <motion.div
                                style={{ x: glareX }}
                                className="absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div aria-hidden="true" className="mx-auto h-12 w-24 bg-linear-to-b from-ink-600 to-ink-800 max-lg:hidden" />
                      <div aria-hidden="true" className="mx-auto h-3 w-1/3 rounded-full bg-linear-to-b from-ink-500 to-ink-700 shadow-lg max-lg:hidden" />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    aria-hidden="true"
                    style={{ x: cardX, y: cardY, z: cardZ, rotateX: cardRotateX, rotateY: cardRotateY, rotateZ: cardRotateZ, scale: cardScale, transformPerspective: 1800 }}
                    className="pointer-events-none absolute top-0 left-1/2 -ml-52.5 w-105 transform-3d"
                  >
                    <div className="relative backface-hidden">
                      <GoldCardFace messages={messages} className="shadow-lg" />
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-card">
                        <motion.div
                          style={{ x: sheen }}
                          className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent"
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 flex rotate-y-180 items-center justify-center rounded-card bg-tier-gold ring-1 ring-tier-gold-solid backface-hidden">
                      <img src="/brand/icon-on-light.webp" alt="" width={320} height={269} className="w-1/5" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
            <div aria-hidden="true" className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 lg:right-8 lg:left-auto lg:translate-x-0">
              {steps.map((step, index) => (
                <RailBar key={step.title} progress={progress} start={stepStarts[index] ?? 0} end={stepStarts[index + 1] ?? 1} />
              ))}
            </div>
            <ol className="sr-only" aria-label={messages.how.stepsLabel}>
              {steps.map((step) => (
                <li key={step.title}>
                  {step.title}. {step.body}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <StaticStory locale={locale} messages={messages} steps={steps} />
    </>
  );
}
