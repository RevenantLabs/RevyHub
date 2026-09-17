import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "operation-budget-planner",
  title: "Operation Budget Planner",
  description: "TODO: one sentence describing what this tool does.",
  character: "TODO: one in-world character line.",
  category: "transactions",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["operation-budget-planner"]
};
