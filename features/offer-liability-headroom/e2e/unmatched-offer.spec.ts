import { accountId } from "@/features/offer-liability-headroom/fixtures/offerLiabilityHeadroom.fixture";

export const spec = {
  route: "/tools/offer-liability-headroom",
  steps: [
    { action: "visit", target: "/tools/offer-liability-headroom" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "fill", target: "Account address", value: accountId },
    { action: "click", target: "Audit offer liabilities" },
    { action: "expect", target: "text", value: "Some offers reference assets with no matching current balance row" }
  ]
} as const;
