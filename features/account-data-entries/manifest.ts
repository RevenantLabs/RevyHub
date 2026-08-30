import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "account-data-entries",
  title: "Account Data Entry Viewer",
  description: "View key-value data entries on a Stellar account.",
  character: "Here is your account data.",
  category: "accounts",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["account-data-entries"]
};
