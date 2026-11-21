import { Scan } from "lucide-react";
import type { ReactNode } from "react";
import { motion, type MotionValue } from "motion/react";
import { cx } from "@/lib/cx";
import type { Messages } from "@/i18n";

type QrScannerProps = {
  found: boolean;
  scanOffset: MotionValue<number>;
  messages: Messages["product"]["cashier"]["scan"]["scanner"];
  children?: ReactNode;
};

export function QrScanner({ found, scanOffset, messages, children }: QrScannerProps) {
  return (
    <div className="relative flex h-95 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-ink-800 to-ink-950">
      {children}
      <Scan
        aria-hidden
        size={224}
        absoluteStrokeWidth
        strokeWidth={4}
        className={cx("relative transition-colors duration-150 ease-out", found ? "text-success-soft" : "text-white")}
      />
      {!found ? (
        <motion.div
          aria-hidden
          style={{ y: scanOffset }}
          className="absolute h-0.5 w-40 rounded-full bg-accent-400"
        />
      ) : null}
      <p
        aria-live="polite"
        className="absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white"
      >
        {found ? messages.detected : messages.aim}
      </p>
      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-medium text-white">
        <span aria-hidden className="size-2 rounded-full bg-success-soft" />
        {messages.active}
      </div>
    </div>
  );
}
