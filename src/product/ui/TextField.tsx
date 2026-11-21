import { CircleAlert } from "lucide-react";
import { useId, type InputHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  focused?: boolean;
};

export function TextField({ label, hint, error, focused = false, className, type = "text", ...rest }: TextFieldProps) {
  const inputId = useId();
  const messageId = `${inputId}-message`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cx(
            "h-11 w-full rounded-md border bg-surface px-3 text-base text-foreground",
            "transition-[border-color,background-color] duration-150 ease-out placeholder:text-muted",
            "focus:border-primary focus-visible:outline-2 focus-visible:outline-offset-2",
            error ? "border-danger" : focused ? "border-primary outline-2 outline-offset-2 outline-ring" : "border-border-strong",
            className,
          )}
          {...rest}
        />
      </div>
      {error ? (
        <p id={messageId} role="alert" className="flex items-center gap-1.5 text-sm text-danger-text">
          <CircleAlert aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
