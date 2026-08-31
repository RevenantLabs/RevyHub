import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "orderbook-viewer",
  title: "Order Book Viewer",
  description: "Inspect bids, asks, spread, depth and imbalance using deterministic decimal math.",
  character: "The market clerk lays every bid and ask side by side before you trade.",
  category: "network",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["orderbook-viewer"]
};
