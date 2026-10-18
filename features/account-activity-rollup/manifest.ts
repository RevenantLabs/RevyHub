import { ChartNoAxesCombined } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
import { copy } from "@/features/account-activity-rollup/copy";

export const manifest: FeatureManifest = {
  slug: "account-activity-rollup",
  title: copy.manifestTitle,
  description: copy.manifestDescription,
  character: copy.manifestCharacter,
  category: "accounts",
  status: "working",
  icon: ChartNoAxesCombined,
  networks: ["testnet", "mainnet"],
  keywords: ["account", "activity", "operations", "aggregate", "history"]
};
