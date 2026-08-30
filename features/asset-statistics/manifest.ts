import { ChartBarBig } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "asset-statistics",
  title: "Asset Supply and Holder Statistics",
  description:
    "Inspect an issued asset's circulating supply, holder authorization split, and issuer flags.",
  character: "A moon statistician counts every token and the trustline carrying it.",
  category: "assets",
  status: "working",
  icon: ChartBarBig,
  networks: ["testnet", "mainnet"],
  keywords: ["asset", "supply", "holders", "trustline", "authorization", "horizon"]
};
