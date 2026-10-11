import { ScrollText } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "account-offers-inspector",
  title: "Account Offers Inspector",
  description:
    "Inspect all open offers for a Stellar account, including selling/buying assets, amounts, and prices.",
  character: "Every open offer is a promise waiting to be kept — or cancelled.",
  category: "accounts",
  status: "working",
  icon: ScrollText,
  networks: ["testnet", "mainnet"],
  keywords: ["offers", "account", "trading", "horizon", "orderbook"],
};
