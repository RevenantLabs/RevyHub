import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "trade-aggregation-viewer",
  title: "Trade Aggregation Viewer",
  description: "Aggregate trades into deterministic time buckets with buy/sell volume and VWAP.",
  character: "The tape reader groups every fill so the market's pressure is visible at a glance.",
  category: "developer",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["trade-aggregation-viewer"]
};
