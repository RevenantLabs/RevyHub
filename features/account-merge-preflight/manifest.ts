import { FileSearch } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "account-merge-preflight",
  title: "Account Merge Preflight Check",
  description: "Check if a Stellar account meets all prerequisites for being merged.",
  character: "Ensure the path is clear before we fold this account into the void.",
  category: "accounts",
  status: "beta",
  icon: FileSearch,
  networks: ["testnet", "mainnet"],
  keywords: ["account", "merge", "preflight", "check", "close"]
};
