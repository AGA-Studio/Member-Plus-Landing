import { Languages, LogOut } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { BusinessLogo } from "../ui/BusinessLogo";
import type { Messages } from "@/i18n";

type CashierHeaderProps = {
  businessName: string;
  businessInitials: string;
  userName: string;
  messages: Messages["product"]["cashier"]["header"];
};

const inverseIconButton =
  "flex size-11 items-center justify-center rounded-full text-ink-300 transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-97";

export function CashierHeader({ businessName, businessInitials, userName, messages }: CashierHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-ink-950 text-white">
      <div className="flex h-20 items-center justify-between gap-4 px-8">
        <div className="flex min-w-0 items-center gap-3">
          <BusinessLogo initials={businessInitials} className="size-12 text-base shadow-md" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-display text-lg font-semibold">{businessName}</span>
            <span className="truncate text-sm text-ink-300">{messages.workspace}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full">
            <Avatar name={userName} className="size-9 bg-white/10 text-white" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm leading-tight font-medium">{userName}</span>
            <span className="text-xs leading-tight text-ink-300">{messages.role}</span>
          </div>
          <span className={inverseIconButton}>
            <Languages aria-hidden strokeWidth={1.75} className="size-5" />
          </span>
          <span className={inverseIconButton}>
            <LogOut aria-hidden strokeWidth={1.75} className="size-5" />
          </span>
        </div>
      </div>
    </header>
  );
}
