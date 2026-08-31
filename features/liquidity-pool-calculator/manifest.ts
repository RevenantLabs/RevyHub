import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "liquidity-pool-calculator",
  title: "Liquidity Pool Deposit and Withdraw Calculator",
  description: "Preview liquidity-pool deposits and withdrawals with integer-safe reserve math.",
  character: "The pool steward checks every share before you commit liquidity.",
  category: "assets",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["liquidity-pool-calculator"]
};
