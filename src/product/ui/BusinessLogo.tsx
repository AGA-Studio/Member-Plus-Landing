import { cx } from "@/lib/cx";

type BusinessLogoProps = {
  initials: string;
  className?: string | undefined;
};

export function BusinessLogo({ initials, className }: BusinessLogoProps) {
  return (
    <span
      className={cx(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-sm font-semibold text-primary-foreground",
        className,
      )}
    >
      <span aria-hidden>{initials}</span>
    </span>
  );
}
