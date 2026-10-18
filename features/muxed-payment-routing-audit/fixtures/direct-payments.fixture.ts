import { baseAccount, common, senderAccount } from "@/features/muxed-payment-routing-audit/fixtures/muxedPaymentRoutingAudit.fixture";
export const directPayments = [
  { ...common, paging_token: "101", type: "payment", to: baseAccount, amount: "2.2500000" },
  { ...common, paging_token: "100", type: "create_account", account: baseAccount, starting_balance: "5.0000000" },
  { ...common, paging_token: "99", type: "payment", to: senderAccount, amount: "100.0000000" }
];
