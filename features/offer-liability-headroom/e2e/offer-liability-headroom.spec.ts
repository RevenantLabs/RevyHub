import { accountId } from "@/features/offer-liability-headroom/fixtures/offerLiabilityHeadroom.fixture";

export const spec = {
  route: "/tools/offer-liability-headroom",
  steps: [
    { action: "visit", target: "/tools/offer-liability-headroom" },
    { action: "expect", target: "heading", value: "Offer Liability and Capacity Audit" },
    { action: "expect", target: "text", value: "No liability snapshot yet" },
    { action: "fill", target: "Account address", value: accountId },
    { action: "click", target: "Audit offer liabilities" },
    { action: "expect", target: "text", value: "Active offers" },
    { action: "expect", target: "text", value: "Balances and liabilities" }
  ]
} as const;
