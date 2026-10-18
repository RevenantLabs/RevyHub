import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "claimable-balance-readiness",
  title: "Claimable Balance Claim Readiness",
  description:
    "Evaluate whether a named claimant appears eligible to claim one existing claimable balance at a chosen UTC time.",
  character: "Check the gate before you knock — predicates decide who may claim.",
  category: "assets",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: [
    "claimable balance",
    "claim readiness",
    "predicate",
    "claimant",
    "horizon"
  ]
};
