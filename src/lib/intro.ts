const root = document.documentElement;

const riseMilliseconds = 600;
const riseStaggerMilliseconds = 70;
const riseStartMilliseconds = 100;
const holdMilliseconds = 160;
const flightMilliseconds = 680;
const flightStaggerMilliseconds = 30;
const holeMilliseconds = 560;
const holeLeadMilliseconds = 100;
const extrasLeadMilliseconds = 100;
const skipSpeed = 5;
const skipScale = 0.35;
const skipEvents = ["keydown", "pointerdown", "wheel", "touchstart"] as const;

type Reveal = { selector: string; from: Keyframe; to: Keyframe; delay: number; duration: number; children?: boolean };

const reveals: Reveal[] = [
  {
    selector: '[data-reveal="header"]',
    from: { transform: "translateY(-24px) scale(0.92)", clipPath: "inset(0 50% 0 50% round 999px)" },
    to: { transform: "none", clipPath: "inset(-24px -24px -48px -24px round 999px)" },
    delay: 0,
    duration: 600,
  },
  {
    selector: '[data-reveal="aura"]',
    from: { transform: "scale(0.3)" },
    to: { transform: "none" },
    delay: 80,
    duration: 900,
  },
  {
    selector: '[data-reveal="card"]',
    from: { transform: "perspective(1400px) translateY(80px) rotateY(-70deg) rotateX(18deg) scale(0.7)" },
    to: { transform: "none" },
    delay: 80,
    duration: 900,
  },
  {
    selector: '[data-reveal="subtitle"]',
    from: { transform: "translateY(40%)", clipPath: "inset(0 0 100% 0)" },
    to: { transform: "none", clipPath: "inset(-8px 0 -8px 0)" },
    delay: 200,
    duration: 600,
  },
  {
    selector: '[data-reveal="cta"]',
    from: {
      transform: "perspective(800px) translateY(30px) rotateX(-80deg) scale(0.9)",
      transformOrigin: "50% 100%",
    },
    to: { transform: "none", transformOrigin: "50% 100%" },
    delay: 300,
    duration: 600,
    children: true,
  },
  {
    selector: '[data-reveal="chip"]',
    from: { transform: "perspective(600px) translateY(16px) rotateX(-70deg) scale(0.4)", clipPath: "circle(0% at 50% 50%)" },
    to: { transform: "none", clipPath: "circle(150% at 50% 50%)" },
    delay: 440,
    duration: 600,
  },
];

const chipStaggerMilliseconds = 70;
const ctaStaggerMilliseconds = 80;

function readEasing(name: string, fallback: string): string {
  const value = getComputedStyle(root).getPropertyValue(name).trim();
  return value || fallback;
}

function farthestCorner(x: number, y: number): number {
  return Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
}

async function runIntro(): Promise<void> {
  const overlay = document.getElementById("mp-intro");
  const words = overlay ? [...overlay.querySelectorAll<HTMLElement>("[data-intro-word]")] : [];
  const heroWords = [...document.querySelectorAll<HTMLElement>("[data-hero-word]")];
  if (!overlay || words.length === 0 || words.length !== heroWords.length) {
    root.removeAttribute("data-intro");
    return;
  }

  let skipped = false;
  const animations: Animation[] = [];
  const wakers = new Set<() => void>();

  const finish = () => {
    skipEvents.forEach((name) => window.removeEventListener(name, skip));
    root.removeAttribute("data-intro");
    overlay.remove();
    animations.forEach((animation) => animation.cancel());
  };

  function skip() {
    if (skipped) return;
    skipped = true;
    animations.forEach((animation) => animation.updatePlaybackRate(skipSpeed));
    wakers.forEach((wake) => wake());
  }

  const factor = () => (skipped ? skipScale : 1);

  const play = (element: Element, keyframes: Keyframe[] | PropertyIndexedKeyframes, options: KeyframeAnimationOptions) => {
    const animation = element.animate(keyframes, options);
    animations.push(animation);
    return animation;
  };

  const settled = (list: Animation[]) =>
    new Promise<void>((resolve) => {
      let done = false;
      const complete = () => {
        if (done) return;
        done = true;
        wakers.delete(complete);
        resolve();
      };
      wakers.add(complete);
      void Promise.all(list.map((animation) => animation.finished.catch(() => undefined))).then(complete);
    });

  const sleep = (milliseconds: number) =>
    new Promise<void>((resolve) => {
      const complete = () => {
        window.clearTimeout(timer);
        wakers.delete(complete);
        resolve();
      };
      const timer = window.setTimeout(complete, skipped ? milliseconds * skipScale : milliseconds);
      if (!skipped) wakers.add(complete);
    });

  skipEvents.forEach((name) => window.addEventListener(name, skip, { passive: true }));

  try {
    const easeOut = readEasing("--ease-out", "ease-out");
    const easeInOut = readEasing("--ease-in-out", "ease-in-out");

    await Promise.race([document.fonts.ready, sleep(500)]);

    const rises = words.map((word, index) =>
      play(
        word,
        [
          { transform: "translateY(115%) rotate(5deg)", transformOrigin: "0% 100%" },
          { transform: "translateY(0%) rotate(0deg)", transformOrigin: "0% 100%" },
        ],
        { duration: riseMilliseconds, delay: riseStartMilliseconds + index * riseStaggerMilliseconds, easing: easeOut, fill: "both" },
      ),
    );
    await settled(rises);
    await sleep(holdMilliseconds);

    overlay.querySelectorAll<HTMLElement>("[data-intro-mask]").forEach((mask) => {
      mask.style.overflow = "visible";
    });

    words.forEach((word, index) => {
      const heroWord = heroWords[index];
      if (!heroWord) return;
      const from = word.getBoundingClientRect();
      const to = heroWord.getBoundingClientRect();
      const fromSize = parseFloat(getComputedStyle(word).fontSize);
      const toSize = parseFloat(getComputedStyle(heroWord).fontSize);
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      return play(
        word,
        [
          { transform: "translate(0px, 0px) scale(1)", transformOrigin: "50% 50%" },
          { transform: `translate(${dx}px, ${dy}px) scale(${toSize / fromSize})`, transformOrigin: "50% 50%" },
        ],
        { duration: flightMilliseconds * factor(), delay: index * flightStaggerMilliseconds * factor(), easing: easeInOut, fill: "forwards" },
      );
    });
    await sleep(Math.max(0, flightMilliseconds + (words.length - 1) * flightStaggerMilliseconds - holeLeadMilliseconds));

    const rects = heroWords.map((word) => word.getBoundingClientRect());
    const left = Math.min(...rects.map((rect) => rect.left));
    const right = Math.max(...rects.map((rect) => rect.right));
    const top = Math.min(...rects.map((rect) => rect.top));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    const originX = (left + right) / 2;
    const originY = (top + bottom) / 2;
    overlay.style.setProperty("--veil-x", `${originX}px`);
    overlay.style.setProperty("--veil-y", `${originY}px`);
    overlay.setAttribute("data-hole", "");
    const hole = play(overlay, { "--veil-r": ["0px", `${farthestCorner(originX, originY) + 8}px`] }, {
      duration: holeMilliseconds * factor(),
      easing: easeOut,
      fill: "forwards",
    });

    await sleep(extrasLeadMilliseconds);

    const extras: Animation[] = [];
    for (const reveal of reveals) {
      const elements = [...document.querySelectorAll<HTMLElement>(reveal.selector)].flatMap((element) =>
        reveal.children ? [...element.children] : [element],
      );
      elements.forEach((element, index) => {
        const stagger = reveal.selector.includes("chip")
          ? index * chipStaggerMilliseconds
          : reveal.children
            ? index * ctaStaggerMilliseconds
            : 0;
        extras.push(
          play(
            element,
            [{ ...reveal.from, visibility: "hidden" }, { ...reveal.to, visibility: "visible" }],
            { duration: reveal.duration * factor(), delay: (reveal.delay + stagger) * factor(), easing: easeOut, fill: "both" },
          ),
        );
      });
    }

    await settled([hole, ...extras]);
  } finally {
    finish();
  }
}

if (root.hasAttribute("data-intro")) void runIntro();

export {};
