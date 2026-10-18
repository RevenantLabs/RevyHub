import { Table2 } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {
  slug: "multi-account-asset-exposure",
  title: "Multi-Account Asset Exposure Matrix",
  description: "Compare public balances across accounts, grouped by asset code and issuer.",
  character: "Line up the ledgers and see who holds each issued asset.",
  category: "assets",
  status: "working",
  icon: Table2,
  networks: ["testnet", "mainnet"],
  keywords: ["assets", "trustlines", "exposure", "accounts", "balances", "matrix"]
};
