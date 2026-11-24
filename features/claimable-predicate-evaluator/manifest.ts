import { GitBranch } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {
  slug: "claimable-predicate-evaluator", title: "Claimable Balance Predicate Evaluator",
  description: "Evaluate a pasted claim predicate at a chosen UTC time and inspect every branch.",
  character: "A clock and a decision tree show exactly which condition holds.",
  category: "assets", status: "beta", icon: GitBranch, networks: [], offline: true,
  keywords: ["claimable balance", "predicate", "claimant", "relative time", "XDR", "offline"]
};
