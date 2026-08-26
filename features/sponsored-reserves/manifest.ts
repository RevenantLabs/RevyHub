import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sponsored-reserves",
  title: "Sponsored Reserves Inspector",
  description: "TODO: one sentence describing what this tool does.",
  character: "TODO: one in-world character line.",
  category: "accounts",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["sponsored-reserves"]
};
