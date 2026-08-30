import { Waves } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "liquidity-pool-inspector",
  title: "Liquidity Pool Inspector",
  description:
    "Look up a liquidity pool by ID and read its reserves, total shares, participant count, fee and implied prices.",
  character: "A tide reader decodes opaque pool hashes into the assets sloshing inside.",
  category: "assets",
  status: "working",
  icon: Waves,
  networks: ["testnet", "mainnet"],
  keywords: ["liquidity pool", "amm", "reserves", "shares", "fee", "price", "horizon"]
};
