import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const lenis = new Lenis({ anchors: true });
    const root = document.documentElement;
    const syncLock = () => {
      if (root.hasAttribute("data-intro")) lenis.stop();
      else lenis.start();
    };
    syncLock();
    const lockObserver = new MutationObserver(syncLock);
    lockObserver.observe(root, { attributes: true, attributeFilter: ["data-intro"] });
    let frame = requestAnimationFrame(function tick(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    });

    return () => {
      lockObserver.disconnect();
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
