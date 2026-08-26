import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "asset-statistics",
  title: "Asset Supply and Holder Statistics",
  description: "TODO: one sentence describing what this tool does.",
  character: "TODO: one in-world character line.",
  category: "assets",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["asset-statistics"]
};
