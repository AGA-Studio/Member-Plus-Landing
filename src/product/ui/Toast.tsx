import { Check, X } from "lucide-react";
import { cx } from "@/lib/cx";

type ToastProps = {
  message: string;
  dismissLabel: string;
  className?: string | undefined;
};

export function Toast({ message, dismissLabel, className }: ToastProps) {
  return (
    <div
      className={cx(
        "flex w-fit max-w-xl min-w-72 items-center gap-3 rounded-lg bg-ink-900 py-1 pr-1 pl-3 text-white shadow-lg ring-1 ring-white/10",
        className,
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
        <Check aria-hidden strokeWidth={2.5} className="size-3.5" />
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <span
        aria-label={dismissLabel}
        className="flex size-11 shrink-0 items-center justify-center rounded-md text-ink-300"
      >
        <X aria-hidden strokeWidth={1.75} className="size-4" />
      </span>
    </div>
  );
}
