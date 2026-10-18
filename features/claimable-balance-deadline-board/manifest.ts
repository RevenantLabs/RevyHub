import { Clock3 } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {
  slug: "claimable-balance-deadline-board", title: "Claimable Balance Deadline Board",
  description: "Inspect current claimant balances and their absolute, relative, and indeterminate time conditions.",
  character: "Read the clock, and keep the whole predicate in view.",
  category: "assets", status: "beta", icon: Clock3,
  networks: ["testnet", "mainnet"],
  keywords: ["claimable balance", "claimant", "deadline", "predicate", "trustline"]
};
