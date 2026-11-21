import { cx } from "@/lib/cx";

type AvatarProps = {
  name: string;
  className?: string | undefined;
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cx(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-sm font-medium text-primary-text",
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
