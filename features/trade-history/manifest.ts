import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "trade-history",
  title: "Trade History Viewer",
  description: "Sort and paginate normalized trades while preserving network and transaction context.",
  character: "The archivist keeps every fill in chronological order, fees included.",
  category: "developer",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["trade-history"]
};
