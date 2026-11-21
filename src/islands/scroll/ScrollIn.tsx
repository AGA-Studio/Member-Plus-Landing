import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, motionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { smooth } from "@/lib/track";

export type ScrollPose = {
  x?: number;
  y?: number;
  z?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
};

type ScrollInProps = {
  from: ScrollPose;
  children: ReactNode;
  start?: number;
  end?: number;
  perspective?: number;
  className?: string | undefined;
  origin?: string | undefined;
};

export function ScrollIn({ from, children, start = 0, end = 0.55, perspective = 1400, className }: ScrollInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const eased = useTransform(scrollYProgress, (value) => smooth((value - start) / (end - start)));
  const rest = useMemo(() => motionValue(1), []);
  const driver = reduced ? rest : eased;
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setSettled(driver.get() >= 0.9995);
  }, [driver]);

  useMotionValueEvent(driver, "change", (value) => {
    const next = value >= 0.9995;
    setSettled((current) => (current === next ? current : next));
  });

  const mix = (value: number | undefined, resting: number) =>
    useTransform(driver, (amount) => (value ?? resting) + (resting - (value ?? resting)) * amount);

  const x = mix(from.x, 0);
  const y = mix(from.y, 0);
  const z = mix(from.z, 0);
  const rotateX = mix(from.rotateX, 0);
  const rotateY = mix(from.rotateY, 0);
  const rotateZ = mix(from.rotateZ, 0);
  const scale = mix(from.scale, 1);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced || settled ? {} : { x, y, z, rotateX, rotateY, rotateZ, scale, transformPerspective: perspective }}>
        {children}
      </motion.div>
    </div>
  );
}
