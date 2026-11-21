import { useEffect, useRef, type ReactNode } from "react";
import { motionValue, motion, type MotionValue } from "motion/react";
import { cx } from "@/lib/cx";

export const screenWidth = 1440;
export const screenHeight = 900;

type ScaledScreenProps = {
  children: ReactNode;
  width?: MotionValue<number>;
  className?: string | undefined;
};

export function ScaledScreen({ children, width, className }: ScaledScreenProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const scale = useRef(motionValue(0.5)).current;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => {
      const current = host.clientWidth;
      scale.set(current / screenWidth);
      width?.set(current);
    };
    const observer = new ResizeObserver(update);
    observer.observe(host);
    update();
    return () => observer.disconnect();
  }, [scale, width]);

  return (
    <div ref={hostRef} aria-hidden="true" inert className={cx("pointer-events-none relative aspect-16/10 w-full overflow-hidden bg-ink-950 select-none", className)}>
      <motion.div style={{ scale }} className="absolute top-0 left-0 origin-top-left">
        {children}
      </motion.div>
    </div>
  );
}
