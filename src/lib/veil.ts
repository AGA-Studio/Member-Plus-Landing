type NavigationKind = "page" | "lang" | "exit";

type ScrollSnapshot = { key: string; fraction: number };

const root = document.documentElement;
const veil = document.getElementById("mp-veil");
const veilLogo = veil?.querySelector<HTMLElement>("[data-veil-logo]") ?? null;

const coverMilliseconds = { page: 380, exit: 380, lang: 280 } as const;
const flightMilliseconds = 420;
const holeMilliseconds = 520;
const curtainMilliseconds = 320;
const holdMilliseconds = 60;
const failSafeMilliseconds = 5000;

let busy = false;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readEasing(name: string, fallback: string): string {
  const value = getComputedStyle(root).getPropertyValue(name).trim();
  return value || fallback;
}

function farthestCorner(x: number, y: number): number {
  return Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
}

function settled(animation: Animation): Promise<void> {
  return animation.finished.then(
    () => undefined,
    () => undefined,
  );
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function sections(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>("main > section[id], footer")];
}

function sectionKey(element: HTMLElement): string {
  return element.id || element.tagName.toLowerCase();
}

function saveScroll(): void {
  const scrollY = window.scrollY;
  for (const element of sections()) {
    const top = element.getBoundingClientRect().top + scrollY;
    const height = element.offsetHeight;
    if (scrollY < top - 1 || scrollY >= top + height) continue;
    const span = Math.max(1, height - window.innerHeight);
    const snapshot: ScrollSnapshot = { key: sectionKey(element), fraction: Math.min(1, Math.max(0, (scrollY - top) / span)) };
    try {
      window.sessionStorage.setItem("mp-scroll", JSON.stringify(snapshot));
    } catch {
      return;
    }
    return;
  }
}

function restoreScroll(): void {
  let snapshot: ScrollSnapshot | null = null;
  try {
    const raw = window.sessionStorage.getItem("mp-scroll");
    snapshot = raw ? (JSON.parse(raw) as ScrollSnapshot) : null;
  } catch {
    snapshot = null;
  }
  if (!snapshot) return;
  const element = sections().find((candidate) => sectionKey(candidate) === snapshot?.key);
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY;
  const span = Math.max(1, element.offsetHeight - window.innerHeight);
  window.scrollTo(0, top + snapshot.fraction * span);
}

function resetVeil(): void {
  busy = false;
  root.removeAttribute("data-veil");
  if (!veil) return;
  veil.removeAttribute("data-active");
  veil.removeAttribute("data-hole");
  veil.style.removeProperty("--veil-x");
  veil.style.removeProperty("--veil-y");
  veil.getAnimations().forEach((animation) => animation.cancel());
  veilLogo?.getAnimations().forEach((animation) => animation.cancel());
}

async function playCover(kind: NavigationKind, x: number, y: number): Promise<void> {
  if (!veil || !veilLogo) return;
  const easeInOut = readEasing("--ease-in-out", "ease-in-out");
  const easeOut = readEasing("--ease-out", "ease-out");
  const duration = coverMilliseconds[kind];

  veil.setAttribute("data-active", "");
  const cover =
    kind === "lang"
      ? veil.animate([{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration, easing: easeInOut, fill: "both" })
      : veil.animate(
          [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${farthestCorner(x, y)}px at ${x}px ${y}px)` }],
          { duration, easing: easeInOut, fill: "both" },
        );
  if (kind !== "lang") {
    veilLogo.animate([{ transform: "scale(0.8)" }, { transform: "scale(1)" }], {
      duration,
      delay: 60,
      easing: easeOut,
      fill: "both",
    });
  }
  await settled(cover);
  if (kind !== "lang") await wait(holdMilliseconds);
}

async function navigate(kind: NavigationKind, href: string, x: number, y: number): Promise<void> {
  if (busy) return;
  busy = true;
  try {
    if (kind === "lang") saveScroll();
    if (kind !== "exit") window.sessionStorage.setItem("mp-nav", kind);
  } catch {
    busy = true;
  }
  await playCover(kind, x, y);
  window.location.assign(href);
  window.setTimeout(resetVeil, failSafeMilliseconds);
}

function findTarget(): HTMLElement | null {
  const candidates = [...document.querySelectorAll<HTMLElement>("[data-entry-target]")];
  return candidates.find((candidate) => candidate.getBoundingClientRect().width > 0) ?? null;
}

async function revealPage(): Promise<void> {
  if (!veil || !veilLogo) return;
  const easeInOut = readEasing("--ease-in-out", "ease-in-out");
  const easeOut = readEasing("--ease-out", "ease-out");
  const logoRect = veilLogo.getBoundingClientRect();
  const logoX = logoRect.left + logoRect.width / 2;
  const logoY = logoRect.top + logoRect.height / 2;
  const target = findTarget();
  const targetRect = target?.getBoundingClientRect();
  const originX = targetRect ? targetRect.left + targetRect.width / 2 : logoX;
  const originY = targetRect ? targetRect.top + targetRect.height / 2 : logoY;
  const scale = targetRect ? targetRect.width / logoRect.width : 1;

  const flight = veilLogo.animate(
    [
      { transform: "translate(0px, 0px) scale(1)" },
      { transform: `translate(${originX - logoX}px, ${originY - logoY}px) scale(${scale})` },
    ],
    { duration: flightMilliseconds, easing: easeInOut, fill: "forwards" },
  );
  await settled(flight);

  veil.style.setProperty("--veil-x", `${originX}px`);
  veil.style.setProperty("--veil-y", `${originY}px`);
  veil.setAttribute("data-hole", "");
  const hole = veil.animate({ "--veil-r": ["0px", `${farthestCorner(originX, originY) + 8}px`] }, {
    duration: holeMilliseconds,
    easing: easeOut,
    fill: "forwards",
  });
  await settled(hole);
}

async function revealLang(): Promise<void> {
  if (!veil) return;
  const curtain = veil.animate([{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }], {
    duration: curtainMilliseconds,
    easing: readEasing("--ease-in-out", "ease-in-out"),
    fill: "forwards",
  });
  await settled(curtain);
}

async function revealFromVeil(): Promise<void> {
  const kind = root.getAttribute("data-veil");
  if (!kind) return;
  if (kind === "lang") {
    history.scrollRestoration = "manual";
    restoreScroll();
    window.addEventListener("load", restoreScroll, { once: true });
  }
  await Promise.race([document.fonts.ready, wait(400)]);
  await wait(60);
  if (kind === "lang") await revealLang();
  else await revealPage();
  resetVeil();
  if (kind === "lang") history.scrollRestoration = "auto";
}

function onClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest<HTMLAnchorElement>("a[href]");
  if (!anchor) return;

  const menu = anchor.closest<HTMLElement>("[popover]");
  if (menu) {
    try {
      menu.hidePopover();
    } catch {
      menu.removeAttribute("open");
    }
  }

  if (anchor.target && anchor.target !== "_self") return;
  if (anchor.hasAttribute("download")) return;
  const url = new URL(anchor.href, window.location.href);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (prefersReducedMotion()) return;

  const sameOrigin = url.origin === window.location.origin;
  if (sameOrigin && url.pathname === window.location.pathname && url.search === window.location.search) return;

  const kind: NavigationKind = anchor.dataset.nav === "lang" ? "lang" : sameOrigin ? "page" : "exit";
  event.preventDefault();
  const rect = anchor.getBoundingClientRect();
  void navigate(kind, url.href, rect.left + rect.width / 2, rect.top + rect.height / 2);
}

if (veil) {
  document.addEventListener("click", onClick);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) resetVeil();
  });
  void revealFromVeil();
}

export {};
