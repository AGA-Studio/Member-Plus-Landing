import { createElement, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { clamp } from "@/lib/track";

type MaskTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string | undefined;
};

function Word({ word, index, count, progress, live }: { word: string; index: number; count: number; progress: MotionValue<number>; live: boolean }) {
  const slot = 0.5 / Math.max(1, count);
  const y = useTransform(progress, (value) => `${(1 - clamp((value - index * slot) / 0.5)) * 115}%`);
  return (
    <span className="-my-1 inline-block overflow-hidden py-1 align-bottom">
      <motion.span style={live ? { y } : {}} className="inline-block">
        {word}
      </motion.span>
    </span>
  );
}

export function MaskText({ text, as = "h2", className }: MaskTextProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [live, setLive] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.55"] });
  const words = text.split(" ");

  useEffect(() => {
    setLive(!reduced);
  }, [reduced]);

  const children: ReactNode[] = [];
  words.forEach((word, index) => {
    children.push(<Word key={`${word}-${index}`} word={word} index={index} count={words.length} progress={scrollYProgress} live={live} />);
    if (index < words.length - 1) children.push(" ");
  });

  return createElement(as, { ref, className }, <span className="sr-only">{text}</span>, <span aria-hidden="true">{children}</span>);
}
