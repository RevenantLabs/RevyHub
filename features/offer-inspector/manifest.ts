import { ArrowLeftRight } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "offer-inspector",
  title: "Account Offers Inspector",
  description:
    "Inspect an account's open DEX offers, price fractions, and the base reserve entries they consume.",
  character:
    "The order auditor tallies every open DEX offer, its exact fraction, and the base reserve it ties up.",
  category: "developer",
  status: "beta",
  icon: ArrowLeftRight,
  networks: ["testnet", "mainnet"],
  keywords: ["offers", "dex", "horizon", "account", "reserve", "orderbook", "liabilities"]
};
