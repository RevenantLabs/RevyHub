import type { FeatureManifest } from "@/core/registry/types";
import { Sparkles } from "lucide-react";

export const manifest: FeatureManifest = {
  slug: "claimable-balances",
  title: "Claimable Balance Explorer",
  description:
    "List claimable balances for a claimant account or look one up by ID, with each predicate translated into plain English.",
  character: "Who can claim this, and when? I read the predicates so you do not have to.",
  category: "assets",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["claimable-balances", "claimable balance", "predicate", "claimant"]
};
