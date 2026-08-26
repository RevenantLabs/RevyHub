import { BarChart3 } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "asset-statistics",
  title: "Asset Supply and Holder Statistics",
  description: "View circulating supply, trustline holder statistics, and issuer flags for any Stellar asset.",
  character: "The ledgers do not lie. Let us see who truly holds the power.",
  category: "assets",
  status: "beta",
  icon: BarChart3,
  networks: ["testnet", "mainnet"],
  keywords: ["assets", "supply", "holders", "statistics", "trustlines", "flags", "claimable balances"]
};
