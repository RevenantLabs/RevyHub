import { Waves } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "liquidity-pool-id-calculator",
  title: "Liquidity Pool ID Calculator",
  description:
    "Compute a constant-product liquidity pool's deterministic ID from two reserve assets and a fee, entirely offline, before the pool necessarily exists.",
  character: "A cartographer who plots the pool's address before the water arrives.",
  category: "assets",
  status: "beta",
  icon: Waves,
  networks: [],
  offline: true,
  keywords: ["liquidity pool", "pool id", "constant product", "canonical order"]
};
