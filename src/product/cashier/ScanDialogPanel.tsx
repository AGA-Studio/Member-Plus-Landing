import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "../ui/Badge";
import { TextField } from "../ui/TextField";
import { Button } from "../ui/Button";
import type { Messages } from "@/i18n";

type ScanDialogPanelProps = {
  open: boolean;
  scanner: ReactNode;
  code: string;
  messages: Messages["product"]["cashier"]["scan"];
  closeLabel: string;
};

export function ScanDialogPanel({ open, scanner, code, messages, closeLabel }: ScanDialogPanelProps) {
  return (
    <div
      aria-hidden={!open}
      className={
        open
          ? "absolute inset-0 z-20 flex bg-foreground/40 opacity-100 backdrop-blur-md transition-opacity duration-200 ease-out"
          : "pointer-events-none absolute inset-0 z-20 flex bg-foreground/40 opacity-0 backdrop-blur-md transition-opacity duration-150 ease-out"
      }
    >
      <div
        role="dialog"
        aria-label={messages.title}
        className={
          open
            ? "m-auto flex w-11/12 max-w-md scale-100 flex-col overflow-hidden rounded-xl bg-surface text-foreground shadow-lg transition-transform duration-200 ease-out"
            : "m-auto flex w-11/12 max-w-md scale-95 flex-col overflow-hidden rounded-xl bg-surface text-foreground shadow-lg transition-transform duration-150 ease-out"
        }
      >
        <div className="flex min-h-0 flex-col gap-5 overflow-hidden p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-subheading text-foreground">{messages.title}</h2>
            <span aria-label={closeLabel} className="flex size-11 items-center justify-center rounded-md text-muted">
              <X aria-hidden strokeWidth={1.75} className="size-5" />
            </span>
          </div>
          <div className="flex flex-col items-start gap-3">
            <Badge tone="success">{messages.readerConnected}</Badge>
            <p className="text-base text-muted">{messages.subtitle}</p>
          </div>
          <div className="flex flex-col gap-6">
            {scanner}
            <div className="flex items-center gap-4" role="separator">
              <span aria-hidden className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted">{messages.orType}</span>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-row items-start gap-4">
              <div className="flex-1">
                <TextField
                  name="code"
                  label={messages.codeLabel}
                  placeholder={messages.codePlaceholder}
                  value={code}
                  readOnly
                  focused={open}
                  tabIndex={-1}
                />
              </div>
              <Button size="md" className="mt-7 sm:w-auto">
                {messages.search}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
