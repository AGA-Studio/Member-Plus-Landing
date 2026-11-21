import type { ReactNode, Ref } from "react";
import { motion, type MotionValue } from "motion/react";
import { ScanLine } from "lucide-react";
import { Button } from "../ui/Button";
import { CashierHeader } from "./CashierHeader";
import { MemberSummary, MemberSummaryPlaceholder } from "./MemberSummary";
import { PurchaseForm } from "./PurchaseForm";
import { QrScanner } from "./QrScanner";
import { Receipt } from "./Receipt";
import { ScanDialogPanel } from "./ScanDialogPanel";
import { Toast } from "../ui/Toast";
import type { Member, Receipt as ReceiptData } from "../lib/domain";
import type { Formatter } from "../lib/format";
import type { Messages } from "@/i18n";

export type CashierView = {
  member: Member | null;
  dialogOpen: boolean;
  scanFound: boolean;
  scanCode: string;
  amount: string;
  amountFocused: boolean;
};

type CashierScreenProps = {
  view: CashierView;
  receipt: ReceiptData;
  formatter: Formatter;
  messages: Messages["product"];
  businessName: string;
  businessInitials: string;
  scanOffset: MotionValue<number>;
  receiptY: MotionValue<string>;
  toastY: MotionValue<number>;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  cursorScale: MotionValue<number>;
  feed: ReactNode;
  scanButtonRef: Ref<HTMLButtonElement>;
  submitRef: Ref<HTMLButtonElement>;
  amountRef: Ref<HTMLDivElement>;
  rootRef: Ref<HTMLDivElement>;
};

export function CashierScreen({
  view,
  receipt,
  formatter,
  messages,
  businessName,
  businessInitials,
  scanOffset,
  receiptY,
  toastY,
  cursorX,
  cursorY,
  cursorScale,
  feed,
  scanButtonRef,
  submitRef,
  amountRef,
  rootRef,
}: CashierScreenProps) {
  const cashier = messages.cashier;
  const hasMember = view.member !== null;

  return (
    <div ref={rootRef} className="product-screen relative h-225 w-360 overflow-hidden bg-background text-foreground">
      <div className="flex h-full flex-col overflow-hidden bg-background">
        <CashierHeader
          businessName={businessName}
          businessInitials={businessInitials}
          userName={messages.user.name}
          messages={cashier.header}
        />
        <main className="flex-1 overflow-hidden">
          <div className="flex min-h-full flex-col px-8 py-12">
            <div className="mx-auto flex w-full max-w-page flex-col gap-6">
              <div className="flex flex-row items-start justify-center gap-8">
                <div className="flex w-105 shrink-0 flex-col gap-4">
                  <Button ref={scanButtonRef} variant={hasMember ? "outline" : "primary"} size="lg" fullWidth>
                    <ScanLine aria-hidden strokeWidth={1.75} className="size-5" />
                    {hasMember ? cashier.scan.openAnother : cashier.scan.open}
                  </Button>
                  {view.member ? (
                    <MemberSummary
                      member={view.member}
                      businessName={businessName}
                      formatter={formatter}
                      messages={cashier.purchase.member}
                    />
                  ) : (
                    <MemberSummaryPlaceholder messages={cashier.purchase.member} />
                  )}
                </div>
                <div className="w-140">
                  <PurchaseForm
                    member={view.member}
                    amount={view.amount}
                    amountFocused={view.amountFocused}
                    useCashback={false}
                    formatter={formatter}
                    messages={cashier.purchase}
                    submitRef={submitRef}
                    amountRef={amountRef}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ScanDialogPanel
        open={view.dialogOpen}
        scanner={
          <QrScanner found={view.scanFound} scanOffset={scanOffset} messages={cashier.scan.scanner}>
            {feed}
          </QrScanner>
        }
        code={view.scanCode}
        messages={cashier.scan}
        closeLabel={messages.common.close}
      />

      <div className="pointer-events-none absolute inset-x-0 top-20 bottom-0 z-30 mt-px overflow-hidden">
        <motion.main style={{ y: receiptY }} className="size-full overflow-hidden bg-background">
          <div className="flex min-h-full flex-col px-8 py-12">
            <Receipt receipt={receipt} formatter={formatter} messages={cashier.receipt} />
          </div>
        </motion.main>
      </div>

      <motion.div style={{ y: toastY }} className="absolute top-6 right-6 z-40">
        <Toast message={messages.toastRegistered} dismissLabel={messages.common.dismissToast} />
      </motion.div>

      <motion.svg
        aria-hidden
        viewBox="0 0 24 24"
        style={{ x: cursorX, y: cursorY, scale: cursorScale }}
        className="pointer-events-none absolute top-0 left-0 z-50 size-8 origin-top-left drop-shadow-md"
      >
        <path d="M4 2.5 20 11l-7 2.2L10.2 20 4 2.5Z" className="fill-ink-950 stroke-white" strokeWidth={1.5} strokeLinejoin="round" />
      </motion.svg>
    </div>
  );
}
