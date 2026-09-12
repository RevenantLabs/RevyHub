import { GitCompare } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "network-comparison",
  title: "Testnet and Mainnet Comparison",
  description:
    "Show testnet and mainnet side by side: protocol versions, fees, reserves, and ledger status.",
  character: "Compare both Stellar networks side by side to spot protocol differences and fee divergence at a glance.",
  category: "network",
  status: "beta",
  icon: GitCompare,
  networks: ["testnet", "mainnet"],
  keywords: [
    "network-comparison",
    "testnet",
    "mainnet",
    "protocol",
    "comparison",
    "base fee",
    "base reserve",
    "ledger"
  ]
};
