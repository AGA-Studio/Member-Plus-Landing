import { useMemo } from "react";
import { motionValue } from "motion/react";
import { CashierScreen, type CashierView } from "@/product/cashier/CashierScreen";
import { createMember, createReceipt } from "@/product/data";
import { getMessages, type Locale } from "@/i18n";

const states: Record<string, (member: ReturnType<typeof createMember>) => CashierView & { receipt: boolean }> = {
  empty: () => ({ member: null, dialogOpen: false, scanFound: false, scanCode: "", amount: "", amountFocused: false, receipt: false }),
  dialog: () => ({ member: null, dialogOpen: true, scanFound: false, scanCode: "", amount: "", amountFocused: false, receipt: false }),
  member: (member) => ({ member, dialogOpen: false, scanFound: false, scanCode: "", amount: "", amountFocused: false, receipt: false }),
  amount: (member) => ({ member, dialogOpen: false, scanFound: false, scanCode: "", amount: "1000", amountFocused: true, receipt: false }),
  receipt: (member) => ({ member, dialogOpen: false, scanFound: false, scanCode: "", amount: "", amountFocused: false, receipt: true }),
};

export default function FidelityPreview() {
  const params = new URLSearchParams(window.location.search);
  const locale: Locale = params.get("lang") === "en" ? "en" : "es";
  const state = params.get("state") ?? "empty";
  const messages = getMessages(locale);
  const tierName = messages.tiers.gold;
  const member = useMemo(() => createMember(tierName), [tierName]);
  const view = (states[state] ?? states.empty)!(member);

  const scanOffset = useMemo(() => motionValue(0), []);
  const receiptY = useMemo(() => motionValue(view.receipt ? "0%" : "101%"), [view.receipt]);
  const toastY = useMemo(() => motionValue(-200), []);
  const cursor = useMemo(() => motionValue(-100), []);
  const cursorScale = useMemo(() => motionValue(1), []);

  return (
    <CashierScreen
      view={view}
      receipt={createReceipt(tierName, messages.product.concept)}
      formatter={{ locale }}
      messages={messages.product}
      businessName={messages.demo.businessName}
      businessInitials="CV"
      scanOffset={scanOffset}
      receiptY={receiptY}
      toastY={toastY}
      cursorX={cursor}
      cursorY={cursor}
      cursorScale={cursorScale}
      feed={null}
      scanButtonRef={null}
      submitRef={null}
      amountRef={null}
      rootRef={null}
    />
  );
}
